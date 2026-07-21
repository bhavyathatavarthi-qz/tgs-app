import os
from pathlib import Path
from typing import List, Dict, Any

from app import config
from app.policy_loader import load_company_policies

# Disable PyTorch multithreading IPC shared memory to prevent Windows AppLocker shm.dll block
os.environ["USE_LIBTORCH"] = "1"
os.environ["TORCH_CPP_LOG_LEVEL"] = "ERROR"
os.environ["HF_HUB_DISABLE_XET"] = "1"
os.environ["HF_HUB_DISABLE_XET_STORAGE"] = "1"
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"

from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma

_embeddings_singleton = None

def get_embeddings_model():
    global _embeddings_singleton
    if _embeddings_singleton is None:
        print(f"[vectorStore] Loading embedding model '{config.EMBEDDING_MODEL}'...")
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            _embeddings_singleton = HuggingFaceEmbeddings(
                model_name=config.EMBEDDING_MODEL,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True}
            )
        except Exception as e:
            print(f"[vectorStore] HuggingFaceEmbeddings fallback via community: {e}")
            from langchain_community.embeddings import HuggingFaceEmbeddings
            _embeddings_singleton = HuggingFaceEmbeddings(
                model_name=config.EMBEDDING_MODEL,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True}
            )
    return _embeddings_singleton

def split_text(text: str, chunk_size: int = 800, chunk_overlap: int = 80) -> List[str]:
    """Text chunker splitting policy content into chunks."""
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - chunk_overlap
    return chunks

def policies_to_documents(policies: List[Dict[str, Any]]) -> List[Document]:
    docs = []
    for p in policies:
        page_content = "\n".join([
            f"{p['id']} — {p['title']}",
            f"Category: {p['category']}",
            f"Policy Statement: {p['statement']}",
            f"Authorized Role: {p['authorizedRole']}",
            f"Environment: {p['environment']}",
            f"Consent Required: {p['consentRequired']}"
        ])
        
        chunks = split_text(page_content, chunk_size=800, chunk_overlap=80)
        for idx, chunk in enumerate(chunks):
            docs.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "policyId": p["id"],
                        "title": p["title"],
                        "category": p["category"],
                        "authorizedRole": p["authorizedRole"],
                        "environment": p["environment"],
                        "consentRequired": p["consentRequired"],
                        "chunkIndex": idx,
                    }
                )
            )
    return docs

def store_path_for(slug: str) -> Path:
    return config.VECTOR_STORE_DIR / slug

def build_index_for_company(company_name: str) -> Chroma:
    entry = config.COMPANY_REGISTRY.get(company_name)
    if not entry:
        raise ValueError(f"Unknown company: {company_name}")

    print(f'[vectorStore] Building Chroma vector DB for "{company_name}" from {entry["source_file"]} ...')
    policies = load_company_policies(entry["source_file"])
    docs = policies_to_documents(policies)

    embeddings = get_embeddings_model()
    dir_path = store_path_for(entry["slug"])
    dir_path.mkdir(parents=True, exist_ok=True)

    store = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=str(dir_path),
        collection_name=entry["slug"],
    )
    print(f'[vectorStore] Chroma DB created with {len(policies)} policies ({len(docs)} chunks) for "{company_name}".')
    return store

def load_index_for_company(company_name: str) -> Chroma:
    entry = config.COMPANY_REGISTRY.get(company_name)
    if not entry:
        raise ValueError(f"Unknown company: {company_name}")

    dir_path = store_path_for(entry["slug"])
    has_index = (dir_path / "chroma.sqlite3").exists()

    if has_index and not config.REBUILD_INDEX_ON_START:
        print(f'[vectorStore] Loading cached Chroma vector store for "{company_name}" from {dir_path}')
        embeddings = get_embeddings_model()
        return Chroma(
            persist_directory=str(dir_path),
            embedding_function=embeddings,
            collection_name=entry["slug"],
        )

    return build_index_for_company(company_name)

_store_cache: Dict[str, Chroma] = {}

def get_store_for_company(company_name: str) -> Chroma:
    if company_name not in _store_cache:
        _store_cache[company_name] = load_index_for_company(company_name)
    return _store_cache[company_name]

def retrieve_policies(company_name: str, query: str, k: int = config.RETRIEVAL_TOP_K) -> List[Dict[str, Any]]:
    store = get_store_for_company(company_name)
    results = store.similarity_search_with_score(query, k=max(k * 2, k))

    seen = set()
    deduped = []
    for doc, distance in results:
        policy_id = doc.metadata.get("policyId")
        if not policy_id or policy_id in seen:
            continue
        seen.add(policy_id)
        
        relevance_score = round(max(0.0, 1.0 - (distance / 2.0)), 4)
        
        deduped.append({
            "policyId": policy_id,
            "title": doc.metadata.get("title", ""),
            "category": doc.metadata.get("category", ""),
            "authorizedRole": doc.metadata.get("authorizedRole", ""),
            "environment": doc.metadata.get("environment", ""),
            "consentRequired": doc.metadata.get("consentRequired", ""),
            "content": doc.page_content,
            "relevanceScore": relevance_score
        })
        if len(deduped) >= k:
            break
    return deduped

def warm_all_indexes():
    for name in config.COMPANY_REGISTRY.keys():
        get_store_for_company(name)

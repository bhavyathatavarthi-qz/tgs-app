import sys
from app import config
from app.vector_store import build_index_for_company

def main():
    print("[buildIndex] Pre-building vector store indexes for all registered companies...")
    for company_name in config.COMPANY_REGISTRY.keys():
        try:
            build_index_for_company(company_name)
        except Exception as e:
            print(f"[buildIndex] Error building index for {company_name}: {e}")
            sys.exit(1)
    print("[buildIndex] Done.")

if __name__ == "__main__":
    main()

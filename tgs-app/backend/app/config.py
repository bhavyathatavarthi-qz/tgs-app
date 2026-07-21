import os
from pathlib import Path
from dotenv import load_dotenv

# Disable Hugging Face Xet storage download to prevent Windows AppLocker hf_xet.pyd DLL block
os.environ["HF_HUB_DISABLE_XET"] = "1"
os.environ["HF_HUB_DISABLE_XET_STORAGE"] = "1"
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

PORT = int(os.getenv("PORT", "5000"))
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGIN", "http://localhost:3000,http://localhost:5173").split(",")
    if origin.strip()
]
RETRIEVAL_TOP_K = int(os.getenv("RETRIEVAL_TOP_K", "5"))
REBUILD_INDEX_ON_START = os.getenv("REBUILD_INDEX_ON_START", "true").lower() == "true"

DATA_DIR = BASE_DIR / "data"
VECTOR_STORE_DIR = BASE_DIR / "vectorstores"
AUDIT_LOG_FILE = DATA_DIR / "audit_logs.json"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

COMPANY_REGISTRY = {
    "ABC Bank": {
        "slug": "abc_bank",
        "source_file": DATA_DIR / "abc_bank.docx",
    },
    "XYZ Solutions": {
        "slug": "xyz_solutions",
        "source_file": DATA_DIR / "xyz_solutions.docx",
    },
}

ROLES = [
    "Developer",
    "Senior Developer",
    "QA Engineer",
    "DevOps Engineer",
    "Senior DevOps Engineer",
    "Database Administrator",
    "Senior DBA",
    "Infrastructure Engineer",
    "IAM Administrator",
    "Security Administrator",
    "Network Engineer",
    "Data Administrator",
    "ML Engineer",
    "Site Reliability Engineer",
    "Incident Commander",
    "Manager",
]

DEPARTMENTS = ["Engineering", "QA", "Infrastructure", "Security"]

ENVIRONMENTS = ["Development", "QA", "UAT", "Production"]

ZONES = {
    "Zone 1": {"label": "Auto Respond", "color": "green"},
    "Zone 2": {"label": "Ask Clarification", "color": "blue"},
    "Zone 3": {"label": "Escalate", "color": "orange"},
    "Zone 4": {"label": "Reject", "color": "red"},
}

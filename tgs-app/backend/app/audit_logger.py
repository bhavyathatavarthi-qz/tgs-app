import json
import threading
from pathlib import Path
from typing import List, Dict, Any

from app import config

_lock = threading.Lock()

def log_audit(audit_data: Dict[str, Any]) -> None:
    """Appends an evaluation record to the persistent JSON audit log file."""
    with _lock:
        audits = []
        file_path: Path = config.AUDIT_LOG_FILE
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    audits = json.load(f)
                    if not isinstance(audits, list):
                        audits = []
            except Exception as e:
                print(f"[AuditLogger] Warning: Could not read existing audit log: {e}")
                audits = []
        
        audits.append(audit_data)
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(audits, f, indent=2)
            print(f"[AuditLogger] Logged audit record {audit_data.get('requestId')} to {file_path}")

def get_all_audits() -> List[Dict[str, Any]]:
    """Returns all logged audit records from disk."""
    with _lock:
        file_path: Path = config.AUDIT_LOG_FILE
        if not file_path.exists():
            return []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except Exception as e:
            print(f"[AuditLogger] Error reading audit logs: {e}")
            return []

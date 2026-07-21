import re
from pathlib import Path
from typing import List, Dict, Any
import docx

FIELD_LABELS = [
    "Category",
    "Policy Statement",
    "Authorized Role",
    "Environment",
    "Consent Required",
]

def extract_raw_text(file_path: Path) -> str:
    """Extracts raw text from a policy .docx file."""
    if not Path(file_path).exists():
        raise FileNotFoundError(f"Policy source file not found: {file_path}")
    
    doc = docx.Document(str(file_path))
    full_text = []
    for para in doc.paragraphs:
        if para.text:
            full_text.append(para.text)
    return "\n".join(full_text)

def parse_policies(raw_text: str) -> List[Dict[str, Any]]:
    """
    Parses raw policy text into structured records.
    Source format per policy block:
      POL-XXX -- Title
      Category: ...
      Policy Statement: ...
      Authorized Role: ...
      Environment: ...
      Consent Required: ...
    """
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]

    header_regex = re.compile(r"^(POL-\d{3,})\s*[-–—]{1,2}\s*(.+)$", re.IGNORECASE)
    field_pattern = r"^(" + "|".join(FIELD_LABELS) + r")\s*:\s*(.*)$"
    field_regex = re.compile(field_pattern, re.IGNORECASE)

    records = []
    current = None
    active_field = None

    def flush_field():
        nonlocal current, active_field
        if current and active_field:
            current[active_field] = current[active_field].strip()
        active_field = None

    for line in lines:
        header_match = header_regex.match(line)
        if header_match:
            flush_field()
            if current:
                records.append(current)
            current = {
                "id": header_match.group(1).upper(),
                "title": header_match.group(2).strip(),
                "Category": "",
                "Policy Statement": "",
                "Authorized Role": "",
                "Environment": "",
                "Consent Required": "",
            }
            continue

        if not current:
            continue

        field_match = field_regex.match(line)
        if field_match:
            flush_field()
            label_matched = field_match.group(1).lower()
            label = next((l for l in FIELD_LABELS if l.lower() == label_matched), None)
            if label:
                active_field = label
                current[label] = field_match.group(2) or ""
        elif active_field:
            # Continuation of multi-line field
            current[active_field] += f" {line}"

    flush_field()
    if current:
        records.append(current)

    return [
        {
            "id": r["id"],
            "title": r["title"],
            "category": r["Category"],
            "statement": r["Policy Statement"],
            "authorizedRole": r["Authorized Role"],
            "environment": r["Environment"],
            "consentRequired": r["Consent Required"],
        }
        for r in records
    ]

def load_company_policies(source_file: Path) -> List[Dict[str, Any]]:
    """Loads and parses a company's policy document from disk."""
    raw_text = extract_raw_text(source_file)
    policies = parse_policies(raw_text)
    if not policies:
        raise ValueError(f"No policies could be parsed from {source_file}. Check document structure.")
    return policies

import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

from app import config
from app.vector_store import retrieve_policies
from app.groq_client import call_groq_json
from app.prompt_builder import SYSTEM_PROMPT, build_user_prompt

VALID_DECISIONS = ["APPROVED", "APPROVED_WITH_MODIFICATION", "HELD", "BLOCKED"]
VALID_STATUSES = ["pass", "warning", "fail"]
REQUIRED_CHECKS = [
    "Authorized Role",
    "Environment",
    "Consent",
    "Policy Compliance",
    "Accountability",
]

class CASPayload(BaseModel):
    riskScore: float = Field(..., ge=0, le=100)
    zone: str

    @field_validator("zone")
    def validate_zone(cls, v):
        if v not in config.ZONES:
            raise ValueError(f"cas.zone must be one of: {', '.join(config.ZONES.keys())}")
        return v

class GovernanceRequestPayload(BaseModel):
    username: str
    role: str
    department: str
    company: str
    environment: str
    query: str
    cas: CASPayload

    @field_validator("username", "role", "department", "environment", "query")
    def non_empty_str(cls, v, info):
        if not isinstance(v, str) or not v.strip():
            raise ValueError(f"'{info.field_name}' must be a non-empty string.")
        return v.strip()

    @field_validator("company")
    def validate_company(cls, v):
        if v not in config.COMPANY_REGISTRY:
            raise ValueError(f"'company' must be one of: {', '.join(config.COMPANY_REGISTRY.keys())}")
        return v

def parse_model_json(raw: str) -> Dict[str, Any]:
    """Best-effort JSON parsing of the LLM's response."""
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text, flags=re.IGNORECASE)
        text = re.sub(r"```$", "", text).strip()
    
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace == -1 or last_brace == -1:
        raise ValueError("Model response did not contain a JSON object.")
    
    json_str = text[first_brace:last_brace + 1]
    return json.loads(json_str)

def normalize_model_output(parsed: Dict[str, Any], retrieved_policies: List[Dict[str, Any]]) -> Dict[str, Any]:
    decision = parsed.get("decision") if parsed.get("decision") in VALID_DECISIONS else "HELD"

    incoming_checks = parsed.get("checks") if isinstance(parsed.get("checks"), list) else []
    checks = []
    for req_name in REQUIRED_CHECKS:
        found = next(
            (c for c in incoming_checks if isinstance(c, dict) and str(c.get("name", "")).lower() == req_name.lower()),
            None
        )
        status = found.get("status") if found and found.get("status") in VALID_STATUSES else "warning"
        detail = (
            found.get("detail", "").strip()
            if found and isinstance(found.get("detail"), str) and found.get("detail").strip()
            else "Not explicitly evaluated by the reasoning model; treat as requiring manual review."
        )
        checks.append({"name": req_name, "status": status, "detail": detail})

    policy_lookup = {p["policyId"]: p for p in retrieved_policies}
    incoming_policies = parsed.get("policies") if isinstance(parsed.get("policies"), list) else []
    policies = []
    
    for p in incoming_policies:
        if isinstance(p, dict) and p.get("id") in policy_lookup:
            source = policy_lookup[p["id"]]
            policies.append({
                "id": p["id"],
                "title": str(p.get("title", "")).strip() or source["title"],
                "category": source["category"],
                "summary": str(p.get("summary", "")).strip() or source["content"],
            })

    # Fallback if model cited nothing usable
    if not policies:
        for p in retrieved_policies[:5]:
            policies.append({
                "id": p["policyId"],
                "title": p["title"],
                "category": p["category"],
                "summary": f"Authorized Role: {p['authorizedRole']} · Environment: {p['environment']} · Consent Required: {p['consentRequired']}"
            })

    reason = (
        parsed.get("reason", "").strip()
        if isinstance(parsed.get("reason"), str) and parsed.get("reason").strip()
        else "The reasoning model did not return a detailed explanation for this decision. Manual review is recommended."
    )

    recommendation = (
        parsed.get("recommendation", "").strip()
        if isinstance(parsed.get("recommendation"), str) and parsed.get("recommendation").strip()
        else "Route to an administrator for manual review."
    )

    return {
        "decision": decision,
        "checks": checks,
        "policies": policies,
        "reason": reason,
        "recommendation": recommendation,
    }

import re

def evaluate_governance(payload: Dict[str, Any]) -> Dict[str, Any]:
    # Validate payload
    request_data = GovernanceRequestPayload(**payload)
    
    zone_meta = config.ZONES[request_data.cas.zone]
    req_dict = request_data.model_dump()
    req_dict["cas"]["zoneLabel"] = zone_meta["label"]
    req_dict["cas"]["zoneColor"] = zone_meta["color"]

    retrieved_policies = retrieve_policies(
        request_data.company, request_data.query, config.RETRIEVAL_TOP_K
    )

    user_prompt = build_user_prompt(req_dict, retrieved_policies)
    raw_model_response = call_groq_json(SYSTEM_PROMPT, user_prompt)

    parsed = parse_model_json(raw_model_response)
    normalized = normalize_model_output(parsed, retrieved_policies)

    audit_record = {
        "requestId": str(uuid.uuid4()),
        "evaluatedAt": datetime.now(timezone.utc).isoformat(),
        "requester": {
            "username": req_dict.get("username"),
            "role": req_dict.get("role"),
            "department": req_dict.get("department"),
            "company": req_dict.get("company"),
            "environment": req_dict.get("environment"),
            "query": req_dict.get("query"),
        },
        "company": req_dict["company"],
        "cas": req_dict["cas"],
        **normalized,
    }

    # Log audit record to JSON file on disk
    try:
        from app.audit_logger import log_audit
        log_audit(audit_record)
    except Exception as e:
        print(f"[TGS] Warning: Failed to persist audit record: {e}")

    return audit_record

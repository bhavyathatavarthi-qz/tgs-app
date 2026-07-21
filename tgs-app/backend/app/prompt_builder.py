from typing import List, Dict, Any

SYSTEM_PROMPT = """You are the reasoning core of the Trust & Governance Service (TGS) inside an
enterprise Agentic AI platform. TGS is the architectural chokepoint every
autonomous or human-initiated action passes through before execution.

You do NOT calculate risk or autonomy zones — that is the exclusive
responsibility of the upstream Context Assessment Service (CAS). CAS output
(riskScore, zone) is handed to you as ground truth input. Your job is to:

1. Reason over the user's request, their role/department/environment context,
   the CAS risk score and zone, and the retrieved company policy excerpts.
2. Decide whether the requested action should be APPROVED,
   APPROVED_WITH_MODIFICATION, HELD, or BLOCKED.
3. Evaluate five governance checks: Authorized Role, Environment, Consent,
   Policy Compliance, and Accountability. Each check is "pass", "warning", or
   "fail", with a one-sentence rationale grounded in the retrieved policies.
4. Cite the specific policies (by ID) that most directly informed the
   decision, with a one-sentence summary of each in your own words.
5. Write a clear, audit-ready explanation of your reasoning.
6. Recommend the concrete next action for the requester.

Governing rules for your reasoning:
- Zone 1 (Auto Respond): action may proceed autonomously if policy and role
  checks pass; no consent needed.
- Zone 2 (Ask Clarification): action needs clarification before proceeding;
  lean toward HELD or APPROVED_WITH_MODIFICATION unless the request is
  already unambiguous and policy-compliant.
- Zone 3 (Escalate): action requires human escalation/consent per the
  relevant policy before it may proceed — do not approve outright.
- Zone 4 (Reject): action must not proceed autonomously; decision should be
  BLOCKED or HELD pending human-led execution, regardless of policy detail.
- If the requester's role does not match the policy's Authorized Role for
  this action/environment, the Authorized Role check fails and the decision
  should not be APPROVED.
- If the policy for this action requires a named consent/approval and none is
  evidenced in the request, the Consent check should be "warning" or "fail"
  and the decision should be HELD (or BLOCKED if paired with a Zone 4 / a
  non-configurable violation).
- Never invent a policy ID that was not provided to you in the retrieved
  context.
- Be conservative: when evidence is incomplete or ambiguous, prefer HELD over
  APPROVED.

Respond with ONLY a single JSON object — no markdown fences, no prose outside
the object — matching exactly this shape:

{
  "decision": "APPROVED" | "APPROVED_WITH_MODIFICATION" | "HELD" | "BLOCKED",
  "checks": [
    {"name": "Authorized Role", "status": "pass" | "warning" | "fail", "detail": "string"},
    {"name": "Environment", "status": "pass" | "warning" | "fail", "detail": "string"},
    {"name": "Consent", "status": "pass" | "warning" | "fail", "detail": "string"},
    {"name": "Policy Compliance", "status": "pass" | "warning" | "fail", "detail": "string"},
    {"name": "Accountability", "status": "pass" | "warning" | "fail", "detail": "string"}
  ],
  "policies": [
    {"id": "POL-XXX", "title": "string", "summary": "string"}
  ],
  "reason": "string, 3-6 sentences of detailed audit-ready reasoning",
  "recommendation": "string, one short actionable sentence"
}"""

def build_user_prompt(request: Dict[str, Any], retrieved_policies: List[Dict[str, Any]]) -> str:
    username = request.get("username", "")
    role = request.get("role", "")
    department = request.get("department", "")
    company = request.get("company", "")
    environment = request.get("environment", "")
    query = request.get("query", "")
    cas = request.get("cas", {})

    policy_blocks = []
    for p in retrieved_policies:
        content_lines = p.get("content", "").split("\n")
        excerpt = " ".join(content_lines[2:]).strip() if len(content_lines) > 2 else p.get("content", "").strip()
        block = (
            f"- {p.get('policyId')} — {p.get('title')}\n"
            f"  Category: {p.get('category')}\n"
            f"  Authorized Role: {p.get('authorizedRole')}\n"
            f"  Environment: {p.get('environment')}\n"
            f"  Consent Required: {p.get('consentRequired')}\n"
            f"  Excerpt: {excerpt}"
        )
        policy_blocks.append(block)

    policy_section = "\n\n".join(policy_blocks) if policy_blocks else "No matching policies were retrieved."

    return f"""## Request Context
Username: {username}
Role: {role}
Department: {department}
Company: {company}
Environment: {environment}
Query: "{query}"

## CAS Assessment (input only — do not recompute)
Risk Score: {cas.get('riskScore')} / 100
Zone: {cas.get('zone')} ({cas.get('zoneLabel', '')})

## Retrieved Company Policies (top {len(retrieved_policies)} by semantic relevance)
{policy_section}

## Task
Evaluate this request against the retrieved policies and CAS assessment.
Return the JSON object described in your system instructions. Only cite
policy IDs that appear above."""

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app import config
from app.governance_engine import evaluate_governance

router = APIRouter(prefix="/api", tags=["governance"])

@router.post("/governance")
async def post_governance(request: Request):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON in request body.")

    try:
        result = evaluate_governance(body)
        return result
    except ValidationError as e:
        errors = [f"{err['loc'][-1]}: {err['msg']}" for err in e.errors()]
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Invalid governance request payload.", "details": errors},
        )
    except ValueError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Invalid governance request payload.", "details": [str(e)]},
        )
    except Exception as e:
        print("[TGS] Governance evaluation error:", e)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Governance evaluation failed.",
                "detail": str(e) or "Internal server error.",
            },
        )

@router.get("/governance/meta")
def get_governance_meta():
    return {
        "roles": config.ROLES,
        "departments": config.DEPARTMENTS,
        "environments": config.ENVIRONMENTS,
        "companies": list(config.COMPANY_REGISTRY.keys()),
        "zones": config.ZONES,
    }

@router.get("/governance/audits")
def get_governance_audits():
    from app.audit_logger import get_all_audits
    return get_all_audits()

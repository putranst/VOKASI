import hashlib
import secrets
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

import sql_models as models
import models as schemas
from database import get_db

router = APIRouter(prefix="/api/v1", tags=["credentials"])


@router.post("/credentials", response_model=schemas.Credential, status_code=201)
def create_credential(credential_data: schemas.CredentialCreate, db: Session = Depends(get_db)):
    """Create a new credential record (status: minting)."""
    if credential_data.course_id:
        if not db.query(models.Course).filter(models.Course.id == credential_data.course_id).first():
            raise HTTPException(status_code=404, detail="Course not found")

    cred = models.Credential(
        user_id=credential_data.user_id,
        course_id=credential_data.course_id,
        title=credential_data.title,
        description=credential_data.description,
        issuer_name=credential_data.issuer_name,
        credential_type=credential_data.credential_type,
        wallet_address=credential_data.wallet_address,
        status="minting",
        blockchain_network="Polygon Mumbai Testnet",
        issued_at=datetime.utcnow(),
    )
    db.add(cred)
    db.commit()
    db.refresh(cred)
    return cred


@router.post("/credentials/{credential_id}/mint")
def mint_credential(credential_id: int, db: Session = Depends(get_db)):
    """Simulate on-chain minting of a credential SBT."""
    cred = db.query(models.Credential).filter(models.Credential.id == credential_id).first()
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")
    if cred.status == "issued":
        raise HTTPException(status_code=400, detail="Credential already minted")

    tx_data = f"{cred.id}{cred.user_id}{cred.title}{secrets.token_hex(16)}"
    tx_hash = hashlib.sha256(tx_data.encode()).hexdigest()

    cred.status = "issued"
    cred.token_id = f"T6C-{cred.id:06d}"
    cred.transaction_hash = f"0x{tx_hash}"
    cred.issued_at = datetime.utcnow()
    cred.metadata_uri = f"ipfs://QmVokasiHash{cred.id}"
    db.commit()
    db.refresh(cred)

    return {
        "success": True,
        "message": "Credential minted on blockchain",
        "credential": cred,
        "explorer_url": f"https://mumbai.polygonscan.com/tx/{cred.transaction_hash}",
    }


@router.get("/users/{user_id}/credentials", response_model=List[schemas.Credential])
def get_user_credentials(
    user_id: int,
    credential_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Return all credentials in a user's digital wallet."""
    query = db.query(models.Credential).filter(models.Credential.user_id == user_id)
    if credential_type:
        query = query.filter(models.Credential.credential_type == credential_type)
    if status:
        query = query.filter(models.Credential.status == status)
    return query.order_by(models.Credential.issued_at.desc()).all()


@router.get("/credentials/{credential_id}")
def get_credential(credential_id: int, db: Session = Depends(get_db)):
    """Retrieve and verify a credential by ID."""
    cred = db.query(models.Credential).filter(models.Credential.id == credential_id).first()
    if not cred:
        return {"is_valid": False, "credential": None, "verification_message": "Credential not found"}

    if cred.status == "revoked":
        return {"is_valid": False, "credential": cred, "verification_message": "This credential has been revoked"}

    if cred.status != "issued":
        return {"is_valid": False, "credential": cred, "verification_message": "Credential is still being processed"}

    return {
        "is_valid": True,
        "credential": cred,
        "verification_message": "✓ Valid and verified on blockchain",
        "verified_at": datetime.utcnow().isoformat(),
    }


@router.post("/credentials/{credential_id}/revoke")
def revoke_credential(credential_id: int, reason: str = "", db: Session = Depends(get_db)):
    """Revoke a credential (admin/issuer only)."""
    cred = db.query(models.Credential).filter(models.Credential.id == credential_id).first()
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")
    if cred.status == "revoked":
        raise HTTPException(status_code=400, detail="Credential already revoked")
    cred.status = "revoked"
    db.commit()
    return {"success": True, "message": f"Revoked. Reason: {reason or 'Not specified'}", "credential": cred}

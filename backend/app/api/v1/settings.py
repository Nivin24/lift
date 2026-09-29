from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import AICredentials, User, ActivityLog
from app.schemas.schemas import AISettingsCreate, AISettingsOut
from app.core.security import encrypt_credential, decrypt_credential, mask_api_key
from app.api.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/ai", response_model=AISettingsOut)
def get_ai_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creds = db.query(AICredentials).filter(
        AICredentials.user_id == current_user.id,
        AICredentials.provider == "gemini",
        AICredentials.is_active == True
    ).first()

    if not creds:
        return {
            "provider": "gemini",
            "model_name": "gemini-2.5-flash",
            "is_configured": False,
            "masked_key": None,
            "available_models": [
                "gemini-2.5-flash",
                "gemini-2.5-pro",
                "gemini-1.5-flash",
                "gemini-1.5-pro"
            ]
        }

    try:
        raw_key = decrypt_credential(creds.encrypted_api_key)
        masked = mask_api_key(raw_key)
    except Exception:
        masked = "••••••••••••"

    return {
        "provider": creds.provider,
        "model_name": creds.model_name,
        "is_configured": True,
        "masked_key": masked,
        "available_models": [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ]
    }

@router.post("/ai", response_model=AISettingsOut)
def save_ai_settings(
    settings_in: AISettingsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Saves or updates BYOK AI key.
    The key is encrypted at rest using server encryption secret.
    Raw keys are never logged or stored plaintext.
    """
    clean_key = settings_in.api_key.strip()
    if not clean_key:
        raise HTTPException(status_code=400, detail="API Key cannot be empty.")

    encrypted_val = encrypt_credential(clean_key)

    creds = db.query(AICredentials).filter(
        AICredentials.user_id == current_user.id,
        AICredentials.provider == settings_in.provider
    ).first()

    if not creds:
        creds = AICredentials(
            user_id=current_user.id,
            provider=settings_in.provider,
            model_name=settings_in.model_name,
            encrypted_api_key=encrypted_val,
            is_active=True
        )
        db.add(creds)
    else:
        creds.model_name = settings_in.model_name
        creds.encrypted_api_key = encrypted_val
        creds.is_active = True

    db.commit()

    act = ActivityLog(
        user_id=current_user.id,
        action_type="SETTINGS_UPDATED",
        description=f"Updated {settings_in.provider.upper()} API configuration ({settings_in.model_name})"
    )
    db.add(act)
    db.commit()

    return {
        "provider": creds.provider,
        "model_name": creds.model_name,
        "is_configured": True,
        "masked_key": mask_api_key(clean_key),
        "available_models": [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ]
    }

@router.delete("/ai")
def remove_ai_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creds = db.query(AICredentials).filter(
        AICredentials.user_id == current_user.id,
        AICredentials.provider == "gemini"
    ).first()

    if creds:
        db.delete(creds)
        db.commit()

    return {"message": "AI credentials removed successfully."}

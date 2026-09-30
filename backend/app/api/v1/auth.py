from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.entities import User, ActivityLog
from app.schemas.schemas import (
    UserRegister, UserLogin, UserOut, Token, PasswordResetRequest, PasswordResetConfirm, StudentOnboardingUpdate
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A user with that username or email already exists."
        )

    user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name or user_in.username,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Activity log
    act = ActivityLog(
        user_id=user.id,
        action_type="USER_REGISTERED",
        description=f"Account created for {user.username}"
    )
    db.add(act)
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == login_data.username_or_email) | (User.email == login_data.username_or_email)
    ).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled.")

    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/forgot-password")
def forgot_password(reset_req: PasswordResetRequest, db: Session = Depends(get_db)):
    query_val = reset_req.username_or_email.strip()
    user = db.query(User).filter(
        (User.username == query_val) | (User.email == query_val)
    ).first()
    if not user:
        return {
            "message": "If an account matches that username or email, reset access is verified.",
            "user_exists": False
        }

    return {
        "message": f"Account verified for {user.username}. You may now set a new password.",
        "user_exists": True,
        "username": user.username,
        "email": user.email
    }

@router.post("/reset-password", response_model=Token)
def reset_password(confirm_data: PasswordResetConfirm, db: Session = Depends(get_db)):
    query_val = confirm_data.username_or_email.strip()
    user = db.query(User).filter(
        (User.username == query_val) | (User.email == query_val)
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.hashed_password = get_password_hash(confirm_data.new_password)
    db.commit()

    # Activity log
    act = ActivityLog(
        user_id=user.id,
        action_type="PASSWORD_RESET",
        description=f"Password updated for {user.username}"
    )
    db.add(act)
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out."}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/onboarding", response_model=UserOut)
def update_onboarding(
    onboarding_data: StudentOnboardingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if onboarding_data.selected_domain is not None:
        current_user.selected_domain = onboarding_data.selected_domain
    if onboarding_data.experience_level is not None:
        current_user.experience_level = onboarding_data.experience_level
    if onboarding_data.primary_goal is not None:
        current_user.primary_goal = onboarding_data.primary_goal
    if onboarding_data.daily_commitment_hours is not None:
        current_user.daily_commitment_hours = onboarding_data.daily_commitment_hours
    if onboarding_data.target_completion_date is not None:
        current_user.target_completion_date = onboarding_data.target_completion_date
    current_user.onboarding_completed = onboarding_data.onboarding_completed
    db.commit()
    db.refresh(current_user)

    # Activity log
    act = ActivityLog(
        user_id=current_user.id,
        action_type="ONBOARDING_COMPLETED",
        description=f"Domain selected: {current_user.selected_domain} | Goal: {current_user.primary_goal}"
    )
    db.add(act)
    db.commit()

    return current_user


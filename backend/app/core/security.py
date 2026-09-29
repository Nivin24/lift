from datetime import datetime, timedelta
from typing import Optional, Any
import bcrypt
from jose import jwt
from cryptography.fernet import Fernet
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    # Truncate to 72 bytes if necessary per bcrypt spec
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Fernet cipher for BYOK credentials encryption at rest
_cipher: Optional[Fernet] = None

def get_cipher() -> Fernet:
    global _cipher
    if _cipher is None:
        try:
            _cipher = Fernet(settings.ENCRYPTION_SECRET.encode())
        except Exception:
            key = Fernet.generate_key()
            _cipher = Fernet(key)
    return _cipher

def encrypt_credential(raw_secret: str) -> str:
    if not raw_secret:
        return ""
    cipher = get_cipher()
    encrypted_bytes = cipher.encrypt(raw_secret.encode("utf-8"))
    return encrypted_bytes.decode("utf-8")

def decrypt_credential(encrypted_secret: str) -> str:
    if not encrypted_secret:
        return ""
    cipher = get_cipher()
    decrypted_bytes = cipher.decrypt(encrypted_secret.encode("utf-8"))
    return decrypted_bytes.decode("utf-8")

def mask_api_key(raw_key: str) -> str:
    if not raw_key:
        return ""
    if len(raw_key) <= 8:
        return "••••••••"
    return f"••••••••••••{raw_key[-4:]}"

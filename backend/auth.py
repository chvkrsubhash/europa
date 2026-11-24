from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.config import settings
from backend.database import get_users_col

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    if not credentials:
        # Default guest / local developer user
        users = get_users_col()
        dev_user = await users.find_one({"email": "developer@akashavyom.com"})
        if not dev_user:
            dev_user = {
                "id": "user-akashavyom-dev-01",
                "email": "developer@akashavyom.com",
                "full_name": "AkashaVyom Scholar",
                "password_hash": hash_password("europa2026"),
                "avatar_url": "",
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
            await users.insert_one(dev_user)
        return dev_user
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        users = get_users_col()
        user = await users.find_one({"id": user_id})
        return user
    except JWTError:
        return None

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    user = await get_current_user_optional(credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials could not be validated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


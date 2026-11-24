from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models import UserCreate, UserLogin, UserResponse
from backend.auth import hash_password, verify_password, create_access_token, get_current_user
from backend.database import get_users_col

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
async def register(user_in: UserCreate):
    users = get_users_col()
    existing = await users.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    new_user = {
        "id": f"usr_{int(datetime.utcnow().timestamp()*1000)}",
        "email": user_in.email.lower(),
        "password_hash": hash_password(user_in.password),
        "full_name": user_in.full_name,
        "avatar_url": user_in.avatar_url or "",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    await users.insert_one(new_user)
    token = create_access_token({"sub": new_user["id"], "email": new_user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "full_name": new_user["full_name"],
            "avatar_url": new_user["avatar_url"]
        }
    }

@router.post("/login")
async def login(credentials: UserLogin):
    users = get_users_col()
    user = await users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name", "Europa User"),
            "avatar_url": user.get("avatar_url", "")
        }
    }

@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user.get("full_name", "Europa User"),
        "avatar_url": current_user.get("avatar_url", "")
    }

# Titan Integration: Unified auth SSO endpoint
@router.post("/titan-sso")
async def titan_sso(data: Dict[str, Any]):
    titan_token = data.get("titan_token")
    titan_user = data.get("titan_user", {})
    email = titan_user.get("email", "titan.user@akashavyom.com")
    full_name = titan_user.get("full_name", "Titan User")
    
    users = get_users_col()
    user = await users.find_one({"email": email.lower()})
    if not user:
        user = {
            "id": f"usr_titan_{int(datetime.utcnow().timestamp())}",
            "email": email.lower(),
            "password_hash": hash_password("titan_federated_sso"),
            "full_name": full_name,
            "avatar_url": titan_user.get("avatar_url", ""),
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        await users.insert_one(user)
    
    token = create_access_token({"sub": user["id"], "email": user["email"], "source": "titan"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name"),
            "avatar_url": user.get("avatar_url")
        }
    }


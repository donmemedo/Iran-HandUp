from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from ..db import get_session
from ..models import User
from ..schemas import Token, UserCreate, UserLogin, UserRead
from ..security import create_access_token, current_user, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register(data: UserCreate, session: Session = Depends(get_session)):
    exists = session.exec(select(User).where(User.email == data.email)).first()
    if exists:
        raise HTTPException(400, "این رایانامه قبلاً ثبت شده است")
    user = User(
        email=data.email,
        full_name=data.full_name,
        password_hash=hash_password(data.password),
        role=data.role,
        city=data.city,
    )
    session.add(user)
    session.commit()
    return Token(access_token=create_access_token(user.email))


@router.post("/login", response_model=Token)
def login(data: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "رایانامه یا رمز عبور نادرست است")
    return Token(access_token=create_access_token(user.email))


@router.post("/token", response_model=Token, include_in_schema=False)
def token(
    form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)
):
    return login(UserLogin(email=form.username, password=form.password), session)


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(current_user)):
    return user

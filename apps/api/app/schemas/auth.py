from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    accessToken: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    imageUrl: str | None = None

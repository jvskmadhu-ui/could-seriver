from datetime import datetime

from pydantic import BaseModel


class FileItem(BaseModel):
    id: str
    name: str
    mimeType: str
    sizeBytes: int
    ownerId: str
    folderId: str | None
    isDeleted: bool
    createdAt: datetime
    updatedAt: datetime


class FileUpdate(BaseModel):
    name: str | None = None
    folderId: str | None = None


class ShareCreate(BaseModel):
    resourceType: str
    resourceId: str
    granteeUserId: str
    role: str


class LinkShareCreate(BaseModel):
    resourceType: str
    resourceId: str
    expiresAt: datetime | None = None
    password: str | None = None


class StarToggle(BaseModel):
    resourceType: str
    resourceId: str


class RestoreRequest(BaseModel):
    resourceType: str
    resourceId: str

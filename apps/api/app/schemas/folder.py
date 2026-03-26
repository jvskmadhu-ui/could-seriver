from datetime import datetime

from pydantic import BaseModel


class FolderCreate(BaseModel):
    name: str
    parentId: str | None = None


class FolderUpdate(BaseModel):
    name: str | None = None
    parentId: str | None = None


class FolderItem(BaseModel):
    id: str
    name: str
    ownerId: str
    parentId: str | None
    isDeleted: bool
    createdAt: datetime
    updatedAt: datetime


class FolderContentsResponse(BaseModel):
    folder: FolderItem | None
    folders: list[FolderItem]
    files: list[dict]
    path: list[FolderItem]

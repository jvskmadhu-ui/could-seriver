from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.file import File
from app.models.folder import Folder
from app.models.user import User
from app.schemas.folder import FolderCreate, FolderUpdate
from app.utils.mappers import file_to_dict, folder_to_dict


router = APIRouter()


def build_path(db: Session, folder: Folder | None) -> list[dict]:
    path: list[dict] = []
    current = folder
    while current:
        path.append(folder_to_dict(current))
        current = db.get(Folder, current.parent_id) if current.parent_id else None
    return list(reversed(path))


@router.post("/")
def create_folder(
    payload: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folder = Folder(name=payload.name, parent_id=payload.parentId, owner_id=current_user.id)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return {"folder": folder_to_dict(folder)}


@router.get("/root")
def get_root(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folders = db.scalars(
        select(Folder).where(
            Folder.owner_id == current_user.id,
            Folder.parent_id.is_(None),
            Folder.is_deleted.is_(False),
        )
    ).all()
    files = db.scalars(
        select(File).where(
            File.owner_id == current_user.id,
            File.folder_id.is_(None),
            File.is_deleted.is_(False),
        )
    ).all()
    return {"folder": None, "folders": [folder_to_dict(folder) for folder in folders], "files": [file_to_dict(file) for file in files], "path": []}


@router.get("/{folder_id}")
def get_folder(
    folder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folder = db.get(Folder, folder_id)
    if not folder or folder.owner_id != current_user.id or folder.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")

    folders = db.scalars(
        select(Folder).where(
            Folder.parent_id == folder_id,
            Folder.owner_id == current_user.id,
            Folder.is_deleted.is_(False),
        )
    ).all()
    files = db.scalars(
        select(File).where(
            File.folder_id == folder_id,
            File.owner_id == current_user.id,
            File.is_deleted.is_(False),
        )
    ).all()
    return {
        "folder": folder_to_dict(folder),
        "folders": [folder_to_dict(item) for item in folders],
        "files": [file_to_dict(item) for item in files],
        "path": build_path(db, folder),
    }


@router.patch("/{folder_id}")
def update_folder(
    folder_id: str,
    payload: FolderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folder = db.get(Folder, folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")

    if payload.name is not None:
        folder.name = payload.name
    if payload.parentId is not None:
        folder.parent_id = payload.parentId

    db.commit()
    db.refresh(folder)
    return {"folder": folder_to_dict(folder)}


@router.delete("/{folder_id}")
def delete_folder(
    folder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folder = db.get(Folder, folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")

    folder.is_deleted = True
    db.commit()
    return {"success": True}

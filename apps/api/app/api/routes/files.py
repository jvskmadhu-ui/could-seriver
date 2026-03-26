import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File as UploadMarker, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models.file import File, FileShare, FileStar, LinkShare
from app.models.user import User
from app.schemas.file import FileUpdate, LinkShareCreate, ShareCreate, StarToggle
from app.services.storage import storage_service
from app.utils.mappers import file_to_dict


router = APIRouter()
shares_router = APIRouter()
link_router = APIRouter()


@router.post("/upload")
def upload_file(
    folderId: str | None = Form(default=None),
    upload: UploadFile = UploadMarker(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    storage_key, size_bytes = storage_service.save(current_user.id, upload)
    file = File(
        name=upload.filename or "untitled",
        mime_type=upload.content_type or "application/octet-stream",
        size_bytes=size_bytes,
        storage_key=storage_key,
        owner_id=current_user.id,
        folder_id=folderId,
    )
    db.add(file)
    db.commit()
    db.refresh(file)
    return {"file": file_to_dict(file)}


@router.get("/trash/list")
def trash_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    files = db.scalars(
        select(File).where(File.owner_id == current_user.id, File.is_deleted.is_(True))
    ).all()
    return {"files": [file_to_dict(file) for file in files]}


@router.post("/trash/restore")
def restore_item(
    resourceType: str = Form(...),
    resourceId: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if resourceType != "file":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only file restore is implemented")
    file = db.get(File, resourceId)
    if not file or file.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    file.is_deleted = False
    db.commit()
    return {"success": True}


@router.get("/stars/list")
def list_stars(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stars = db.scalars(select(FileStar).where(FileStar.user_id == current_user.id)).all()
    return {
        "stars": [
            {"resourceType": star.resource_type, "resourceId": star.resource_id}
            for star in stars
        ]
    }


@router.post("/stars")
def create_star(
    payload: StarToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    star = FileStar(
        user_id=current_user.id,
        resource_type=payload.resourceType,
        resource_id=payload.resourceId,
    )
    db.merge(star)
    db.commit()
    return {"success": True}


@router.delete("/stars")
def delete_star(
    payload: StarToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    star = db.get(FileStar, (current_user.id, payload.resourceType, payload.resourceId))
    if star:
        db.delete(star)
        db.commit()
    return {"success": True}


@router.get("/recent/list")
def recent_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    files = db.scalars(
        select(File)
        .where(File.owner_id == current_user.id, File.is_deleted.is_(False))
        .order_by(File.updated_at.desc())
        .limit(10)
    ).all()
    return {"files": [file_to_dict(file) for file in files]}


@router.get("/public/{token}")
def public_link_access(
    token: str,
    password: str | None = None,
    db: Session = Depends(get_db),
):
    link = db.scalar(select(LinkShare).where(LinkShare.token == token))
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    if link.expires_at and link.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Link expired")
    if link.password_hash and (not password or not verify_password(password, link.password_hash)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Password required")

    file = db.get(File, link.resource_id)
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(storage_service.resolve_path(file.storage_key), filename=file.name, media_type=file.mime_type)


@router.get("/{file_id}")
def get_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file = db.get(File, file_id)
    if not file or file.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    allowed = file.owner_id == current_user.id or db.scalar(
        select(FileShare).where(
            FileShare.resource_type == "file",
            FileShare.resource_id == file_id,
            FileShare.grantee_user_id == current_user.id,
        )
    )
    if not allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return {"file": file_to_dict(file)}


@router.get("/{file_id}/download")
def download_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file = db.get(File, file_id)
    if not file or file.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    if file.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return FileResponse(storage_service.resolve_path(file.storage_key), filename=file.name, media_type=file.mime_type)


@router.patch("/{file_id}")
def update_file(
    file_id: str,
    payload: FileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file = db.get(File, file_id)
    if not file or file.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    if payload.name is not None:
        file.name = payload.name
    if payload.folderId is not None:
        file.folder_id = payload.folderId
    db.commit()
    db.refresh(file)
    return {"file": file_to_dict(file)}


@router.delete("/{file_id}")
def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file = db.get(File, file_id)
    if not file or file.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    file.is_deleted = True
    db.commit()
    return {"success": True}


@shares_router.post("/")
def create_share(
    payload: ShareCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    share = FileShare(
        resource_type=payload.resourceType,
        resource_id=payload.resourceId,
        grantee_user_id=payload.granteeUserId,
        role=payload.role,
        created_by=current_user.id,
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return {"share": share.id}


@shares_router.get("/{resource_type}/{resource_id}")
def list_shares(
    resource_type: str,
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shares = db.scalars(
        select(FileShare).where(
            FileShare.resource_type == resource_type,
            FileShare.resource_id == resource_id,
        )
    ).all()
    return {
        "shares": [
            {
                "id": share.id,
                "resourceType": share.resource_type,
                "resourceId": share.resource_id,
                "granteeUserId": share.grantee_user_id,
                "role": share.role,
                "createdBy": share.created_by,
            }
            for share in shares
        ]
    }


@shares_router.delete("/{share_id}")
def delete_share(
    share_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    share = db.get(FileShare, share_id)
    if not share:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share not found")
    db.delete(share)
    db.commit()
    return {"success": True}


@link_router.post("/")
def create_link_share(
    payload: LinkShareCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = LinkShare(
        resource_type=payload.resourceType,
        resource_id=payload.resourceId,
        token=secrets.token_urlsafe(24),
        password_hash=hash_password(payload.password) if payload.password else None,
        expires_at=payload.expiresAt,
        created_by=current_user.id,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return {"linkShare": {"id": link.id, "token": link.token, "expiresAt": link.expires_at}}


@link_router.delete("/{link_id}")
def delete_link_share(
    link_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = db.get(LinkShare, link_id)
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link share not found")
    db.delete(link)
    db.commit()
    return {"success": True}

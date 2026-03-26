from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.file import File
from app.models.folder import Folder
from app.models.user import User
from app.utils.mappers import file_to_dict, folder_to_dict


router = APIRouter()


@router.get("/search")
def search(
    q: str = "",
    type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    folder_results: list[dict] = []
    file_results: list[dict] = []

    if type in (None, "folder"):
        folders = db.scalars(
            select(Folder).where(
                Folder.owner_id == current_user.id,
                Folder.is_deleted.is_(False),
                Folder.name.ilike(f"%{q}%"),
            )
        ).all()
        folder_results = [folder_to_dict(folder) for folder in folders]

    if type in (None, "file"):
        files = db.scalars(
            select(File).where(
                File.owner_id == current_user.id,
                File.is_deleted.is_(False),
                or_(File.name.ilike(f"%{q}%"), File.mime_type.ilike(f"%{q}%")),
            )
        ).all()
        file_results = [file_to_dict(file) for file in files]

    return {"folders": folder_results, "files": file_results}

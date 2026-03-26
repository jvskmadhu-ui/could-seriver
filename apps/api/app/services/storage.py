import os
import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings


class LocalStorageService:
    def __init__(self) -> None:
        self.base_path = Path(settings.upload_dir)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def save(self, owner_id: str, upload: UploadFile) -> tuple[str, int]:
        suffix = Path(upload.filename or "").suffix
        storage_key = f"{owner_id}/{uuid.uuid4()}{suffix}"
        destination = self.base_path / storage_key
        destination.parent.mkdir(parents=True, exist_ok=True)
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload.file, buffer)
        size_bytes = os.path.getsize(destination)
        return storage_key, size_bytes

    def resolve_path(self, storage_key: str) -> Path:
        return self.base_path / storage_key


storage_service = LocalStorageService()

from app.models.file import File
from app.models.folder import Folder
from app.models.user import User


def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "imageUrl": user.image_url,
    }


def folder_to_dict(folder: Folder) -> dict:
    return {
        "id": folder.id,
        "name": folder.name,
        "ownerId": folder.owner_id,
        "parentId": folder.parent_id,
        "isDeleted": folder.is_deleted,
        "createdAt": folder.created_at,
        "updatedAt": folder.updated_at,
    }


def file_to_dict(file: File) -> dict:
    return {
        "id": file.id,
        "name": file.name,
        "mimeType": file.mime_type,
        "sizeBytes": file.size_bytes,
        "ownerId": file.owner_id,
        "folderId": file.folder_id,
        "isDeleted": file.is_deleted,
        "createdAt": file.created_at,
        "updatedAt": file.updated_at,
    }

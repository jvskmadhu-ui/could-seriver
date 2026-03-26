from fastapi import APIRouter

from app.api.routes import auth, files, folders, search


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(folders.router, prefix="/folders", tags=["folders"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(files.shares_router, prefix="/shares", tags=["shares"])
api_router.include_router(files.link_router, prefix="/link-shares", tags=["link-shares"])
api_router.include_router(search.router, tags=["search"])

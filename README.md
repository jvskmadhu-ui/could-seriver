# Cloud Sevier

Cloud Sevier is a cloud-style media file storage service starter built as a monorepo:

- `apps/web`: Next.js 15 + Tailwind frontend
- `apps/api`: FastAPI + SQLAlchemy backend

This starter implements the MVP foundation from your specification:

- Email/password auth with JWT
- Folder CRUD with breadcrumbs
- File upload, rename, move, delete, restore, download
- Per-user shares and public link shares
- Search, recent items, stars, trash

## Project Structure

```text
apps/
  web/   # Next.js frontend
  api/   # FastAPI backend
infra/   # reserved for deployment/migrations
```

## Run Locally

### Backend

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd apps/web
npm install
copy .env.local.example .env.local
npm run dev
```

Frontend default: `http://localhost:3000`
Backend default: `http://localhost:8000`

## Notes

- The backend uses SQLite by default for local development and can be switched to PostgreSQL via `DATABASE_URL`.
- Uploaded files are stored locally in `apps/api/uploads/` for development. Replace the storage service with Supabase Storage or S3 for production.
- The code is organized so you can extend it toward resumable uploads, background jobs, previews, and stricter ACL inheritance.

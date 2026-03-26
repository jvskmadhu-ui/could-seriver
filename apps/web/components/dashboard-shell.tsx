"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FolderPlus, HardDrive, Search, Share2, Star, Trash2, Upload } from "lucide-react";

import { api, clearSession, getToken } from "@/lib/api";

type FolderItem = {
  id: string;
  name: string;
};

type FileItem = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  folderId: string | null;
};

type BrowserResponse = {
  folder: FolderItem | null;
  folders: FolderItem[];
  files: FileItem[];
  path: FolderItem[];
};

export function DashboardShell() {
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<"drive" | "search" | "trash" | "recent">("drive");
  const [browser, setBrowser] = useState<BrowserResponse | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [searchResults, setSearchResults] = useState<BrowserResponse | null>(null);

  useEffect(() => {
    const storedToken = getToken();
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    void loadFolder(null, token);
  }, [token]);

  async function loadFolder(folderId: string | null, authToken = token) {
    if (!authToken) {
      return;
    }
    const path = folderId ? `/folders/${folderId}` : "/folders/root";
    const data = await api<BrowserResponse>(path, { token: authToken });
    setCurrentFolderId(folderId);
    setBrowser(data);
    setView("drive");
  }

  async function createFolder() {
    if (!token) return;
    const name = window.prompt("Folder name");
    if (!name) return;
    await api("/folders", {
      method: "POST",
      token,
      json: { name, parentId: currentFolderId },
    });
    await loadFolder(currentFolderId);
  }

  async function uploadFile(file: File) {
    if (!token) return;
    const form = new FormData();
    if (currentFolderId) {
      form.append("folderId", currentFolderId);
    }
    form.append("upload", file);
    await api("/files/upload", { method: "POST", token, body: form });
    setMessage(`Uploaded ${file.name}`);
    await loadFolder(currentFolderId);
  }

  async function renameFile(fileId: string, currentName: string) {
    if (!token) return;
    const name = window.prompt("Rename file", currentName);
    if (!name || name === currentName) return;
    await api(`/files/${fileId}`, { method: "PATCH", token, json: { name } });
    await loadFolder(currentFolderId);
  }

  async function deleteFile(fileId: string) {
    if (!token) return;
    await api(`/files/${fileId}`, { method: "DELETE", token });
    await loadFolder(currentFolderId);
  }

  async function search() {
    if (!token) return;
    const data = await api<{ folders: FolderItem[]; files: FileItem[] }>(
      `/search?q=${encodeURIComponent(query)}`,
      { token }
    );
    setSearchResults({
      folder: null,
      folders: data.folders,
      files: data.files,
      path: [],
    });
    setView("search");
  }

  async function loadTrash() {
    if (!token) return;
    const data = await api<{ files: FileItem[] }>("/files/trash/list", { token });
    setSearchResults({
      folder: null,
      folders: [],
      files: data.files,
      path: [],
    });
    setView("trash");
  }

  async function loadRecent() {
    if (!token) return;
    const data = await api<{ files: FileItem[] }>("/files/recent/list", { token });
    setSearchResults({
      folder: null,
      folders: [],
      files: data.files,
      path: [],
    });
    setView("recent");
  }

  async function restoreFile(fileId: string) {
    if (!token) return;
    const form = new FormData();
    form.append("resourceType", "file");
    form.append("resourceId", fileId);
    await api("/files/trash/restore", { method: "POST", token, body: form });
    await loadTrash();
  }

  function downloadFile(fileId: string) {
    if (!token) return;
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/files/${fileId}/download`;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Download failed");
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, "_blank");
      })
      .catch(() => setMessage("Download failed"));
  }

  async function createShare(fileId: string) {
    if (!token) return;
    const granteeUserId = window.prompt("Grantee user ID");
    if (!granteeUserId) return;
    await api("/shares", {
      method: "POST",
      token,
      json: { resourceType: "file", resourceId: fileId, granteeUserId, role: "viewer" },
    });
    setMessage("Share created");
  }

  const active = useMemo(() => {
    if (view === "drive") return browser;
    return searchResults;
  }, [browser, searchResults, view]);

  const totalFiles = browser?.files.length ?? 0;
  const totalFolders = browser?.folders.length ?? 0;
  const totalSize = (active?.files || []).reduce((sum, file) => sum + file.sizeBytes, 0);
  const title =
    view === "drive"
      ? "My Drive"
      : view === "search"
        ? "Search Results"
        : view === "recent"
          ? "Recent Files"
          : "Trash";

  if (!token) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <p className="text-lg font-medium text-ink">You need to sign in first.</p>
        <a href="/login" className="mt-4 inline-flex rounded-2xl bg-ink px-4 py-3 text-white">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 p-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-[28px] bg-ink p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-teal-200">Cloud Sevier</p>
        <h1 className="mt-4 text-3xl font-semibold">Drive core, built cleanly.</h1>
        <div className="mt-8 space-y-3">
          <button onClick={() => loadFolder(null)} className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left">My Drive</button>
          <button onClick={() => loadRecent()} className="w-full rounded-2xl bg-white/5 px-4 py-3 text-left">Recent</button>
          <button onClick={() => setMessage("Starred view is ready for extension")} className="w-full rounded-2xl bg-white/5 px-4 py-3 text-left">Starred</button>
          <button onClick={() => search()} className="w-full rounded-2xl bg-white/5 px-4 py-3 text-left">Search</button>
          <button onClick={() => loadTrash()} className="w-full rounded-2xl bg-white/5 px-4 py-3 text-left">Trash</button>
        </div>
        <div className="mt-8 rounded-3xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/70">Workspace note</p>
          <p className="mt-3 text-sm leading-6 text-emerald-50/85">
            The dashboard is live-wired for uploads, folder browsing, recent items, search, and trash recovery.
          </p>
        </div>
        <button
          onClick={() => {
            clearSession();
            window.location.href = "/login";
          }}
          className="mt-8 rounded-2xl border border-white/20 px-4 py-3"
        >
          Sign out
        </button>
      </aside>

      <main className="space-y-6">
        <section className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-500">Workspace</p>
              <h2 className="text-2xl font-semibold text-ink">{title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-medium text-white">
                <Upload className="h-4 w-4" />
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadFile(file);
                    }
                  }}
                />
              </label>
              <button onClick={createFolder} className="inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white">
                <FolderPlus className="h-4 w-4" />
                New Folder
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search files and folders"
                className="w-full border-none outline-none"
              />
            </div>
            <button onClick={search} className="rounded-2xl bg-accent px-5 py-3 font-medium text-slate-950">
              Search
            </button>
          </div>

          {message ? <p className="mt-4 text-sm text-brand">{message}</p> : null}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Visible files</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{active?.files.length ?? totalFiles}</p>
          </article>
          <article className="rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Visible folders</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{active?.folders.length ?? totalFolders}</p>
          </article>
          <article className="rounded-[28px] border border-black/5 bg-[#18261c] p-5 text-white shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/70">Loaded storage</p>
              <HardDrive className="h-5 w-5 text-emerald-100/70" />
            </div>
            <p className="mt-3 text-4xl font-semibold">{Math.max(1, Math.round(totalSize / 1024))} KB</p>
          </article>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="mb-4 flex flex-wrap gap-2 text-sm text-slate-500">
            <button onClick={() => loadFolder(null)} className="rounded-full bg-slate-100 px-3 py-1">Root</button>
            {browser?.path.map((segment) => (
              <button
                key={segment.id}
                onClick={() => loadFolder(segment.id)}
                className="rounded-full bg-slate-100 px-3 py-1"
              >
                {segment.name}
              </button>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              Current view: {title}
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              Files loaded: {active?.files.length ?? 0}
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              Folders loaded: {active?.folders.length ?? 0}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active?.folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => loadFolder(folder.id)}
                className="rounded-3xl border border-slate-200 bg-mist p-5 text-left transition hover:-translate-y-0.5 hover:border-brand"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Folder</p>
                <p className="mt-2 text-lg font-semibold text-ink">{folder.name}</p>
                <p className="mt-4 text-sm text-slate-500">Open folder and inspect its children.</p>
              </button>
            ))}

            {active?.files.map((file) => (
              <div key={file.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{file.mimeType}</p>
                <p className="mt-2 text-lg font-semibold text-ink">{file.name}</p>
                <p className="mt-1 text-sm text-slate-500">{Math.round(file.sizeBytes / 1024)} KB</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => renameFile(file.id, file.name)} className="rounded-full bg-slate-100 px-3 py-2 text-sm">Rename</button>
                  {view === "trash" ? (
                    <button onClick={() => restoreFile(file.id)} className="rounded-full bg-brand px-3 py-2 text-sm text-white">Restore</button>
                  ) : (
                    <>
                      <button onClick={() => downloadFile(file.id)} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm"><Download className="h-4 w-4" />Download</button>
                      <button onClick={() => createShare(file.id)} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm"><Share2 className="h-4 w-4" />Share</button>
                      <button onClick={() => deleteFile(file.id)} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-sm text-red-700"><Trash2 className="h-4 w-4" />Delete</button>
                      <button onClick={() => setMessage("Star endpoint is available for wiring into a dedicated view")} className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm text-amber-800"><Star className="h-4 w-4" />Star</button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {!active?.folders.length && !active?.files.length ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center md:col-span-2 xl:col-span-3">
                <p className="text-lg font-medium text-ink">This view is empty for now.</p>
                <p className="mt-2 text-sm text-slate-600">Create a folder, upload a file, or run a search to populate the workspace.</p>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

const capabilityCards = [
  {
    title: "Folder intelligence",
    body: "Nested folders, breadcrumb navigation, and cleaner movement between personal and shared content.",
  },
  {
    title: "Protected sharing",
    body: "Viewer and editor flows, plus public links designed for secure distribution and later expiration controls.",
  },
  {
    title: "Upload-ready stack",
    body: "Prepared for local development now and object storage migration when you connect Supabase or S3.",
  },
];

const milestones = [
  "Auth and protected routes",
  "Folders and file browsing",
  "Upload, trash, and restore flows",
  "Search, recent items, and sharing",
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 lg:px-10">
      <header className="flex items-center justify-between rounded-full border border-black/5 bg-white/70 px-5 py-4 shadow-soft backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand">Cloud Sevier</p>
        </div>
        <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#stack">Stack</a>
        </nav>
        <div className="flex gap-3">
          <a href="/login" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm">
            Sign in
          </a>
          <a href="/register" className="rounded-full bg-ink px-4 py-2 text-sm text-white">
            Start free
          </a>
        </div>
      </header>

      <section className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-brand/15 bg-brand/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-brand">
            Media storage platform
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] text-ink md:text-7xl">
            Store every file in one calm, fast, shareable workspace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Upload media, organize nested folders, search instantly, and share with clean access rules.
            Cloud Sevier brings the core of a modern drive product to a practical full-stack starter.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/register" className="rounded-2xl bg-ink px-6 py-3 font-medium text-white">
              Create workspace
            </a>
            <a href="/dashboard" className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-medium text-ink">
              Explore dashboard
            </a>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-soft">
              <p className="text-3xl font-semibold">Folders</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Tree navigation with breadcrumbs and move-ready metadata.</p>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-soft">
              <p className="text-3xl font-semibold">Sharing</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Viewer and editor access plus public links with expiration.</p>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-soft">
              <p className="text-3xl font-semibold">Search</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Quick lookup by file name, type, and recent activity patterns.</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-12 h-28 w-28 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -right-4 top-0 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-[linear-gradient(160deg,#1b2e22_0%,#274a34_60%,#335a40_100%)] p-6 text-white shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-100/80">Workspace preview</p>
                <h2 className="mt-2 text-2xl font-semibold">My Drive</h2>
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm">12.8 GB used</div>
            </div>

            <div className="mt-8 space-y-4 rounded-[1.5rem] bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <div>
                  <p className="text-sm text-emerald-50/70">Folder</p>
                  <p className="font-medium">Campaign Assets</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">24 items</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-slate-900">
                <div>
                  <p className="text-sm text-slate-500">video/mp4</p>
                  <p className="font-medium">launch-reel-v3.mp4</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-900">Shared</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-emerald-50/70">Recent uploads</p>
                  <p className="mt-3 text-3xl font-semibold">148</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-emerald-50/70">Public links</p>
                  <p className="mt-3 text-3xl font-semibold">09</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="grid gap-5 py-8 md:grid-cols-3">
        {capabilityCards.map((card) => (
          <article key={card.title} className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Core</p>
            <h3 className="mt-3 text-2xl font-semibold">{card.title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">{card.body}</p>
          </article>
        ))}
      </section>

      <section id="workflow" className="grid gap-6 py-8 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-brand">Workflow</p>
          <h3 className="mt-4 text-3xl font-semibold">Built for a clear MVP path</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Start with auth, folders, uploads, and shares. Then layer in previews, activity feeds,
            quotas, and cloud object storage without needing to throw away the app structure.
          </p>
          <div className="mt-6 grid gap-3">
            {milestones.map((item) => (
              <div key={item} className="rounded-2xl border border-black/5 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div id="stack" className="rounded-[2rem] border border-black/5 bg-[#16251b] p-8 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/70">Stack</p>
          <h3 className="mt-4 text-3xl font-semibold">Next.js plus Python API</h3>
          <p className="mt-4 text-sm leading-7 text-emerald-50/80">
            The frontend is ready for a modern dashboard experience, while the backend keeps the service layer clear for migration to PostgreSQL, Supabase, and S3-compatible storage.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-emerald-50/90">
            <div className="rounded-2xl bg-white/10 px-4 py-3">Next.js App Router frontend</div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">FastAPI service layer</div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">PostgreSQL and object storage ready data model</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-brand">Why this UI</p>
          <h3 className="mt-4 text-3xl font-semibold">A frontend you can actually keep building on</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            The structure is already split into public pages, auth pages, and a dashboard shell so it is easy
            to add drag-and-drop, modals, previews, analytics, and team sharing without a redesign later.
          </p>
        </div>
        <div className="rounded-[2rem] border border-black/5 bg-[#f2bf49] p-8 text-slate-950 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-800/70">Next move</p>
          <h3 className="mt-4 text-3xl font-semibold">Connect it to your backend and demo it</h3>
          <p className="mt-4 text-sm leading-7 text-slate-800">
            Once the API is running, the dashboard can browse folders, upload files, search, and restore items from trash with real data.
          </p>
        </div>
      </section>
    </main>
  );
}

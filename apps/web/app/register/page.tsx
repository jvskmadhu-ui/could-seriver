import { AuthForm } from "@/components/auth-form";


export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section className="space-y-5">
        <p className="text-xs uppercase tracking-[0.35em] text-brand">New workspace</p>
        <h1 className="text-5xl font-semibold leading-tight text-ink">Create a cleaner home for your files.</h1>
        <p className="max-w-lg text-base leading-8 text-slate-600">
          Start with secure auth, nested folders, upload management, and sharing controls designed for a real cloud storage MVP.
        </p>
      </section>
      <AuthForm mode="register" />
    </main>
  );
}

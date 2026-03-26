import { AuthForm } from "@/components/auth-form";


export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section className="space-y-5">
        <p className="text-xs uppercase tracking-[0.35em] text-brand">Secure access</p>
        <h1 className="text-5xl font-semibold leading-tight text-ink">Return to your media workspace.</h1>
        <p className="max-w-lg text-base leading-8 text-slate-600">
          Open your drive, continue uploads, manage sharing, and pick up where your team left off.
        </p>
      </section>
      <AuthForm mode="login" />
    </main>
  );
}

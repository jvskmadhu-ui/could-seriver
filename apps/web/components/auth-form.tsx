"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { api, setSession } from "@/lib/api";

type Props = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      name: String(formData.get("name") || ""),
    };

    try {
      const data = await api<{ accessToken: string }>(`/auth/${mode}`, {
        json: mode === "login" ? { email: payload.email, password: payload.password } : payload,
      });
      setSession(data.accessToken);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-[2rem] border border-black/5 bg-white/85 p-8 shadow-soft backdrop-blur">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-brand">Cloud Sevier</p>
        <h1 className="text-3xl font-semibold text-ink">
          {mode === "login" ? "Welcome back" : "Create your workspace"}
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Cloud Sevier keeps your media files organized, searchable, and shareable.
        </p>
      </div>

      {mode === "register" ? (
        <input
          name="name"
          placeholder="Full name"
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand"
        />
      ) : null}

      <input
        name="email"
        type="email"
        placeholder="Email address"
        required
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand"
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand"
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-ink px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
      >
        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <p className="text-xs leading-5 text-slate-500">
        {mode === "login"
          ? "Use your workspace account to open your drive, shared files, and uploads."
          : "Create a personal workspace now and connect Supabase or S3 later when you are ready to scale."}
      </p>
    </form>
  );
}

"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, Mail } from "lucide-react";
import { AuthRoute } from "@/components/AuthRoute";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";

function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { login, signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const nextPath = searchParams.get("next");
  const redirectTo =
    nextPath && nextPath.startsWith("/") ? nextPath : "/orchard";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      router.replace(redirectTo);
    } catch (authError: any) {
      setError(authError.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    setGoogleLoading(true);
    loginWithGoogle();
  }

  return (
    <main className="grid min-h-[calc(100vh-66px)] place-items-center bg-grove-50 px-4 py-8">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded border border-grove-100 bg-white p-6 shadow-soft"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded bg-grove-700 text-white">
            <Leaf />
          </span>
          <div>
            <h1 className="text-2xl font-black text-ink">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h1>
            <p className="text-sm text-ink/70">
              {mode === "signin"
                ? "Continue to your orchard."
                : "Start renting organic fruit trees."}
            </p>
          </div>
        </div>

        {mode === "signup" && (
          <label className="mb-4 block text-sm font-medium text-ink">
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded border border-grove-100 px-3 py-2"
            />
          </label>
        )}

        <label className="mb-4 block text-sm font-medium text-ink">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-grove-100 px-3 py-2"
          />
        </label>
        <label className="mb-4 block text-sm font-medium text-ink">
          Password
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-grove-100 px-3 py-2"
          />
        </label>

        {mode === "signin" && (
          <p className="-mt-2 mb-4 text-right text-sm">
            <Link
              className="font-semibold text-grove-700"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </p>
        )}

        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button
          className="w-full"
          disabled={loading || googleLoading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Mail size={16} />
          )}{" "}
          {mode === "signin" ? "Sign in" : "Sign up"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="mt-3 w-full"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : null}{" "}
          Continue with Google
        </Button>

        <p className="mt-5 text-center text-sm text-ink/70">
          {mode === "signin" ? "New to Treekart?" : "Already have an account?"}{" "}
          <Link
            className="font-semibold text-grove-700"
            href={mode === "signin" ? "/signup" : "/signin"}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </form>
    </main>
  );
}

export function AuthPage({ mode }: { mode: "signin" | "signup" }) {
  return (
    <AuthRoute>
      <Suspense
        fallback={
          <div className="grid min-h-[50vh] place-items-center text-grove-700">
            Loading…
          </div>
        }
      >
        <AuthForm mode={mode} />
      </Suspense>
    </AuthRoute>
  );
}

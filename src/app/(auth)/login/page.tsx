"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">
          classcutcheyaamo?
        </h1>
        <p className="mb-8 text-sm text-muted">welcome back</p>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium">
              username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-status-absent">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-primary mt-2 py-2.5"
          >
            {pending ? "logging in..." : "log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-muted">
          <Link
            href="/reset-password"
            className="font-medium text-primary underline"
          >
            forgot your password?
          </Link>
        </p>

        <p className="mt-3 text-sm text-muted">
          don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary underline">
            sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

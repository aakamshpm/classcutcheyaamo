"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "../actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, null);

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">
          classcutcheyaamo?
        </h1>
        <p className="mb-8 text-sm text-muted">
          create an account to start tracking
        </p>

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
              minLength={3}
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
              minLength={6}
              autoComplete="new-password"
              className="input"
            />
          </div>

          {state && "error" in state && (
            <p className="text-sm text-status-absent">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-primary mt-2 py-2.5"
          >
            {pending ? "creating account..." : "sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline">
            log in
          </Link>
        </p>
      </div>
    </main>
  );
}

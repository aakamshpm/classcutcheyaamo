"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "./actions";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, null);

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">
          forgot your password?
        </h1>
        <p className="mb-8 text-sm text-muted">
          enter your username and pick a new password
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
              autoComplete="username"
              className="input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              new password
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              type it again
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
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
            {pending ? "changing..." : "change password"}
          </button>
        </form>

        {/* the user should know this is not a private account. saying it plainly
            is better than letting them assume a protection that isn't there. */}
        <p className="mt-6 rounded-lg bg-status-half-bg px-3 py-2 text-xs text-muted">
          there&apos;s no email or phone on your account, so this only asks for
          your username. anyone who knows it can change your password — keep
          your username to yourself.
        </p>

        <p className="mt-4 text-sm text-muted">
          remembered it?{" "}
          <Link href="/login" className="font-medium text-primary underline">
            log in
          </Link>
        </p>
      </div>
    </main>
  );
}

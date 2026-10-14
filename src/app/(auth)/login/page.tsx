"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { AuthShell } from "../auth-shell";
import { AlertIcon, ArrowRightIcon } from "../../components/icons";
import { PasswordField } from "../../components/password-field";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const failed = Boolean(state?.error);
  // controlled so a failed attempt doesn't wipe the username (react resets
  // uncontrolled fields after every form action)
  const [username, setUsername] = useState("");

  return (
    <AuthShell
      title="welcome back"
      subtitle="let's see where you stand with attendance today."
      footer={
        <>
          don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary underline">
            sign up
          </Link>
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        {state?.error && (
          <p role="alert" className="notice notice-danger">
            <AlertIcon />
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-sm font-medium">
            username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            aria-invalid={failed || undefined}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <PasswordField
            id="password"
            name="password"
            label="password"
            autoComplete="current-password"
            invalid={failed}
          />
          <Link
            href="/reset-password"
            className="self-end text-sm font-medium text-primary underline"
          >
            forgot your password?
          </Link>
        </div>

        <button type="submit" disabled={pending} className="btn-primary gap-2">
          {pending ? "logging in..." : "log in"}
          {!pending && <ArrowRightIcon />}
        </button>
      </form>
    </AuthShell>
  );
}

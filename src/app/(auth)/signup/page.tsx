"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signup } from "../actions";
import { AuthShell } from "../auth-shell";
import { AlertIcon, ArrowRightIcon } from "../../components/icons";
import { PasswordField } from "../../components/password-field";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, null);
  const error = state && "error" in state ? state.error : undefined;
  // controlled so a failed attempt doesn't wipe the username
  const [username, setUsername] = useState("");

  return (
    <AuthShell
      title="create an account"
      subtitle="start tracking in under a minute."
      footer={
        <>
          already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary underline">
            log in
          </Link>
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        <p className="notice">
          just pick a username. no email or phone needed.
        </p>

        {error && (
          <p role="alert" className="notice notice-danger">
            <AlertIcon />
            {error}
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
            minLength={3}
            autoComplete="username"
            autoCapitalize="none"
            aria-describedby="username-hint"
            className="input"
          />
          <p id="username-hint" className="text-xs text-muted">
            at least 3 characters. this is how you log in.
          </p>
        </div>

        <PasswordField
          id="password"
          name="password"
          label="password"
          minLength={6}
          autoComplete="new-password"
          hint="at least 6 characters."
        />

        <button type="submit" disabled={pending} className="btn-primary gap-2">
          {pending ? "creating account..." : "sign up"}
          {!pending && <ArrowRightIcon />}
        </button>
      </form>
    </AuthShell>
  );
}

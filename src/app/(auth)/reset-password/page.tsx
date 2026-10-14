"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { resetPassword } from "./actions";
import { AuthShell } from "../auth-shell";
import { AlertIcon, ArrowRightIcon } from "../../components/icons";
import { PasswordField } from "../../components/password-field";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, null);
  const error = state && "error" in state ? state.error : undefined;
  // controlled so a failed attempt doesn't wipe the username
  const [username, setUsername] = useState("");

  return (
    <AuthShell
      title="reset your password"
      subtitle="enter your username and pick a new password."
      footer={
        <>
          remembered it?{" "}
          <Link href="/login" className="font-semibold text-primary underline">
            log in
          </Link>
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        {/* the user should know this is not a private account. saying it plainly
            is better than letting them assume a protection that isn't there. */}
        <p className="notice notice-warn">
          <AlertIcon />
          <span>
            there&apos;s no email or phone on your account, so this only asks
            for your username. anyone who knows it can change your password.
            keep your username to yourself.
          </span>
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
            autoComplete="username"
            autoCapitalize="none"
            className="input"
          />
        </div>

        <PasswordField
          id="password"
          name="password"
          label="new password"
          minLength={6}
          autoComplete="new-password"
          hint="at least 6 characters."
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="type it again"
          minLength={6}
          autoComplete="new-password"
        />

        <button type="submit" disabled={pending} className="btn-primary gap-2">
          {pending ? "changing..." : "change password"}
          {!pending && <ArrowRightIcon />}
        </button>
      </form>
    </AuthShell>
  );
}

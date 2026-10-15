"use client";

import { useActionState, useState } from "react";
import { AlertIcon, KeyIcon, TrashIcon } from "@/app/components/icons";
import { PasswordField } from "@/app/components/password-field";
import { showToast } from "@/lib/toast";
import { clearOfflineData } from "@/lib/offline";
import {
  changePassword,
  deleteAccount,
  type ActionResult,
} from "../actions";

const ROW =
  "flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-control)] px-1 text-left text-sm font-medium transition-colors hover:bg-status-holiday-bg";

// the form is only mounted while it's open, so closing it also drops any
// old error and the typed values
export function ChangePasswordRow() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={ROW}
      >
        <KeyIcon className="h-5 w-5 text-muted" />
        change password
      </button>
      {open && (
        <ChangePasswordForm
          onClose={() => setOpen(false)}
          onDone={() => {
            setOpen(false);
            showToast("password changed");
          }}
        />
      )}
    </div>
  );
}

function ChangePasswordForm({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(async (prev, formData) => {
    const result = await changePassword(prev, formData);
    if ("success" in result) onDone();
    return result;
  }, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 px-1 pt-2 pb-3">
      {state && "error" in state && (
        <p role="alert" className="notice notice-danger">
          <AlertIcon />
          {state.error}
        </p>
      )}

      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="current password"
        autoComplete="current-password"
      />
      <PasswordField
        id="newPassword"
        name="newPassword"
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

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary px-5">
          {pending ? "saving..." : "save"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="btn-secondary px-5"
        >
          cancel
        </button>
      </div>
    </form>
  );
}

export function DeleteAccountRow({ username }: { username: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={ROW}
        style={{ color: "var(--status-absent)" }}
      >
        <TrashIcon className="h-5 w-5" />
        delete account
      </button>
      {open && (
        <DeleteAccountForm username={username} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

function DeleteAccountForm({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(deleteAccount, null);
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === username;

  return (
    <form
      action={formAction}
      // the saved offline copies are this person's data, same as on logout
      onSubmit={() => void clearOfflineData()}
      className="flex flex-col gap-4 px-1 pt-2 pb-3"
    >
      <p className="notice notice-danger">
        <AlertIcon />
        <span>
          this deletes your account, every semester and every marked day. it
          can&apos;t be undone.
        </span>
      </p>

      {state && "error" in state && (
        <p role="alert" className="notice notice-danger">
          <AlertIcon />
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-sm font-medium">
          type <span className="font-semibold">{username}</span> to confirm
        </label>
        <input
          id="confirm"
          name="confirm"
          type="text"
          required
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="input"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!matches || pending}
          className="btn-secondary px-5"
          style={{
            borderColor: "var(--status-absent)",
            color: "var(--status-absent)",
          }}
        >
          {pending ? "deleting..." : "delete my account"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="btn-secondary px-5"
        >
          cancel
        </button>
      </div>
    </form>
  );
}

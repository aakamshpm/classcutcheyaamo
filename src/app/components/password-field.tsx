"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type Props = {
  id: string;
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  invalid?: boolean;
  hint?: string;
};

// password input with a show/hide toggle. the toggle is type="button" so it
// never submits the form, and 48px wide to stay a decent touch target
export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
  invalid,
  hint,
}: Props) {
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={hintId}
          className="input w-full pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "hide password" : "show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import { AlertIcon } from "@/app/components/icons";
import { plural } from "@/lib/semester-status";
import { deleteSemester, type ActionResult } from "../actions";

export function DeleteSemesterForm({
  semesterId,
  name,
  markedDays,
}: {
  semesterId: string;
  name: string;
  markedDays: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(deleteSemester, null);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs underline"
        style={{ color: "var(--status-absent)" }}
      >
        delete this semester
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="semesterId" value={semesterId} />

      <p className="notice notice-danger">
        <AlertIcon />
        <span>
          this removes {name}
          {markedDays > 0 && ` and its ${plural(markedDays, "marked day")}`}.
          it can&apos;t be undone.
        </span>
      </p>

      {state && "error" in state && (
        <p role="alert" className="text-sm text-status-absent">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-secondary px-4 text-sm"
          style={{
            borderColor: "var(--status-absent)",
            color: "var(--status-absent)",
          }}
        >
          {pending ? "deleting..." : "yes, delete it"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="btn-secondary px-4 text-sm"
        >
          cancel
        </button>
      </div>
    </form>
  );
}

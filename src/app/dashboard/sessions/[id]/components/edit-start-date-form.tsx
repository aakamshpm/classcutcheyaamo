"use client";

import { useActionState, useState } from "react";
import { updateStartDate, type ActionResult } from "../actions";

export function EditStartDateForm({
  semesterId,
  currentStartDate,
}: {
  semesterId: string;
  currentStartDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(updateStartDate, null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted underline"
      >
        edit start date
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2">
      <input type="hidden" name="semesterId" value={semesterId} />
      <input
        name="startDate"
        type="date"
        required
        defaultValue={currentStartDate}
        className="input text-sm"
      />

      {state && "error" in state && (
        <p className="text-xs text-status-absent">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary px-3 py-1.5 text-xs"
        >
          {pending ? "saving..." : "save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          cancel
        </button>
      </div>
    </form>
  );
}

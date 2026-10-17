"use client";

import { useActionState, useState } from "react";
import {
  updateEndDate,
  type ActionResult,
} from "../sessions/[id]/actions";

// the end date is optional. leave it empty to keep the semester open-ended.
export function EditEndDateForm({
  semesterId,
  currentEndDate,
}: {
  semesterId: string;
  currentEndDate: string | null;
}) {
  const [open, setOpen] = useState(false);
  // collapses back once the save actually succeeds
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(async (prev, formData) => {
    const result = await updateEndDate(prev, formData);
    if ("success" in result) setOpen(false);
    return result;
  }, null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted underline"
      >
        {currentEndDate ? "edit end date" : "add end date"}
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2">
      <input type="hidden" name="semesterId" value={semesterId} />
      <label htmlFor={`end-date-${semesterId}`} className="text-sm font-medium">
        end date <span className="font-normal text-muted">(optional)</span>
      </label>
      <input
        id={`end-date-${semesterId}`}
        name="endDate"
        type="date"
        defaultValue={currentEndDate ?? ""}
        className="input text-sm"
      />
      <p className="text-xs text-muted">
        the semester keeps running until this day has passed. clear it to go
        back to no end date.
      </p>

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

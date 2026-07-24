"use client";

import { useActionState, useEffect, useState } from "react";
import { updateRequiredPercentage, type ActionResult } from "../actions";

export function EditRequiredPercentageForm({
  semesterId,
  currentRequiredPercentage,
}: {
  semesterId: string;
  currentRequiredPercentage: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(updateRequiredPercentage, null);

  // collapse back once the save actually succeeds
  useEffect(() => {
    if (state && "success" in state) setOpen(false);
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted underline"
      >
        edit required %
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2">
      <input type="hidden" name="semesterId" value={semesterId} />
      <input
        name="requiredPercentage"
        type="number"
        min={1}
        max={100}
        required
        defaultValue={currentRequiredPercentage}
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

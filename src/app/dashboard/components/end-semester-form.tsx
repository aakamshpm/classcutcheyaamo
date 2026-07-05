"use client";

import { useActionState } from "react";
import { endSemester, type ActionResult } from "../actions";

export function EndSemesterForm({ semesterId }: { semesterId: string }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(endSemester, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="semesterId" value={semesterId} />

      <div className="flex flex-col gap-1">
        <label htmlFor="endDate" className="text-sm font-medium">
          end date
        </label>
        <input id="endDate" name="endDate" type="date" required className="input" />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-status-absent">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[calc(var(--radius)*0.7)] border px-4 py-2 text-sm font-medium disabled:opacity-50"
        style={{ borderColor: "var(--status-absent)", color: "var(--status-absent)" }}
      >
        {pending ? "ending..." : "end this semester"}
      </button>
    </form>
  );
}

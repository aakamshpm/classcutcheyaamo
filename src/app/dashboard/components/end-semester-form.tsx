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
        <input
          id="endDate"
          name="endDate"
          type="date"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50 dark:border-red-800 dark:text-red-400"
      >
        {pending ? "ending..." : "end this semester"}
      </button>
    </form>
  );
}

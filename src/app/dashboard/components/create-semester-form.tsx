"use client";

import { useActionState } from "react";
import { createSemester, type ActionResult } from "../actions";

export function CreateSemesterForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(createSemester, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          semester name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. semester 5"
          className="rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="startDate" className="text-sm font-medium">
          start date
        </label>
        <input
          id="startDate"
          name="startDate"
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
        className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "creating..." : "start semester"}
      </button>
    </form>
  );
}

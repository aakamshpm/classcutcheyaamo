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
          className="input"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="startDate" className="text-sm font-medium">
          start date
        </label>
        <input id="startDate" name="startDate" type="date" required className="input" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="requiredPercentage" className="text-sm font-medium">
          minimum attendance % your college needs
        </label>
        <input
          id="requiredPercentage"
          name="requiredPercentage"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          max={100}
          required
          defaultValue={75}
          className="input"
        />
        <p className="text-xs text-muted">
          most colleges need 75%, but some ask for 70% or 80%
        </p>
      </div>

      {state && "error" in state && (
        <p className="text-sm text-status-absent">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary py-2.5">
        {pending ? "creating..." : "start semester"}
      </button>
    </form>
  );
}

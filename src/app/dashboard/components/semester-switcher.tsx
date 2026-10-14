"use client";

import { useState } from "react";

// every active semester is rendered on the server, this only decides which
// one is visible. keeping it client-side means the page url stays the same,
// which the offline cache relies on.
export function SemesterSwitcher({
  items,
}: {
  items: { id: string; name: string; content: React.ReactNode }[];
}) {
  const [selected, setSelected] = useState(items[0]?.id);

  return (
    <div>
      {items.length > 1 && (
        <div
          role="tablist"
          aria-label="active semesters"
          className="mb-4 flex flex-wrap gap-2"
        >
          {items.map((item) => {
            const active = item.id === selected;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(item.id)}
                className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary bg-status-present-bg text-primary"
                    : "border-card-border bg-card text-muted"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      )}
      {items.map((item) => (
        <div key={item.id} hidden={item.id !== selected}>
          {item.content}
        </div>
      ))}
    </div>
  );
}

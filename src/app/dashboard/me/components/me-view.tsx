import Link from "next/link";
import { ArrowRightIcon } from "@/app/components/icons";
import { TONE_COLOR, type Tone } from "@/lib/semester-status";
import { LogoutForm } from "../../components/logout-form";
import { ThemePicker } from "./theme-picker";

export type SemesterRow = {
  id: string;
  name: string;
  detail: string;
  percent: { value: number; tone: Tone } | null;
};

export function MeView({
  username,
  since,
  rows,
  logout,
}: {
  username: string;
  since: string | null;
  rows: SemesterRow[];
  logout: () => Promise<void>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 lg:max-w-5xl lg:px-6 lg:pt-10">
      <div className="mb-6 flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-status-present-bg text-2xl font-semibold uppercase text-primary"
        >
          {username.charAt(0)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {username}
          </h1>
          {since && (
            <p className="text-sm text-muted lowercase">
              tracking since {since}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <section className="card p-5" aria-labelledby="semesters-heading">
          <h2 id="semesters-heading" className="text-lg font-semibold">
            semesters
          </h2>
          {rows.length > 0 ? (
            <>
              <p className="text-sm text-muted">
                open one to change its target percentage or start date
              </p>
              <ul className="mt-3 flex flex-col">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="border-t border-card-border first:border-t-0"
                  >
                    <Link
                      href={`/dashboard/sessions/${row.id}`}
                      className="flex min-h-14 items-center justify-between gap-3 py-2"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{row.name}</span>
                        <span className="text-sm text-muted">{row.detail}</span>
                      </span>
                      <span className="flex flex-none items-center gap-2">
                        {row.percent && (
                          <span
                            className="tnum font-semibold"
                            style={{ color: TONE_COLOR[row.percent.tone] }}
                          >
                            {row.percent.value}%
                          </span>
                        )}
                        <ArrowRightIcon className="h-4 w-4 text-muted" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">
              no semesters yet. start one from home.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section className="card p-5" aria-labelledby="appearance-heading">
            <h2 id="appearance-heading" className="text-lg font-semibold">
              appearance
            </h2>
            <p className="mb-3 text-sm text-muted">
              auto follows your phone. the pick stays on this device.
            </p>
            <ThemePicker />
          </section>

          <section className="card p-5" aria-labelledby="account-heading">
            <h2 id="account-heading" className="mb-2 text-lg font-semibold">
              account
            </h2>
            <LogoutForm action={logout} />
          </section>
        </div>
      </div>
    </main>
  );
}

import { Skel, SkelText, SkeletonRegion } from "@/app/components/skeleton";

// real labels for the weekday row, they never change
const WEEKDAY_LABELS = ["mo", "tu", "we", "th", "fr", "sa", "su"];

// mirrors the semester page (page.tsx + calendar-view.tsx)
export default function CalendarLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 lg:max-w-5xl lg:px-6 lg:pt-10">
      <SkeletonRegion label="loading calendar">
        <div className="mb-5">
          <SkelText width="9rem" textClass="text-xl" />
          <SkelText width="15rem" textClass="text-sm" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_auto_1fr] lg:items-start">
          <section className="card p-5 lg:col-start-2 lg:row-start-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SkelText width="4.5rem" textClass="text-xs" />
                <div className="mt-1">
                  <SkelText width="7rem" textClass="text-5xl" />
                </div>
              </div>
              <Skel className="h-6 w-20 rounded-full" />
            </div>
            <div className="mt-1">
              <SkelText width="13rem" textClass="text-sm" />
            </div>
            <div className="gold-rule mt-4 w-16 opacity-0" />
            <div className="mt-3">
              <SkelText width="100%" textClass="text-sm" />
            </div>
          </section>

          <section className="card p-5 lg:col-start-1 lg:row-span-3 lg:row-start-1">
            <div className="mb-3 flex items-center justify-between">
              <Skel className="-ml-2 h-12 w-12 rounded-full" />
              <SkelText width="7rem" textClass="text-lg" />
              <Skel className="-mr-2 h-12 w-12 rounded-full" />
            </div>

            <div
              aria-hidden="true"
              className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted"
            >
              {WEEKDAY_LABELS.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }, (_, i) => (
                <Skel key={i} className="h-12 rounded-[var(--radius-control)]" />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {[3.5, 4.5, 3.5, 7, 5].map((w, i) => (
                <SkelText key={i} width={`${w}rem`} textClass="text-xs" />
              ))}
            </div>
          </section>

          <section className="card p-5 lg:col-start-2 lg:row-start-2">
            <SkelText width="9rem" textClass="text-lg" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-control)] border border-card-border p-3"
                >
                  <SkelText width="3rem" textClass="text-xs" />
                  <div className="mt-1">
                    <SkelText width="1.75rem" textClass="text-2xl" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <SkelText width="11rem" textClass="text-sm" />
            </div>
          </section>
        </div>
      </SkeletonRegion>
    </main>
  );
}

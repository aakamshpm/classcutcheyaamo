import { Skel, SkelText, SkeletonRegion } from "@/app/components/skeleton";

// mirrors the me page (page.tsx): profile header, semesters, appearance,
// account
export default function MeLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 lg:max-w-5xl lg:px-6 lg:pt-10">
      <SkeletonRegion label="loading your profile">
        <div className="mb-6 flex items-center gap-4">
          <Skel className="h-14 w-14 flex-none rounded-full" />
          <div>
            <SkelText width="8rem" textClass="text-xl" />
            <SkelText width="11rem" textClass="text-sm" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <section className="card p-5">
            <SkelText width="6rem" textClass="text-lg" />
            <SkelText width="80%" textClass="text-sm" />
            <ul className="mt-3 flex flex-col">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="flex min-h-14 items-center justify-between gap-3 border-t border-card-border py-2 first:border-t-0"
                >
                  <div>
                    <SkelText width="8rem" textClass="text-base" />
                    <SkelText width="11rem" textClass="text-sm" />
                  </div>
                  <SkelText width="2.5rem" textClass="text-base" />
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-4">
            <section className="card p-5">
              <SkelText width="7rem" textClass="text-lg" />
              <SkelText width="70%" textClass="text-sm" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <Skel
                    key={i}
                    className="min-h-12 rounded-[var(--radius-control)]"
                  />
                ))}
              </div>
            </section>

            <section className="card p-5">
              <div className="mb-2">
                <SkelText width="6rem" textClass="text-lg" />
              </div>
              <div className="flex min-h-12 items-center">
                <SkelText width="5rem" textClass="text-sm" />
              </div>
            </section>
          </div>
        </div>
      </SkeletonRegion>
    </main>
  );
}

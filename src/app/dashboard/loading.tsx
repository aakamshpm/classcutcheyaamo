import { LogoMark } from "@/app/components/logo-mark";
import { Skel, SkelText, SkeletonRegion } from "@/app/components/skeleton";

// mirrors the home page (page.tsx + semester-overview.tsx) shape for shape
export default function HomeLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 lg:max-w-5xl lg:px-6 lg:pt-10">
      <SkeletonRegion label="loading home">
        <div className="mb-6 flex items-center gap-3">
          <LogoMark className="h-10 w-10 lg:hidden" />
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              hey,
              <SkelText width="6rem" textClass="text-xl" />
            </h1>
            <SkelText width="10rem" textClass="text-sm" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
            <section className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <SkelText width="9rem" textClass="text-lg" />
                  <SkelText width="12rem" textClass="text-sm" />
                </div>
                <Skel className="h-6 w-20 rounded-full" />
              </div>

              <div className="mt-5">
                <Skel className="mx-auto aspect-square w-full max-w-[13rem] rounded-full" />
              </div>

              <div className="gold-rule mx-auto mt-5 w-16 opacity-0" />
              <div className="mt-4 flex justify-center">
                <SkelText width="16rem" textClass="text-sm" className="max-w-full" />
              </div>
            </section>

            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card p-4">
                  <SkelText width="3.5rem" textClass="text-xs" />
                  <div className="mt-1">
                    <SkelText width="2.5rem" textClass="text-2xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <section className="card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <SkelText width="2.5rem" textClass="text-xs" />
                <SkelText width="7rem" textClass="text-sm" />
              </div>
              <div className="mt-1">
                <SkelText width="11rem" textClass="text-lg" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skel
                    key={i}
                    className="min-h-12 rounded-[var(--radius-control)]"
                  />
                ))}
              </div>
            </section>

            <section className="card p-5">
              <SkelText width="6rem" textClass="text-lg" />
              <ul className="mt-4 grid grid-cols-7 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <li key={i} className="flex flex-col items-center gap-1.5">
                    <SkelText width="1.25rem" textClass="text-xs" />
                    <Skel className="aspect-square w-full max-w-11 rounded-full" />
                    <SkelText width="1rem" textClass="text-xs" />
                  </li>
                ))}
              </ul>
            </section>

            <div className="card flex flex-col gap-3 p-5">
              <div className="flex min-h-12 items-center">
                <SkelText width="7rem" textClass="text-sm" />
              </div>
              <div className="border-t border-card-border pt-3">
                <SkelText width="12rem" textClass="text-sm" />
              </div>
            </div>
          </div>
        </div>
      </SkeletonRegion>
    </main>
  );
}

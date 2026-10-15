import { Skel, SkelText, SkeletonRegion } from "@/app/components/skeleton";

// mirrors the simulator page (page.tsx + simulator-view.tsx). the title and
// blurb are fixed text, so they are real.
export default function SimulatorLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 lg:max-w-5xl lg:px-6 lg:pt-10">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">cut simulator</h1>
        <p className="text-sm text-muted">
          see what a few days off would do, before you take them
        </p>
      </div>

      <SkeletonRegion
        label="loading simulator"
        className="grid gap-4 lg:grid-cols-2 lg:items-start"
      >
        <section className="card p-5 lg:col-start-1">
          <SkelText width="6rem" textClass="text-lg" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Skel className="min-h-12 rounded-[var(--radius-control)]" />
            <Skel className="min-h-12 rounded-[var(--radius-control)]" />
          </div>

          <div className="mt-5">
            <SkelText width="3rem" textClass="text-sm" />
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <Skel className="min-h-12 w-12 rounded-[var(--radius-control)]" />
            <div className="flex flex-col items-center">
              <SkelText width="3rem" textClass="text-5xl" />
              <SkelText width="4.5rem" textClass="text-sm" />
            </div>
            <Skel className="min-h-12 w-12 rounded-[var(--radius-control)]" />
          </div>

          <div className="mt-4 flex h-12 items-center">
            <Skel className="h-2 w-full rounded-full" />
          </div>
          <Skel className="mt-1 min-h-12 rounded-[var(--radius-control)]" />
        </section>

        <section className="card p-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SkelText width="9rem" textClass="text-lg" />
              <SkelText width="5rem" textClass="text-sm" />
            </div>
            <Skel className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-5">
            <Skel className="mx-auto aspect-square w-full max-w-[13rem] rounded-full" />
          </div>
          <div className="mt-4 flex justify-center">
            <SkelText width="9rem" textClass="text-sm" />
          </div>
          <div className="gold-rule mx-auto mt-4 w-16 opacity-0" />
          <div className="mt-4 flex justify-center">
            <SkelText width="16rem" textClass="text-sm" className="max-w-full" />
          </div>
        </section>

        <section className="card p-5 lg:col-start-1">
          <SkelText width="10rem" textClass="text-lg" />
          <SkelText width="80%" textClass="text-sm" />
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => (
              <Skel key={i} className="min-h-14 rounded-[var(--radius-control)]" />
            ))}
          </div>
        </section>
      </SkeletonRegion>
    </main>
  );
}

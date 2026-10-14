import Link from "next/link";
import { ArrowRightIcon } from "./components/icons";
import { LogoMark } from "./components/logo-mark";

// one column on phones (hero, sample, buttons); on wide screens the hero and
// buttons sit left and the sample card spans beside them
export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-md flex-1 content-center gap-8 px-4 py-10 lg:max-w-5xl lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8">
      <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:self-end lg:text-left">
        <LogoMark />
        <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
          classcutcheyaamo?
        </h1>
        <div className="gold-rule w-12" />
        <p className="max-w-sm text-base text-muted">
          track your attendance percentage, semester by semester, so you
          always know if it&apos;s safe to skip today.
        </p>
      </div>

      <SamplePreview />

      <div className="flex w-full max-w-sm flex-col gap-3 justify-self-center lg:col-start-1 lg:row-start-2 lg:justify-self-start lg:self-start">
        <Link href="/signup" className="btn-primary gap-2">
          sign up
          <ArrowRightIcon />
        </Link>
        <Link href="/login" className="btn-secondary">
          log in
        </Link>
      </div>
    </main>
  );
}

// a fixed example of what the dashboard shows, not tied to any account
function SamplePreview() {
  return (
    <section
      aria-label="sample attendance"
      className="card w-full p-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
    >
      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <span>sample semester</span>
        <span className="chip">preview</span>
      </div>

      <div className="flex items-end justify-between">
        <p className="tnum text-6xl font-semibold tracking-tight">
          82%
          <span className="ml-2 text-sm font-normal text-muted">overall</span>
        </p>
        <span className="chip chip-safe">safe aanu</span>
      </div>

      <div className="mt-5" aria-hidden="true">
        <div className="relative h-2 rounded-full bg-status-holiday-bg">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: "82%" }}
          />
          <div
            className="absolute -top-1 h-4 w-0.5 bg-gold"
            style={{ left: "75%" }}
          />
        </div>
      </div>
      <div className="tnum mt-2 flex justify-between text-xs text-muted">
        <span>75% required</span>
        <span>safe to skip 3 more days</span>
      </div>
    </section>
  );
}

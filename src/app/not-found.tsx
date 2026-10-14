import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "./components/icons";
import { LogoMark } from "./components/logo-mark";

export const metadata: Metadata = {
  title: "page not found · classcutcheyaamo?",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <LogoMark />
      <span className="chip chip-danger">error 404</span>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          this page bunked class
        </h1>
        <p className="text-sm text-muted">
          it&apos;s not on the timetable, or it slipped out for chai. check the
          link, or head back.
        </p>
      </div>

      <div className="card tnum w-full p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted">page attendance</span>
          <span className="font-semibold text-status-absent">0.0%</span>
        </div>
        <div className="my-3 h-px bg-card-border" />
        <div className="flex items-center justify-between">
          <span className="text-muted">required</span>
          <span className="font-semibold">75%</span>
        </div>
      </div>

      <Link href="/" className="btn-primary w-full gap-2">
        take me home
        <ArrowRightIcon />
      </Link>
    </main>
  );
}

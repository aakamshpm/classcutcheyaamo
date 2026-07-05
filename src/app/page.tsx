import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-5xl">🎒</span>
        <h1 className="text-4xl font-bold tracking-tight">
          classcutcheyaamo?
        </h1>
        <p className="max-w-sm text-base text-muted">
          track your attendance percentage, semester by semester, so you
          always know if it&apos;s safe to skip today.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/signup" className="btn-primary px-6 py-3 text-sm">
          sign up
        </Link>
        <Link href="/login" className="btn-secondary px-6 py-3 text-sm">
          log in
        </Link>
      </div>
    </main>
  );
}

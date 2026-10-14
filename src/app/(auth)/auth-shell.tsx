import Link from "next/link";
import { ArrowLeftIcon } from "../components/icons";
import { LogoMark } from "../components/logo-mark";

// frame shared by login, signup and reset-password: back link, wordmark with
// the gold hairline, then the form card
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-3">
      <Link
        href="/"
        aria-label="back to home"
        className="-ml-3 flex h-12 w-12 items-center justify-center rounded-full text-foreground"
      >
        <ArrowLeftIcon />
      </Link>

      <div className="flex flex-1 flex-col justify-center gap-6 py-4">
        <header>
          <div className="mb-4 flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="text-sm font-semibold">classcutcheyaamo?</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <div className="gold-rule mt-3 w-12" />
          <p className="mt-3 text-sm text-muted">{subtitle}</p>
        </header>

        <div className="card p-5">{children}</div>

        {footer && <div className="text-center text-sm text-muted">{footer}</div>}
      </div>
    </main>
  );
}

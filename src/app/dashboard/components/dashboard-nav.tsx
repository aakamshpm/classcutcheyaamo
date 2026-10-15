"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  HomeIcon,
  SimulatorIcon,
  UserIcon,
} from "@/app/components/icons";
import { LogoMark } from "@/app/components/logo-mark";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: (pathname: string) => boolean;
};

// phones get a bottom tab bar, wide screens get the same tabs in a top bar.
// `calendarHref` is the semester the calendar tab opens, null when the user
// has no semester yet (then the calendar and simulator have nothing to show,
// so only home and me are there).
export function DashboardNav({ calendarHref }: { calendarHref: string | null }) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    {
      href: "/dashboard",
      label: "home",
      icon: <HomeIcon className="h-6 w-6" />,
      isActive: (p) => p === "/dashboard",
    },
  ];
  if (calendarHref) {
    tabs.push({
      href: calendarHref,
      label: "calendar",
      icon: <CalendarIcon className="h-6 w-6" />,
      isActive: (p) => p.startsWith("/dashboard/sessions"),
    });
    tabs.push({
      href: "/dashboard/simulator",
      label: "simulator",
      icon: <SimulatorIcon className="h-6 w-6" />,
      isActive: (p) => p.startsWith("/dashboard/simulator"),
    });
  }
  tabs.push({
    href: "/dashboard/me",
    label: "me",
    icon: <UserIcon className="h-6 w-6" />,
    isActive: (p) => p.startsWith("/dashboard/me"),
  });

  return (
    <>
      <nav
        aria-label="main"
        className="fixed inset-x-0 bottom-0 z-30 bg-background px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
      >
        {/* floats on the page colour so it doesn't merge with a white system gesture bar below it */}
        <ul className="mx-auto flex max-w-md overflow-hidden rounded-[var(--radius)] border border-card-border bg-card">
          {tabs.map((tab) => {
            const active = tab.isActive(pathname);
            return (
              <li key={tab.label} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                    active ? "text-primary" : "text-muted"
                  }`}
                >
                  {active && (
                    <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" />
                  )}
                  {tab.icon}
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <header className="hidden border-b border-card-border bg-card lg:block">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <LogoMark className="h-9 w-9" />
            <span className="font-semibold tracking-tight">
              classcutcheyaamo?
            </span>
          </Link>
          <nav aria-label="main">
            <ul className="flex gap-1">
              {tabs.map((tab) => {
                const active = tab.isActive(pathname);
                return (
                  <li key={tab.label}>
                    <Link
                      href={tab.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-medium transition-colors ${
                        active
                          ? "bg-status-present-bg text-primary"
                          : "text-muted hover:bg-status-holiday-bg"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

// small date helpers that work purely with 'YYYY-MM-DD' strings, treating
// them as UTC dates so timezones never shift a day off by accident.

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(dateISO: string, delta: number): string {
  const d = parseISODate(dateISO);
  d.setUTCDate(d.getUTCDate() + delta);
  return toISODate(d);
}

// sunday = 0, saturday = 6 — both count as weekend holidays by default
export function isWeekend(dateISO: string): boolean {
  const dow = parseISODate(dateISO).getUTCDay();
  return dow === 0 || dow === 6;
}

export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = month + delta;
  const newYear = year + Math.floor(total / 12);
  const newMonth = ((total % 12) + 12) % 12;
  return { year: newYear, month: newMonth };
}

export function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// returns a grid of weeks, each week is 7 cells, padded with null for days
// outside the month so the grid always lines up under weekday headers.
// weeks start on sunday unless `mondayFirst` is set.
export function getMonthMatrix(
  year: number,
  month: number,
  mondayFirst = false,
): (string | null)[][] {
  const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const startDow = mondayFirst ? (firstDow + 6) % 7 : firstDow;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(Date.UTC(year, month, day))));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

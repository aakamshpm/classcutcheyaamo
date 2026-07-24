import { MOBILE_API } from "@/constants/config";

// shapes returned by the mobile api, kept in sync with the route handlers
// in the website's src/app/api/mobile.
export type AttendanceStats = {
  workingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  percentage: number | null;
  safeToBunk: number;
  needToAttend: number;
  unmarkedDays: number;
};

export type DayStatus = "present" | "absent" | "half_day" | "holiday";
export type MarkedDay = { date: string; status: DayStatus };

export type SemesterSummary = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  requiredPercentage: number;
  active: boolean;
  stats: AttendanceStats | null;
};

export type SemesterDetail = {
  semester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string | null;
    requiredPercentage: number;
    active: boolean;
  };
  marks: MarkedDay[];
  stats: AttendanceStats | null;
};

export type AuthResponse = {
  token: string;
  user: { id: string; username: string };
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (token) headers["authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${MOBILE_API}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // network-level failure (no connection, dns, etc.)
    throw new ApiError("couldn't reach the server, check your connection", 0);
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : "something went wrong";
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const api = {
  login: (username: string, password: string) =>
    request<AuthResponse>("/login", {
      method: "POST",
      body: { username, password },
    }),

  signup: (username: string, password: string) =>
    request<AuthResponse>("/signup", {
      method: "POST",
      body: { username, password },
    }),

  listSemesters: (token: string) =>
    request<{ semesters: SemesterSummary[] }>("/semesters", { token }),

  createSemester: (
    token: string,
    input: { name: string; startDate: string; requiredPercentage: number },
  ) =>
    request<{ semester: SemesterSummary }>("/semesters", {
      method: "POST",
      body: input,
      token,
    }),

  getSemester: (token: string, id: string) =>
    request<SemesterDetail>(`/semesters/${id}`, { token }),

  updateSemester: (
    token: string,
    id: string,
    input: { startDate?: string; requiredPercentage?: number },
  ) =>
    request<{ semester: unknown }>(`/semesters/${id}`, {
      method: "PATCH",
      body: input,
      token,
    }),

  endSemester: (token: string, id: string, endDate: string) =>
    request<{ semester: unknown }>(`/semesters/${id}/end`, {
      method: "POST",
      body: { endDate },
      token,
    }),

  setDay: (token: string, id: string, date: string, status: DayStatus) =>
    request<{ ok: true }>(`/semesters/${id}/days`, {
      method: "PUT",
      body: { date, status },
      token,
    }),

  clearDay: (token: string, id: string, date: string) =>
    request<{ ok: true }>(
      `/semesters/${id}/days?date=${encodeURIComponent(date)}`,
      { method: "DELETE", token },
    ),
};

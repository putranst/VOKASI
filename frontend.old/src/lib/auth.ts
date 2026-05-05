export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
}

declare const process:
  | { env?: Record<string, string | undefined> }
  | undefined;

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  user: UserPublic;
}

export const ACCESS_TOKEN_KEY = "vokasi_access_token";
export const USER_KEY = "vokasi_user";

export function getApiBase(): string {
  const explicit =
    process?.env?.NEXT_PUBLIC_BACKEND_URL ??
    process?.env?.NEXT_PUBLIC_API_URL ??
    "";
  return explicit.replace(/\/+$/, "");
}

function buildApiCandidates(path: string): string[] {
  const base = getApiBase();
  const urls = base ? [`${base}${path}`, path] : [path];
  return Array.from(new Set(urls));
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  let lastError = "Login failed";

  for (const url of buildApiCandidates("/api/v1/auth/login")) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        return (await res.json()) as LoginResponse;
      }

      const body = await safeJson(res);
      lastError = body?.detail ?? body?.message ?? lastError;
    } catch {
      continue;
    }
  }

  throw new Error(lastError);
}

export async function fetchMe(token: string): Promise<UserPublic> {
  let lastError = "Failed to fetch current user";

  for (const url of buildApiCandidates("/api/v1/users/me")) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        return (await res.json()) as UserPublic;
      }

      const body = await safeJson(res);
      lastError = body?.detail ?? body?.message ?? lastError;
    } catch {
      continue;
    }
  }

  throw new Error(lastError);
}

export function saveSession(token: string, user: UserPublic): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function loadSession(): { token: string | null; user: UserPublic | null } {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return { token, user: null };
  }

  try {
    const user = JSON.parse(rawUser) as UserPublic;
    return { token, user };
  } catch {
    return { token, user: null };
  }
}

async function safeJson(res: Response): Promise<Record<string, string> | null> {
  try {
    return (await res.json()) as Record<string, string>;
  } catch {
    return null;
  }
}

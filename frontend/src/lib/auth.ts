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
  return process?.env?.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${getApiBase()}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await safeJson(res);
    const message = body?.detail ?? body?.message ?? "Login failed";
    throw new Error(message);
  }

  return (await res.json()) as LoginResponse;
}

export async function fetchMe(token: string): Promise<UserPublic> {
  const res = await fetch(`${getApiBase()}/api/v1/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await safeJson(res);
    const message = body?.detail ?? body?.message ?? "Failed to fetch current user";
    throw new Error(message);
  }

  return (await res.json()) as UserPublic;
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

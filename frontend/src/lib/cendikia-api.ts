// ─── CENDIKIA API Client ──────────────────────────────────────────────────────
// Typed fetch wrapper for all CENDIKIA backend endpoints.
// Base URL is resolved from the NEXT_PUBLIC_API_URL env variable,
// falling back to http://localhost:8000 for local development.

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

const API_BASE_CANDIDATES = Array.from(
  new Set(
    [
      API_BASE,
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://localhost:8001",
      "http://127.0.0.1:8001",
    ].filter(Boolean),
  ),
);

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Module {
  id: string;
  order: number;
  title: string;
  content_md?: string;
  content_blocks?: EditorContentBlock[];
  est_minutes: number;
  completed?: boolean;
  locked?: boolean;
}

export interface EditorContentBlock {
  id: string;
  type: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: "Pemula" | "Menengah" | "Lanjutan" | string;
  jp_hours: number;
  price_idr: number;
  thumbnail_url?: string;
  modules: Module[];
  enrolled?: boolean;
  progress_pct?: number;
}

export interface CourseListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  jp_hours: number;
  price_idr: number;
  thumbnail_url?: string;
  module_count: number;
  enrolled?: boolean;
}

export interface Session {
  id: string;
  course_id: string;
  module_id: string;
  user_id: string;
  status: "active" | "ended";
  created_at: string;
  ended_at?: string;
}

export interface Certificate {
  id: string;
  cert_number: string;
  course_id: string;
  course_title: string;
  user_id: string;
  full_name: string;
  university?: string;
  issued_at: string;
  pdf_url?: string;
  verify_url?: string;
}

export interface CertificateVerification {
  valid: boolean;
  cert_number: string;
  course_title: string;
  full_name: string;
  university?: string;
  issued_at: string;
  issued_by: string;
}

export interface Payment {
  id: string;
  course_id: string;
  user_id: string;
  amount_idr: number;
  status: "pending" | "paid" | "failed" | "refunded";
  payment_url?: string;
  promo_code?: string;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  university?: string;
  student_id?: string;
  role?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  university?: string;
  student_id?: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

export interface ModuleProgress {
  module_id: string;
  course_id: string;
  completed: boolean;
  completed_at?: string;
  score?: number;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function authHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const userId = parsed?.id;
        if (userId !== undefined && userId !== null) {
          headers["X-User-Id"] = String(userId);
        }
      }
    } catch {
      // ignore localStorage parse errors
    }
  }

  return headers;
}

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

function getLocalUserId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("user");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const userId = parsed?.id;
    if (userId === undefined || userId === null) return undefined;
    return String(userId);
  } catch {
    return undefined;
  }
}

function normalizeSession(payload: any): Session {
  return {
    id: String(payload?.id ?? payload?.session_id ?? ""),
    course_id: String(payload?.course_id ?? ""),
    module_id: String(payload?.module_id ?? ""),
    user_id: String(payload?.user_id ?? ""),
    status: payload?.status === "ended" ? "ended" : "active",
    created_at: String(payload?.created_at ?? payload?.started_at ?? new Date().toISOString()),
    ended_at: payload?.ended_at ? String(payload.ended_at) : undefined,
  };
}

/**
 * Wraps fetch and throws a typed ApiError on non-2xx responses.
 */
async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  let res: Response | null = null;
  let lastNetworkError: unknown;

  try {
    res = await fetch(input, init);
  } catch (err) {
    lastNetworkError = err;

    if (typeof input === "string" && input.startsWith(API_BASE)) {
      const fallbackCandidates = API_BASE_CANDIDATES.filter(
        (base) => base !== API_BASE,
      );

      for (const fallbackBase of fallbackCandidates) {
        try {
          const fallbackUrl = input.replace(API_BASE, fallbackBase);
          res = await fetch(fallbackUrl, init);
          break;
        } catch (fallbackErr) {
          lastNetworkError = fallbackErr;
        }
      }
    }
  }

  if (!res) {
    throw lastNetworkError instanceof Error
      ? lastNetworkError
      : new Error("Failed to fetch");
  }

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const body = await res.json();
      detail = body?.detail ?? body?.message ?? undefined;
    } catch {
      // ignore parse errors
    }
    const err: ApiError = {
      status: res.status,
      message: detail ?? res.statusText,
      detail,
    };
    throw err;
  }

  // 204 No Content — return undefined cast to T
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const cendikiaApi = {
  // ── Courses ────────────────────────────────────────────────────────────────

  /**
   * List all published courses (public, no auth required).
   */
  getCourses: (): Promise<CourseListItem[]> =>
    apiFetch(`${API_BASE}/api/v1/cendikia/courses`),

  /**
   * Get a single course with its full module list.
   * If a token is provided, enrolled/progress info will be included.
   */
  getCourse: (id: string, token?: string): Promise<Course> =>
    apiFetch(`${API_BASE}/api/v1/cendikia/courses/${id}`, {
      headers: authHeaders(token),
    }),

  /**
   * Get a single module's content (requires enrollment).
   */
  getModule: (
    courseId: string,
    moduleId: string,
    token?: string,
  ): Promise<Module> =>
    apiFetch(
      `${API_BASE}/api/v1/cendikia/courses/${courseId}/modules/${moduleId}`,
      { headers: authHeaders(token) },
    ),

  // ── Module Progress ────────────────────────────────────────────────────────

  /**
   * Mark a module as completed.
   */
  markModuleComplete: (
    courseId: string,
    moduleId: string,
    token?: string,
  ): Promise<ModuleProgress> =>
    apiFetch(
      `${API_BASE}/api/v1/cendikia/courses/${courseId}/modules/${moduleId}/complete`,
      {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ time_spent_sec: 0 }),
      },
    ),

  /**
   * Fetch completion state for all modules in a course.
   */
  getCourseProgress: (
    courseId: string,
    token?: string,
  ): Promise<ModuleProgress[]> =>
    apiFetch(
      `${API_BASE}/api/v1/cendikia/courses/${courseId}/progress`,
      { headers: authHeaders(token) },
    ),

  // ── Sessions (AI Classroom) ────────────────────────────────────────────────

  /**
   * Create a new AI Classroom session for a course module.
   * Returns the new session, including its id (used for the WebSocket URL).
   */
  createSession: async (
    courseId: string,
    moduleId: string,
    token?: string,
  ): Promise<Session> => {
    const primaryBody = { course_id: courseId, module_id: moduleId };

    try {
      const payload = await apiFetch<any>(`${API_BASE}/api/v1/sessions`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(primaryBody),
      });
      return normalizeSession(payload);
    } catch (err) {
      const apiErr = err as Partial<ApiError>;
      if (![401, 403, 404].includes(Number(apiErr?.status))) throw err;
    }

    const localUserId = getLocalUserId();
    if (!localUserId || Number.isNaN(Number(localUserId))) {
      throw {
        status: 401,
        message: "Valid user context is required to create classroom session.",
      } as ApiError;
    }

    const payload = await apiFetch<any>(`${API_BASE}/api/v1/classroom/sessions`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        ...primaryBody,
        user_id: Number(localUserId),
      }),
    });

    return normalizeSession(payload);
  },

  /**
   * Fetch an existing session by id.
   */
  getSession: async (sessionId: string, token?: string): Promise<Session> => {
    try {
      const payload = await apiFetch<any>(`${API_BASE}/api/v1/sessions/${sessionId}`, {
        headers: authHeaders(token),
      });
      return normalizeSession(payload);
    } catch (err) {
      const apiErr = err as Partial<ApiError>;
      if (![401, 403, 404].includes(Number(apiErr?.status))) throw err;
    }

    const payload = await apiFetch<any>(`${API_BASE}/api/v1/classroom/sessions/${sessionId}`, {
      headers: authHeaders(token),
    });
    return normalizeSession(payload);
  },

  /**
   * End an active session.
   */
  endSession: (sessionId: string, token?: string): Promise<Session> =>
    apiFetch(`${API_BASE}/api/v1/sessions/${sessionId}/end`, {
      method: "POST",
      headers: authHeaders(token),
    }),

  /**
   * List all sessions for the authenticated user.
   */
  getSessions: (token?: string): Promise<Session[]> =>
    apiFetch(`${API_BASE}/api/v1/sessions`, {
      headers: authHeaders(token),
    }),

  // ── Certificates ───────────────────────────────────────────────────────────

  /**
   * List all certificates earned by the authenticated user.
   */
  getCertificates: (token: string): Promise<Certificate[]> =>
    apiFetch(`${API_BASE}/api/v1/certificates`, {
      headers: authHeaders(token),
    }),

  /**
   * Fetch a single certificate for the authenticated user.
   */
  getCertificate: (certId: string, token: string): Promise<Certificate> =>
    apiFetch(`${API_BASE}/api/v1/certificates/${certId}`, {
      headers: authHeaders(token),
    }),

  /**
   * Public certificate verification — no auth required.
   * Used by the /verify/[certId] page for QR-scannable links.
   */
  verifyCertificate: (certId: string): Promise<CertificateVerification> =>
    apiFetch(`${API_BASE}/api/v1/verify/${certId}`),

  /**
   * Request PDF generation / get PDF download URL for a certificate.
   */
  getCertificatePdfUrl: (certId: string, token: string): Promise<{ url: string }> =>
    apiFetch(`${API_BASE}/api/v1/certificates/${certId}/pdf`, {
      headers: authHeaders(token),
    }),

  // ── Payments ───────────────────────────────────────────────────────────────

  /**
   * Initiate a payment for a course enrollment.
   * Returns a payment record including a payment_url redirect (e.g. Midtrans).
   */
  createPayment: (
    courseId: string,
    promoCode: string | null,
    token: string,
  ): Promise<Payment> =>
    apiFetch(`${API_BASE}/api/v1/payments`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        course_id: courseId,
        promo_code: promoCode ?? undefined,
      }),
    }),

  /**
   * Get current status of a payment.
   */
  getPayment: (paymentId: string, token: string): Promise<Payment> =>
    apiFetch(`${API_BASE}/api/v1/payments/${paymentId}`, {
      headers: authHeaders(token),
    }),

  // ── Auth ───────────────────────────────────────────────────────────────────

  /**
   * Register a new student account.
   */
  register: (data: RegisterData): Promise<LoginResponse> =>
    apiFetch(`${API_BASE}/api/v1/auth/register`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    }),

  /**
   * Email + password login. Returns a JWT access token.
   */
  login: (email: string, password: string): Promise<LoginResponse> =>
    apiFetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ email, password }),
    }),

  /**
   * Fetch the authenticated user's profile.
   */
  getProfile: (token: string): Promise<UserProfile> =>
    apiFetch(`${API_BASE}/api/v1/auth/me`, {
      headers: authHeaders(token),
    }),

  /**
   * Update the authenticated user's profile fields.
   */
  updateProfile: (
    data: Partial<Pick<UserProfile, "full_name" | "university" | "student_id" | "avatar_url">>,
    token: string,
  ): Promise<UserProfile> =>
    apiFetch(`${API_BASE}/api/v1/auth/me`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
};

export default cendikiaApi;

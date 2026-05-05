/**
 * VOKASI Role-Based Access Control — shared route map
 * AM-002: Used by both Next.js Edge middleware and client RoleGuard.
 *
 * Roles (matches sql_models User.role):
 *   student | instructor | institution_admin | admin
 */

export type VokasiRole = "student" | "instructor" | "institution_admin" | "admin";

/**
 * Route prefix → minimum roles allowed.
 * Order matters — more specific prefixes first.
 * An empty allowedRoles array means "any authenticated user".
 */
export const ROUTE_ROLE_MAP: Array<{
  prefix: string;
  allowedRoles: VokasiRole[];
  redirectTo?: string;
}> = [
  // Superadmin only
  { prefix: "/admin", allowedRoles: ["admin"] },

  // Institution dashboard — admin or institution_admin
  { prefix: "/institution-dashboard", allowedRoles: ["admin", "institution_admin"] },

  // Instructor tools — instructor or admin
  { prefix: "/instructor", allowedRoles: ["instructor", "admin"] },

  // Student-facing authenticated routes — any logged-in role
  { prefix: "/dashboard",   allowedRoles: [] },
  { prefix: "/profile",     allowedRoles: [] },
  { prefix: "/courses",     allowedRoles: [] },
  { prefix: "/ai-tutor",    allowedRoles: [] },
  { prefix: "/cloud-ide",   allowedRoles: [] },
  { prefix: "/community",   allowedRoles: [] },
  { prefix: "/pathways",    allowedRoles: [] },
];

/** Public routes — never checked (login, register, marketing pages, etc.) */
export const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/team",
  "/contact",
  "/blog",
  "/partner",
  "/partners",
  "/enterprise",
  "/government",
  "/sdg",
  "/hexahelix",
  "/docs",
  "/faq",
  "/success-stories",
  "/verify-credential",
  "/studio",
  "/",
];

/** Returns the matching rule for a given pathname, or null if public. */
export function matchRouteRule(pathname: string) {
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p === "/" ? "/_next" : p))) {
    return null;
  }
  return ROUTE_ROLE_MAP.find((r) => pathname.startsWith(r.prefix)) ?? null;
}

/** True if the user's role satisfies the rule. */
export function roleAllowed(userRole: VokasiRole | string, rule: { allowedRoles: VokasiRole[] }): boolean {
  if (rule.allowedRoles.length === 0) return true; // any authenticated user
  return rule.allowedRoles.includes(userRole as VokasiRole);
}

import RoleGuard from "@/components/RoleGuard";
import type { ReactNode } from "react";

export default function InstitutionDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["admin", "institution_admin"]}>
      {children}
    </RoleGuard>
  );
}

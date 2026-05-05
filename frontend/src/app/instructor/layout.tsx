import RoleGuard from "@/components/RoleGuard";
import type { ReactNode } from "react";

export default function InstructorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["instructor", "admin"]}>
      {children}
    </RoleGuard>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { BookOpen, BarChart3, Users, Settings, PlusCircle, LayoutDashboard } from "lucide-react";

const NAV_ITEMS = [
  { href: "/instructor/courses", label: "My Courses", icon: BookOpen },
  { href: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/instructor/students", label: "Students", icon: Users },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-zinc-900">
              <div className="h-7 w-7 rounded-lg bg-[#0d9488] flex items-center justify-center">
                <span className="text-white text-sm font-bold">V</span>
              </div>
              VOKASI<span className="text-[#0d9488]">2</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${active ? "bg-[#0d9488]/10 text-[#0d9488]" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"}`}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/instructor/courses/new"
              className="flex items-center gap-1.5 rounded-lg bg-[#0d9488] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0f766e] transition-colors">
              <PlusCircle className="w-4 h-4" />
              New Course
            </Link>
            <div className="h-8 w-px bg-zinc-200" />
            <Link href="/student" className="text-sm text-zinc-500 hover:text-[#0d9488]">← Student View</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
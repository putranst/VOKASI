"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import {
  BrainCircuit,
  LayoutDashboard,
  Trophy,
  FolderOpen,
  Box,
  GraduationCap,
  BarChart3,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = {
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/challenges", label: "Challenge Arena", icon: Trophy },
    { href: "/student/portfolio", label: "Portfolio", icon: FolderOpen },
    { href: "/student/sandbox", label: "Sandbox", icon: Box },
  ],
  instructor: [
    { href: "/instructor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/instructor/courses", label: "Kursus", icon: GraduationCap },
    { href: "/instructor/analytics", label: "Analitik", icon: BarChart3 },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/institutions", label: "Institusi", icon: Building2 },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
        <div className="text-center">
          <p className="text-[#64748b] mb-4">Please log in to access the dashboard.</p>
          <Link href="/login">
            <Button className="bg-[#064e3b] hover:bg-[#065f3c] text-white">
              Log in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = NAV_ITEMS[user.role as keyof typeof NAV_ITEMS] || NAV_ITEMS.student;

  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e2e8f0] fixed inset-y-0 pt-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#e2e8f0]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#064e3b] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#064e3b]">VOKASI</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#f0fdf4] text-[#064e3b] border border-[#34d399]/30"
                      : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#1f2937]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-[#e2e8f0]">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#f8fafc] transition-colors text-left cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#064e3b] text-white text-xs">
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1f2937] truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-[#64748b] capitalize">{user.role}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Link href="/student/portfolio" className="flex items-center gap-1.5 w-full">Portfolio</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { logout(); setMobileOpen(false); }}
              className="text-[#f43f5e] cursor-pointer data-[variant=destructive]:text-[#f43f5e]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e2e8f0] h-14 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mr-3 text-[#64748b]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#064e3b] flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-[#064e3b]">VOKASI</span>
        </Link>
        <div className="ml-auto">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-[#064e3b] text-white text-xs">
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside
            className="absolute left-0 top-14 bottom-0 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-3 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive
                          ? "bg-[#f0fdf4] text-[#064e3b]"
                          : "text-[#64748b]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                  </Link>
                );
              })}
              <hr className="my-3 border-[#e2e8f0]" />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] transition-colors w-full">
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Link href="/student/portfolio" className="flex items-center gap-1.5 w-full">Portfolio</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { logout(); setMobileOpen(false); }}
              className="text-[#f43f5e] cursor-pointer data-[variant=destructive]:text-[#f43f5e]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

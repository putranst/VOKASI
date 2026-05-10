"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/student", label: "Dashboard", icon: "◈" },
  { href: "/student/arena", label: "Arena", icon: "◐" },
  { href: "/student/enrollments", label: "Courses", icon: "◇" },
  { href: "/student/tutor", label: "AI Tutor", icon: "🤖" },
  { href: "/student/portfolio", label: "Portfolio", icon: "◎" },
  { href: "/student/badges", label: "Badges", icon: "◆" },
  { href: "/student/leaderboard", label: "Leaderboard", icon: "◉" },
  { href: "/student/mentors", label: "Mentors", icon: "◑" },
  { href: "/student/peer-reviews", label: "Peer Reviews", icon: "◐" },
  { href: "/student/certificates", label: "Certificates", icon: "🜂" },
  { href: "/student/reflection", label: "Journal", icon: "◈" },
  { href: "/student/streaks", label: "Streaks", icon: "◎" },
  { href: "/student/requests", label: "Requests", icon: "○" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vokasi_token");
    if (!token) router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-slate-900 border-r border-slate-800 transform transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
          <span className="text-emerald-400 text-lg">◆</span>
          <span className="font-bold text-emerald-400 tracking-wide">VOKASI2</span>
        </div>
        <nav className="py-3 space-y-0.5 px-3 overflow-y-auto max-h-[calc(100vh-60px)]">
          {NAV_LINKS.map(link => {
            const active = pathname === link.href || (link.href !== "/student" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? "bg-emerald-500/10 text-emerald-400 font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}>
                <span className="text-base w-4 text-center">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 text-xl mr-4">☰</button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative text-slate-400 hover:text-slate-200">
              <span className="text-lg">🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">1</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm cursor-pointer"
              onClick={() => { localStorage.clear(); router.push("/login"); }}>
              S
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

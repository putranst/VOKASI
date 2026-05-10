"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/mentor", label: "Dashboard", icon: "◈" },
  { href: "/mentor/requests", label: "Requests", icon: "📩" },
  { href: "/mentor/students", label: "My Students", icon: "👨‍🎓" },
  { href: "/mentor/sessions", label: "Sessions", icon: "📅" },
];

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("vokasi_token");
    const role = localStorage.getItem("vokasi_role");
    if (!token || (role !== "mentor" && role !== "admin")) router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        <aside className="w-56 shrink-0 bg-slate-900 border-r border-slate-800 min-h-screen sticky top-0 hidden lg:flex flex-col">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
            <span className="text-purple-400 text-lg">◆</span>
            <span className="font-bold text-purple-400 tracking-wide">MENTOR</span>
          </div>
          <nav className="flex-1 py-4 space-y-0.5 px-3">
            {NAV_ITEMS.map(item => (
              <a key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                <span className="text-base">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="flex items-center justify-end px-6 py-3 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button className="relative text-slate-400 hover:text-slate-200">
                <span className="text-lg">🔔</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">M</div>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

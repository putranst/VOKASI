import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/login", label: "Login" },
];

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="app-root">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/" className="brand">
            VOKASI
          </Link>
          <nav className="nav-links" aria-label="Main Navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="container page-wrap">
        <div className="page-header">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}

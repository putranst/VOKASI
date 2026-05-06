import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "VOKASI2 — AI-Vocational Education Platform",
  description: "Brain-based AI education for Indonesian SMK, polytechnic, and university students. Learn by building challenges, earn verified credentials.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}

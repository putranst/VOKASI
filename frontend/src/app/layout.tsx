import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AICompanion } from "@/components/ui/AICompanion";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TSEA-X | Transform Southeast Asia through Education",
  description: "AI-powered competency learning platform featuring Soulbound Credentials, Socratic Bots, and real-time policy-to-practice integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased overflow-x-hidden`}
      >
        <Providers>
          {children}
          <AICompanion />
        </Providers>
      </body>
    </html>
  );
}

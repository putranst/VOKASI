import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AICompanion } from "@/components/ui/AICompanion";

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: "--font-lato",
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
        className={`${lato.variable} antialiased`}
      >
        <Providers>
          {children}
          <AICompanion />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VOKASI — Brain-Based AI Learning Platform",
    template: "%s | VOKASI",
  },
  description:
    "AI-native vocational education platform that builds demonstrable AI capabilities — not just certificates. For Indonesian SMK, polytechnics, and universities.",
  keywords: [
    "AI learning",
    "vocational education",
    "Indonesia",
    "SMK",
    "polytechnic",
    "brain-based learning",
    "AI skills",
  ],
  authors: [{ name: "VOKASI" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "VOKASI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AICompanion } from "@/components/ui/AICompanion";
import { ThemeInjector } from "@/components/ThemeInjector";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "VOKASI | AI-native Vocational Education for Indonesia",
  description:
    "AI-native vocational education platform — build, teach, and learn with AI-grounded courses tailored for Indonesian SMK, politeknik, and BLK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased overflow-x-hidden`}
      >
        <Providers>
          <ThemeInjector />
          {children}
          <AICompanion />
        </Providers>
      </body>
    </html>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const userData = await login(email, password);
      // Redirect based on role
      const role = userData?.role || "student";
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "instructor") {
        router.push("/instructor");
      } else if (role === "mentor") {
        router.push("/mentor");
      } else {
        router.push("/student");
      }
    } catch {
      setError("Email atau password salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center px-6 border-b border-[#e2e8f0] bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#064e3b] flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#064e3b]">VOKASI</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold text-[#1f2937]">
                Masuk ke VOKASI
              </CardTitle>
              <CardDescription className="text-sm text-[#64748b]">
                Belum punya akun?{" "}
                <Link href="/register" className="text-[#064e3b] font-medium hover:underline">
                  Daftar gratis
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-[#fff1f2] border border-[#f43f5e]/20 text-sm text-[#f43f5e]">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-[#1f2937]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-[#1f2937]">
                      Password
                    </Label>
                    <button type="button" className="text-xs text-[#64748b] hover:text-[#064e3b]">
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1f2937]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-[#064e3b] hover:bg-[#065f3c] text-white font-medium"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

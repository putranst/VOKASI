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

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "instructor",
    institutionId: "",
    nisn: "",
    nim: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    try {
      await register(formData);
      router.push("/student");
    } catch {
      setError("Registrasi gagal. Email mungkin sudah terdaftar.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-[#e2e8f0] bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#064e3b] flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#064e3b]">VOKASI</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-[#e2e8f0] shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold text-[#1f2937]">
                Buat Akun VOKASI
              </CardTitle>
              <CardDescription className="text-sm text-[#64748b]">
                Gratis selamanya untuk pelajar Indonesia.{" "}
                <Link href="/login" className="text-[#064e3b] font-medium hover:underline">
                  Sudah punya akun?
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

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium text-[#1f2937]">
                    Nama Lengkap
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Putra Nasution"
                    value={formData.fullName}
                    onChange={handleChange("fullName")}
                    required
                    className="h-10"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-[#1f2937]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleChange("email")}
                    required
                    autoComplete="email"
                    className="h-10"
                  />
                </div>

                {/* Role selection */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#1f2937]">Daftar sebagai</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["student", "instructor"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, role }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          formData.role === role
                            ? "border-[#064e3b] bg-[#f0fdf4] text-[#064e3b]"
                            : "border-[#e2e8f0] text-[#64748b] hover:border-[#064e3b]/30"
                        }`}
                      >
                        {role === "student" ? "🎓 Pelajar" : "📚 Instruktur"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NISN/NIM */}
                {formData.role === "student" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="nisn" className="text-sm font-medium text-[#1f2937]">
                      NISN (untuk SMK) atau NIM (untuk Universitas)
                    </Label>
                    <Input
                      id="nisn"
                      type="text"
                      placeholder="Contoh: 0012345678"
                      value={formData.nisn}
                      onChange={handleChange("nisn")}
                      className="h-10"
                    />
                  </div>
                )}

                {/* Password */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium text-[#1f2937]">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 karakter"
                        value={formData.password}
                        onChange={handleChange("password")}
                        required
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#1f2937]">
                      Konfirmasi
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ulangi password"
                      value={formData.confirmPassword}
                      onChange={handleChange("confirmPassword")}
                      required
                      className="h-10"
                    />
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
                    "Buat Akun Gratis"
                  )}
                </Button>

                <p className="text-xs text-center text-[#64748b]">
                  Dengan mendaftar, Anda menyetujui{" "}
                  <button type="button" className="text-[#064e3b] hover:underline">
                    Syarat & Ketentuan
                  </button>{" "}
                  dan{" "}
                  <button type="button" className="text-[#064e3b] hover:underline">
                    Kebijakan Privasi
                  </button>
                  .
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Linkedin, ExternalLink, Award, Search, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface AlumniProfile {
  id: number;
  user_id: number;
  display_name: string;
  headline: string | null;
  avatar_url: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  skills: string[];
  capstone_title: string | null;
  capstone_url: string | null;
  cert_code: string | null;
  is_visible: boolean;
  created_at: string;
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["#064e3b", "#065f46", "#047857", "#0f766e", "#0e7490"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

export default function AlumniPage() {
  const router = useRouter();
  const [myProfile, setMyProfile] = useState<AlumniProfile | null>(null);
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const user = JSON.parse(stored);
    const currentUserId = user.id;
    const token = localStorage.getItem("token");

    Promise.all([
      fetch(`${API_BASE}/api/v1/alumni`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).then((r) => r.json()),
      fetch(`${API_BASE}/api/v1/alumni/${currentUserId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([all, mine]) => {
        setAlumni(Array.isArray(all) ? all : []);
        setMyProfile(mine);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleVisibility = async () => {
    const targetUserId = myProfile?.user_id;
    if (!targetUserId) return;
    setTogglingVisibility(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/v1/alumni/${targetUserId}/visibility`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      setMyProfile((prev) => prev ? { ...prev, is_visible: data.is_visible } : prev);
    } catch {}
    setTogglingVisibility(false);
  };

  const filtered = alumni.filter((a) =>
    !search ||
    a.display_name.toLowerCase().includes(search.toLowerCase()) ||
    (a.headline ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (a.skills ?? []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#1f2937] mb-3">Jaringan Alumni VOKASI</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Bergabunglah dengan para lulusan beta yang telah menyelesaikan kursus dan capstone project mereka.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Alumni", value: alumni.length },
            { label: "Capstone Selesai", value: alumni.filter((a) => a.capstone_title).length },
            { label: "Bersertifikat", value: alumni.filter((a) => a.cert_code).length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
              <div className="text-3xl font-black text-emerald-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* My profile visibility toggle */}
        {myProfile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {myProfile.avatar_url ? (
                <img src={myProfile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {myProfile.display_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#1f2937] text-sm">Profilmu</p>
                <p className="text-xs text-gray-500">{myProfile.is_visible ? "Terlihat di jaringan alumni" : "Profil disembunyikan"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="text-xs text-emerald-600 hover:underline border border-emerald-200 px-3 py-1.5 rounded-lg"
              >
                Edit Profil
              </Link>
              <button
                onClick={toggleVisibility}
                disabled={togglingVisibility}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  myProfile.is_visible
                    ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                    : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                }`}
              >
                {togglingVisibility ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : myProfile.is_visible ? (
                  <><EyeOff size={12} /> Sembunyikan</>
                ) : (
                  <><Eye size={12} /> Tampilkan</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Cari nama, jabatan, atau skill…"
          />
        </div>

        {/* Alumni grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {search ? "Tidak ada alumni yang cocok." : "Belum ada alumni yang bergabung."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  {a.avatar_url ? (
                    <img src={a.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <AvatarFallback name={a.display_name} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[#1f2937] truncate">{a.display_name}</h3>
                        {a.headline && <p className="text-xs text-gray-500 truncate mt-0.5">{a.headline}</p>}
                      </div>
                      {a.cert_code && (
                        <div className="flex-shrink-0">
                          <Link
                            href={`/certificates?code=${a.cert_code}`}
                            className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-emerald-100"
                            title="Lihat sertifikat"
                          >
                            <Award size={10} /> Bersertifikat
                          </Link>
                        </div>
                      )}
                    </div>

                    {a.bio && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{a.bio}</p>
                    )}

                    {a.capstone_title && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="text-gray-400">Capstone: </span>
                        {a.capstone_url ? (
                          <a href={a.capstone_url} target="_blank" rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline">
                            {a.capstone_title}
                          </a>
                        ) : a.capstone_title}
                      </div>
                    )}

                    {a.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {a.skills.slice(0, 5).map((s) => (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      {a.linkedin_url && (
                        <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Linkedin size={15} />
                        </a>
                      )}
                      {a.github_url && (
                        <a href={a.github_url} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-900 transition-colors">
                          <Github size={15} />
                        </a>
                      )}
                      {a.portfolio_url && (
                        <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-emerald-600 transition-colors">
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

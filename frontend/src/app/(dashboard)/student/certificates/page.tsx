"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";

interface CertData {
  id: string;
  title: string;
  student: string;
  course: string;
  instructor: string;
  institution: string;
  issuedAt: string;
  certificateId: string;
  competencyScore: number;
  grade: string;
  credentialUrl: string;
  expiresAt: string | null;
  skills: string[];
  course_title?: string;
  instructor_name?: string;
  institution_name?: string;
  issued_at?: string;
  certificate_id?: string;
  competency_score?: number;
  credential_url?: string;
}

const GRADE_COLORS: Record<string, string> = {
  "Meritorious": "text-amber-300 bg-amber-500/10 border-amber-500/30",
  "Competent": "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  "Proficient": "text-blue-300 bg-blue-500/10 border-blue-500/30",
};

function normalizeCert(raw: CertData): CertData {
  return {
    id: raw.id,
    title: raw.title ?? `Certificate of Completion`,
    student: raw.student ?? "",
    course: raw.course ?? raw.course_title ?? "",
    instructor: raw.instructor ?? raw.instructor_name ?? "",
    institution: raw.institution ?? raw.institution_name ?? "",
    issuedAt: raw.issuedAt ?? raw.issued_at ?? "",
    certificateId: raw.certificateId ?? raw.certificate_id ?? "",
    competencyScore: raw.competencyScore ?? raw.competency_score ?? 0,
    grade: raw.grade ?? (raw.competency_score ?? raw.competencyScore ?? 0) >= 75 ? "Meritorious" : (raw.competency_score ?? raw.competencyScore ?? 0) >= 65 ? "Competent" : "Proficient",
    credentialUrl: raw.credentialUrl ?? raw.credential_url ?? "",
    expiresAt: raw.expiresAt ?? null,
    skills: raw.skills ?? [],
  };
}

function CertificateCard({ cert, onShare }: { cert: CertData; onShare: () => void }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
      {/* Certificate Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl text-amber-400">🜂</div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">VOKASI2 Certificate</div>
            <div className="text-white font-semibold">{cert.course}</div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${GRADE_COLORS[cert.grade] ?? "text-slate-300 bg-slate-700 border-slate-600"}`}>
          {cert.grade}
        </div>
      </div>

      {/* Certificate Body */}
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-1">Awarded to</div>
            <div className="text-white font-semibold text-lg">{cert.student}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">Issued</div>
            <div className="text-slate-300 text-sm">{cert.issuedAt}</div>
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-2">Credential ID</div>
          <div className="font-mono text-emerald-400 text-sm">{cert.certificateId}</div>
          <div className="text-xs text-slate-500 mt-2">{cert.credentialUrl}</div>
        </div>

        {/* Skills */}
        {cert.skills.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 mb-2">Verified Competencies</div>
            <div className="flex flex-wrap gap-2">
              {cert.skills.map(skill => (
                <span key={skill} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button className="flex-1 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium rounded-lg transition-colors border border-emerald-500/30">
            Download PDF
          </button>
          <button onClick={onShare} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
            Share
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
            Verify ↗
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const token = useAuthStore((s) => s.token);
  const [certs, setCerts] = useState<CertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch("/api/certificates", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setCerts(Array.isArray(data) ? data.map(normalizeCert) : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load certificates:", err);
        setError("Failed to load certificates. Please try again.");
        setCerts([]);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Certificates</h1>
          <p className="text-slate-400 text-sm mt-1">Blockchain-verified competency certificates</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">⚠</div>
          <h3 className="text-red-300 font-semibold mb-2">Something went wrong</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetch("/api/certificates", {
                headers: { Authorization: `Bearer ${token}` },
              })
                .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
                .then((data) => { setCerts(Array.isArray(data) ? data.map(normalizeCert) : []); setLoading(false); })
                .catch((err) => { console.error("Retry failed:", err); setError("Failed to load certificates. Please try again."); setLoading(false); });
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const avgScore = certs.length > 0 ? Math.round(certs.reduce((a, c) => a + c.competencyScore, 0) / certs.length) : 0;
  const totalSkills = [...new Set(certs.flatMap(c => c.skills))].length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Certificates</h1>
        <p className="text-slate-400 text-sm mt-1">Blockchain-verified competency certificates</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Certificates", value: certs.length, icon: "🜂" },
          { label: "Avg Competency Score", value: avgScore, icon: "◈" },
          { label: "Verified Competencies", value: totalSkills, icon: "◎" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="text-slate-400 text-xs">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certs.map(cert => (
          <CertificateCard key={cert.id} cert={cert} onShare={() => setShareTarget(cert.certificateId)} />
        ))}
      </div>

      {certs.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🜂</div>
          <h3 className="text-white font-semibold mb-2">No certificates yet</h3>
          <p className="text-slate-400 text-sm">Complete a course to earn your first certificate</p>
        </div>
      )}

      {/* Share Modal */}
      {shareTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShareTarget(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Share Certificate</h3>
            <div className="space-y-3">
              {["LinkedIn", "Twitter/X", "Copy Link"].map(platform => (
                <button key={platform}
                  className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg transition-colors text-left flex items-center gap-3">
                  <span>{platform === "LinkedIn" ? "💼" : platform === "Twitter/X" ? "𝕏" : "🔗"}</span>
                  {platform}
                </button>
              ))}
            </div>
            <button onClick={() => setShareTarget(null)} className="w-full mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
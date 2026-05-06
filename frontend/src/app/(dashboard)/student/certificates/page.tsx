"use client";

import { useState } from "react";

const MOCK_CERTS = [
  {
    id: "cert-1", title: "AI Automation — Certificate of Completion",
    student: "Andi Wijaya", course: "AI Automation with CrewAI",
    instructor: "Sarah Putri", institution: "Universitas Brawijaya",
    issuedAt: "2024-11-15", certificateId: "VOKASI2-AI-2024-0892",
    competencyScore: 77.1, grade: "Meritorious",
    credentialUrl: "https://vokasi2.ai/verify/vokasi2-ai-2024-0892",
    expiresAt: null, skills: ["Prompt Engineering", "AI Automation", "CrewAI", "Agentic Pipelines"],
  },
  {
    id: "cert-2", title: "ML Model Evaluation — Certificate of Completion",
    student: "Andi Wijaya", course: "ML Model Evaluation & Benchmarking",
    instructor: "Ahmad Fauzi", institution: "Institut Teknologi Sepuluh Nopember",
    issuedAt: "2024-10-28", certificateId: "VOKASI2-ML-2024-0741",
    competencyScore: 68.5, grade: "Competent",
    credentialUrl: "https://vokasi2.ai/verify/vokasi2-ml-2024-0741",
    expiresAt: null, skills: ["Model Evaluation", "Benchmarking", "Statistical Analysis", "ML Metrics"],
  },
];

const GRADE_COLORS = {
  "Meritorious": "text-amber-300 bg-amber-500/10 border-amber-500/30",
  "Competent": "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  "Proficient": "text-blue-300 bg-blue-500/10 border-blue-500/30",
};

function CertificateCard({ cert, onShare }: { cert: typeof MOCK_CERTS[0]; onShare: () => void }) {
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
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${GRADE_COLORS[cert.grade as keyof typeof GRADE_COLORS]}`}>
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
  const [shareTarget, setShareTarget] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Certificates</h1>
        <p className="text-slate-400 text-sm mt-1">Blockchain-verified competency certificates</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Certificates", value: MOCK_CERTS.length, icon: "🜂" },
          { label: "Avg Competency Score", value: Math.round(MOCK_CERTS.reduce((a, c) => a + c.competencyScore, 0) / MOCK_CERTS.length), icon: "◈" },
          { label: "Verified Competencies", value: [...new Set(MOCK_CERTS.flatMap(c => c.skills))].length, icon: "◎" },
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
        {MOCK_CERTS.map(cert => (
          <CertificateCard key={cert.id} cert={cert} onShare={() => setShareTarget(cert.certificateId)} />
        ))}
      </div>

      {MOCK_CERTS.length === 0 && (
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

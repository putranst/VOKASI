"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";

interface MentorData {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  bio: string;
  rating: number;
  students: number;
  availability: string;
  similarity: number;
  avatar?: string;
  waitTime?: string;
}

const AVAIL_COLORS: Record<string, string> = { high: "bg-emerald-900/50 text-emerald-300", medium: "bg-amber-900/50 text-amber-300", low: "bg-red-900/50 text-red-300" };
const AVATAR_COLORS = ["bg-blue-500/20 text-blue-400", "bg-purple-500/20 text-purple-400", "bg-emerald-500/20 text-emerald-400", "bg-amber-500/20 text-amber-400"];

function MentorCard({ mentor, onRequest }: { mentor: MentorData; onRequest: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const colorIdx = parseInt(mentor.id.replace(/\D/g, "") || "0") % 4;
  const initials = mentor.avatar ?? mentor.name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${AVATAR_COLORS[colorIdx]}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white">{mentor.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs ${AVAIL_COLORS[mentor.availability] ?? "bg-slate-700 text-slate-400"}`}>
                {mentor.availability === "high" ? "◎ Available" : mentor.availability === "medium" ? "◐ Limited" : "◌ Busy"}
              </span>
            </div>
            <div className="text-slate-400 text-xs mt-0.5">{mentor.role} · {mentor.students} students mentored · ⭐ {mentor.rating}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-500">Match</div>
            <div className="text-emerald-400 font-bold">{Math.round(mentor.similarity * 100)}%</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {mentor.expertise.map(e => (
            <span key={e} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">{e}</span>
          ))}
        </div>

        <p className="text-slate-400 text-sm mt-3 line-clamp-2">{mentor.bio}</p>

        {expanded && mentor.waitTime && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-500">Expected response time: <span className="text-slate-300">{mentor.waitTime}</span></div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={() => setExpanded(!expanded)}
            className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
            {expanded ? "Less" : "Details"}
          </button>
          <button onClick={onRequest}
            className="flex-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium rounded-lg transition-colors border border-emerald-500/30">
            Request Mentor
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MentorsPage() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState<MentorData | null>(null);
  const [message, setMessage] = useState("");
  const [goals, setGoals] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fetchMentors = () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const params = userId ? `?student_id=${userId}` : "";
    fetch(`/api/mentors/match${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((data) => {
        setMentors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load mentors:", err);
        setError(err.message || "Failed to load mentors");
        setMentors([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMentors();
  }, [token, userId]);

  const handleRequest = () => {
    setSubmitted(true);
    setTimeout(() => { setShowRequest(null); setSubmitted(false); setMessage(""); setGoals(""); }, 2000);
  };

  const filteredMentors = selected
    ? mentors.filter(m => m.expertise.some(e => e === selected) || m.availability === (selected === "Available Now" ? "high" : m.availability))
    : mentors;

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
          <h1 className="text-2xl font-bold text-white">Find a Mentor</h1>
          <p className="text-slate-400 text-sm mt-1">pgvector-powered matching — mentors who complement your competency gaps</p>
        </div>
        <div className="bg-slate-900 border border-red-500/30 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-white font-semibold mb-2">Failed to load mentors</h3>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={fetchMentors}
            className="mt-4 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium rounded-lg transition-colors border border-emerald-500/30">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Find a Mentor</h1>
        <p className="text-slate-400 text-sm mt-1">pgvector-powered matching — mentors who complement your competency gaps</p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { step: "1", title: "AI Match", desc: "We analyze your competency vector and find mentors whose strengths fill your gaps" },
          { step: "2", title: "Request", desc: "Send a personalized request explaining your learning goals" },
          { step: "3", title: "Grow Together", desc: "Get 1-on-1 guidance from an expert matched to your needs" },
        ].map(s => (
          <div key={s.step} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">{s.step}</div>
            <div>
              <h3 className="font-medium text-white text-sm">{s.title}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["All", "Available Now", "Prompt Engineering", "Model Evaluation", "AI Ethics"].map(f => (
          <button key={f} onClick={() => setSelected(f === "All" ? null : f)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${!selected && f === "All" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Mentor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMentors.map(mentor => (
          <MentorCard key={mentor.id} mentor={mentor} onRequest={() => setShowRequest(mentor)} />
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🧑‍🏫</div>
          <h3 className="text-white font-semibold mb-2">No mentors found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your filters or check back later</p>
        </div>
      )}

      {/* Request Modal */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowRequest(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-1">Request Mentorship</h2>
            <p className="text-slate-400 text-sm mb-5">with {showRequest.name}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Why do you want {showRequest.name} as your mentor?</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                  placeholder="I want to improve my Prompt Engineering skills for job interviews..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">What are your goals for the next 4 weeks?</label>
                <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={2}
                  placeholder="Master few-shot prompting and understand evaluation metrics..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              <button onClick={handleRequest}
                disabled={submitted}
                className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">
                {submitted ? "✓ Request Sent!" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
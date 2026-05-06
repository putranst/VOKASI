"use client";
import { useState } from "react";

const MOCK_ASSIGNED = [
  { id:"p1", submissionTitle:"Optimize a prompt for e-commerce chatbot — final submission", authorName:"Andi Wijaya", courseTitle:"AI Fundamentals Batch 3", deadlineAt:"2024-12-01", status:"pending" },
  { id:"p2", submissionTitle:"Red-team analysis: Medical advice bot vulnerabilities", authorName:"Dewi Lestari", courseTitle:"AI Fundamentals Batch 3", deadlineAt:"2024-12-03", status:"pending" },
];

const MOCK_GIVEN = [
  { id:"g1", submissionTitle:"CV-screening model bias audit", authorName:"Dewi Lestari", scores:{ relevance:4, reasoning_depth:5, clarity:4, originality:4 }, narrative:"Excellent analysis of the bias sources. The 8-point mitigation framework is particularly well thought out. Minor note: consider adding a legal compliance section for Indonesian employment law.", helpfulRating:5, createdAt:"2024-11-18" },
  { id:"g2", submissionTitle:"Sentiment analysis model comparison", authorName:"Ahmad Fauzi", scores:{ relevance:5, reasoning_depth:4, clarity:5, originality:4 }, narrative:"Thorough comparison with good visualization of results. The sarcasm detection section in Indonesian slang could be expanded. Overall a strong evaluation.", helpfulRating:4, createdAt:"2024-11-15" },
];

export default function PeerReviewsPage() {
  const [tab, setTab] = useState<"assigned" | "given">("assigned");
  const [reviewing, setReviewing] = useState<typeof MOCK_ASSIGNED[0] | null>(null);
  const [scores, setScores] = useState({ relevance:3, reasoning_depth:3, clarity:3, originality:3 });
  const [narrative, setNarrative] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => { setReviewing(null); setSubmitted(false); setNarrative(""); setScores({ relevance:3, reasoning_depth:3, clarity:3, originality:3 }); }, 2000);
  };

  const ScoreBar = ({ label, value, onChange }: { label:string; value:number; onChange: (v:number) => void }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="text-emerald-400 font-medium">{value}/5</span></div>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(v => (
          <button key={v} onClick={() => onChange(v)}
            className={`flex-1 h-8 rounded-md text-sm font-medium transition-colors ${v <= value ? "bg-emerald-500/30 text-emerald-300" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Peer Reviews</h1>
        <p className="text-slate-400 text-sm mt-1">Anonymous cross-evaluation — earn the Peer Mentor badge at 10 reviews</p>
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        <button onClick={() => setTab("assigned")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab==="assigned"?"border-emerald-500 text-emerald-400":"border-transparent text-slate-400 hover:text-slate-200"}`}>
          Assigned to Review ({MOCK_ASSIGNED.length})
        </button>
        <button onClick={() => setTab("given")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab==="given"?"border-emerald-500 text-emerald-400":"border-transparent text-slate-400 hover:text-slate-200"}`}>
          My Reviews ({MOCK_GIVEN.length})
        </button>
      </div>

      {tab === "assigned" && (
        <div className="space-y-4">
          {MOCK_ASSIGNED.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all">
              <div className="px-5 py-4 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white text-sm">{a.submissionTitle}</div>
                  <div className="text-slate-500 text-xs mt-0.5">by {a.authorName} · {a.courseTitle}</div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${a.status==="pending"?"bg-amber-900/50 text-amber-300":"bg-slate-700 text-slate-400"}`}>Due {a.deadlineAt}</div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-slate-400 text-sm mb-4">Review this submission using the 4-dimension rubric. Provide constructive, specific feedback to help your peer improve.</p>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Submission Content Preview</div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">"Based on my analysis of the CV-screening model, I identified three primary sources of bias: training data imbalance (78% male in training set), feature selection favoring男性-dominated industries, and label noise in the ground truth data..."</p>
                </div>
                <button onClick={() => setReviewing(a)}
                  className="w-full px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium rounded-lg transition-colors border border-emerald-500/30">
                  Write Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "given" && (
        <div className="space-y-4">
          {MOCK_GIVEN.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/20 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="font-medium text-white text-sm">Review of: {r.submissionTitle}</div>
                  <div className="text-slate-500 text-xs mt-0.5">To: {r.authorName} · {r.createdAt}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-amber-400 font-bold text-sm">{r.helpfulRating}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {Object.entries(r.scores).map(([k,v]) => (
                  <div key={k} className="text-center">
                    <div className="text-lg font-bold text-emerald-400">{v}</div>
                    <div className="text-xs text-slate-500 capitalize">{k.replace("_"," ")}</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed italic">"{r.narrative}"</p>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setReviewing(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Write Peer Review</h2>
              <p className="text-slate-400 text-sm mt-1">{reviewing.submissionTitle}</p>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="text-sm font-medium text-white mb-3">Evaluation Rubric</div>
                <div className="space-y-4">
                  {(["relevance","reasoning_depth","clarity","originality"] as const).map(key => (
                    <ScoreBar key={key} label={key.replace("_"," ")} value={scores[key]} onChange={v => setScores({...scores, [key]: v})} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Narrative Feedback</label>
                <textarea value={narrative} onChange={e => setNarrative(e.target.value)} rows={5}
                  placeholder="Provide specific, constructive feedback. Highlight strengths, address weaknesses, and suggest concrete improvements..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              <div className="grid grid-cols-5 gap-1">
                <span className="col-span-1 text-xs text-slate-500 pt-2">Helpful?</span>
                {[1,2,3,4,5].map(v => (
                  <button key={v} className="h-9 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-400">★</button>
                ))}
              </div>
              <button onClick={handleSubmit} disabled={submitted || !narrative.trim()}
                className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">
                {submitted ? "✓ Review Submitted!" : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

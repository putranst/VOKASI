"use client";
import { useState, useEffect } from "react";

const EVENTS = [
  { value: "submission.created", label: "Submission Created" },
  { value: "submission.evaluated", label: "Submission Evaluated" },
  { value: "submission.revision_requested", label: "Revision Requested" },
  { value: "enrollment.created", label: "Enrollment Created" },
  { value: "enrollment.completed", label: "Enrollment Completed" },
  { value: "certificate.minted", label: "Certificate Minted" },
  { value: "badge.awarded", label: "Badge Awarded" },
  { value: "mentor_request.created", label: "Mentor Request Created" },
  { value: "mentor_request.accepted", label: "Mentor Request Accepted" },
  { value: "course.published", label: "Course Published" },
  { value: "user.created", label: "New User Registered" },
];

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  failure_count: number;
  last_success_at: string | null;
  last_failure_at: string | null;
  created_at: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/webhooks")
      .then(res => res.json())
      .then(data => {
        setWebhooks(data.webhooks || data || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load webhooks");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-slate-400 p-8">Loading webhooks...</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-slate-400 text-sm mt-1">{webhooks.length} webhook endpoints configured</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + New Webhook
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Create New Webhook</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Name</label>
              <input type="text" placeholder="e.g., Slack Notifications"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">URL</label>
              <input type="text" placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Events</label>
              <div className="grid grid-cols-2 gap-2">
                {EVENTS.map(ev => (
                  <label key={ev.value} className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" value={ev.value} className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500" />
                    {ev.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Create Webhook
              </button>
              <button onClick={() => setShowCreate(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            {["Name","URL","Events","Status","Failures","Last Success","",""].map(h => (
              <th key={h} className={`text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase ${h===""?"text-right":""}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {webhooks.map(wh => (
              <tr key={wh.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4 font-medium text-white">{wh.name}</td>
                <td className="px-5 py-4 text-slate-400 truncate max-w-xs">{wh.url}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {wh.events.slice(0, 2).map(ev => (
                      <span key={ev} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs">{ev}</span>
                    ))}
                    {wh.events.length > 2 && <span className="text-slate-500 text-xs">+{wh.events.length - 2}</span>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${wh.is_active ? "bg-emerald-900 text-emerald-300" : "bg-slate-700 text-slate-300"}`}>
                    {wh.is_active ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-300">{wh.failure_count}</td>
                <td className="px-5 py-4 text-slate-400">{wh.last_success_at ? new Date(wh.last_success_at).toLocaleDateString() : "Never"}</td>
                <td className="px-5 py-4 text-right">
                  <button className="text-emerald-400 hover:text-emerald-300 text-xs mr-3">Edit</button>
                  <button className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

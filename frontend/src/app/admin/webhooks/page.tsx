"use client";
import { useState } from "react";

const EVENTS = [
  { value:"submission.created", label:"Submission Created" },
  { value:"submission.evaluated", label:"Submission Evaluated" },
  { value:"submission.revision_requested", label:"Revision Requested" },
  { value:"enrollment.created", label:"Enrollment Created" },
  { value:"enrollment.completed", label:"Enrollment Completed" },
  { value:"certificate.minted", label:"Certificate Minted" },
  { value:"badge.awarded", label:"Badge Awarded" },
  { value:"mentor_request.created", label:"Mentor Request Created" },
  { value:"mentor_request.accepted", label:"Mentor Request Accepted" },
  { value:"course.published", label:"Course Published" },
  { value:"user.created", label:"New User Registered" },
];

const MOCK = [
  { id:"w1", name:"Hermes Agent Hook", url:"https://api.example.com/webhooks/vokasi", events:["submission.evaluated","badge.awarded","certificate.minted"], is_active:true, failure_count:0, last_success_at:"2024-11-22T14:30:00Z", created_at:"2024-11-01" },
  { id:"w2", name:"Slack Notifications", url:"https://hooks.slack.com/services/T00/B00/XXXX", events:["user.created","course.published"], is_active:true, failure_count:2, last_success_at:"2024-11-21T09:15:00Z", created_at:"2024-11-10" },
  { id:"w3", name:"Zapier Integration", url:"https://hooks.zapier.com/hooks/catch/00000/AAA", events:["enrollment.created","enrollment.completed"], is_active:false, failure_count:5, last_failure_at:"2024-11-20T16:00:00Z", created_at:"2024-10-15" },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState(MOCK);
  const [showCreate, setShowCreate] = useState(false);
  const [newWh, setNewWh] = useState({ name:"", url:"", events:[] as string[] });
  const [copied, setCopied] = useState<string | null>(null);

  const toggleActive = (id: string) =>
    setWebhooks(w => w.map(wh => wh.id === id ? { ...wh, is_active: !wh.is_active } : wh));

  const deleteWh = (id: string) =>
    setWebhooks(w => w.filter(wh => wh.id !== id));

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopied(secret);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhook Subscriptions</h1>
          <p className="text-slate-400 text-sm mt-1">Event-driven integrations with external systems</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg">
          + New Webhook
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800 bg-slate-800/30">
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">Name</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">URL</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">Events</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">Status</th>
            <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {webhooks.map(wh => (
              <tr key={wh.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{wh.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5">Created {wh.created_at}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-slate-300 text-xs font-mono max-w-xs truncate">{wh.url}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {wh.events.map(e => (
                      <span key={e} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-xs">{e}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${wh.is_active ? "bg-emerald-400" : "bg-slate-600"}`} />
                    <span className={`text-xs font-medium ${wh.is_active ? "text-emerald-400" : "text-slate-500"}`}>
                      {wh.is_active ? "Active" : "Disabled"}
                    </span>
                    {wh.failure_count > 0 && (
                      <span className="text-xs text-red-400">{wh.failure_count} fails</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {wh.last_success_at ? `Last: ${wh.last_success_at}` : "Never succeeded"}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => toggleActive(wh.id)}
                      className={`px-3 py-1 text-xs rounded-md ${wh.is_active ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300"}`}>
                      {wh.is_active ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => deleteWh(wh.id)}
                      className="px-3 py-1 text-xs bg-red-900/50 hover:bg-red-900 text-red-300 rounded-md">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature Verification Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-2">Signature Verification</h3>
        <p className="text-slate-400 text-sm mb-3">All webhook payloads are signed with HMAC-SHA256. Verify the signature:</p>
        <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300">
          <div>const crypto = require('crypto');</div>
          <div className="text-slate-500 mt-2">{"const sig = crypto"}</div>
          <div className="pll-4 text-slate-500">.createHmac('sha256', WEBHOOK_SECRET)</div>
          <div className="pll-4 text-slate-500">.update(request_body)</div>
          <div className="pll-4 text-slate-500">.digest('hex');</div>
          <div className="mt-2 text-emerald-400">{"if (sig === req.headers['x-vokasi-signature']) {"}</div>
          <div className="pll-4 text-emerald-400">// Valid</div>
          <div className="text-emerald-400">{"}"}</div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowCreate(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">New Webhook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Name</label>
                <input type="text" value={newWh.name} onChange={e => setNewWh({...newWh, name: e.target.value})}
                  placeholder="Hermes Agent Hook"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Endpoint URL</label>
                <input type="url" value={newWh.url} onChange={e => setNewWh({...newWh, url: e.target.value})}
                  placeholder="https://api.example.com/webhooks"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Events</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {EVENTS.map(ev => (
                    <label key={ev.value} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={newWh.events.includes(ev.value)}
                        onChange={e => setNewWh({
                          ...newWh,
                          events: e.target.checked ? [...newWh.events, ev.value] : newWh.events.filter(x => x !== ev.value)
                        })}
                        className="rounded border-slate-600 bg-slate-800 text-emerald-500" />
                      {ev.label}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowCreate(false)}
                className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg">
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

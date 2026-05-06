"use client";
export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Platform Analytics</h1><p className="text-slate-400 text-sm mt-1">Cohort comparison and instructor performance</p></div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
        Analytics dashboard — connect to /api/admin/analytics/overview for live data
      </div>
    </div>
  );
}

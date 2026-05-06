"use client";
import { useState } from "react";
export default function AdminSettingsPage() {
  const [tab, setTab] = useState("platform");
  const [saved, setSaved] = useState(false);
  const tabs = ["platform","ai models","notifications","security","billing"];
  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold text-white">Settings</h1><p className="text-slate-400 text-sm mt-1">Platform-wide configuration</p></div>
      <div className="flex gap-6">
        <div className="w-40 shrink-0 space-y-1">
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${tab===t?"bg-emerald-500/10 text-emerald-400":"text-slate-400 hover:text-slate-200"}`}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white capitalize">{tab} Settings</h2>
          {[1,2,3].map(i=>(
            <div key={i} className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Setting {i}</label>
              <input defaultValue="value" className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
          ))}
          <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
            {saved?"✓ Saved!":"Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

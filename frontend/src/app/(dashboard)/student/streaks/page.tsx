"use client";
import { useState } from "react";

const CALENDAR_DAYS = Array.from({ length: 35 }, (_, i) => {
  const day = i - 3;
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), day);
  const isToday = date.toDateString() === today.toDateString();
  const inPast = date < today && date.toDateString() !== today.toDateString();
  const hasEntry = inPast && Math.random() > 0.35;
  return { date, hasEntry, isToday, inPast };
});

function CalendarGrid() {
  const DAYS = ["S","M","T","W","T","F","S"];
  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      {DAYS.map((d, i) => (
        <div key={i} className="text-slate-600 text-xs py-1 font-medium">{d}</div>
      ))}
      {CALENDAR_DAYS.map((day, i) => {
        const dayNum = day.date.getDate();
        if (dayNum < 1 || dayNum > 31) return <div key={i} />;
        return (
          <div key={i}
            className={`aspect-square flex items-center justify-center rounded-md text-xs ${
              day.hasEntry ? "bg-emerald-500/30 text-emerald-300" :
              day.isToday ? "bg-slate-700 text-white border border-emerald-500/50" :
              day.inPast ? "bg-slate-800/50 text-slate-600" : "text-slate-500"
            }`}>
            {dayNum}
          </div>
        );
      })}
    </div>
  );
}

export default function StreaksPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Daily Streaks</h1>
        <p className="text-slate-400 text-sm mt-1">Max 1 reflection per day — consistency beats depth</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-5 text-center">
          <div className="text-4xl font-bold text-emerald-400">7</div>
          <div className="text-slate-400 text-sm mt-1">Day Streak</div>
          <div className="text-emerald-400 text-xs mt-2">🔥 Keep it going!</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-5 text-center">
          <div className="text-4xl font-bold text-amber-400">14</div>
          <div className="text-slate-400 text-sm mt-1">Longest Streak</div>
          <div className="text-amber-400 text-xs mt-2">🏆 Personal best!</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">November 2024</h2>
        <CalendarGrid />
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/30"></span> Entry</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-700 border border-emerald-500/50"></span> Today</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-800/50"></span> Missed</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-white">Streak Tips</h2>
        {[
          "Write at the same time each day — morning works best",
          "Even 2 sentences count — consistency beats depth",
          "Missed a day? Don't break the chain. Write today.",
          "Use the Reflection Journal on your phone during commute",
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-slate-400">
            <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}

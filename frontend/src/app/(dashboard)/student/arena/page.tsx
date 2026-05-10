"use client";

import { useState } from "react";

export default function StudentArenaPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const challenges = [
    { id: 1, title: "AI Prompt Analysis", category: "prompt-engineering", difficulty: "Medium", points: 100, completions: 45 },
    { id: 2, title: "Ethics Case Study", category: "data-ethics", difficulty: "Hard", points: 150, completions: 23 },
    { id: 3, title: "Tool Comparison Challenge", category: "tool-fluency", difficulty: "Easy", points: 50, completions: 89 },
    { id: 4, title: "Critical Thinking Puzzle", category: "critical-thinking", difficulty: "Medium", points: 100, completions: 34 },
  ];

  const filtered = selectedCategory === "all" ? challenges : challenges.filter(c => c.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Challenge Arena</h2>
        <div className="flex gap-2">
          {["all", "prompt-engineering", "data-ethics", "tool-fluency"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-sm ${selectedCategory === cat ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {cat.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map(challenge => (
          <div key={challenge.id} className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-emerald-500/50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{challenge.completions} students completed</p>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-bold">{challenge.points} pts</div>
                <div className={`text-xs px-2 py-1 rounded ${challenge.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' : challenge.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                  {challenge.difficulty}
                </div>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
              Start Challenge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function CreateCoursePage() {
  const [formData, setFormData] = useState({ title: "", description: "", category: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Course created! (Demo)");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Create New Course</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Course Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            placeholder="e.g., Intro to AI Prompting"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white h-32"
            placeholder="Describe what students will learn..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="">Select category</option>
            <option value="ai-fundamentals">AI Fundamentals</option>
            <option value="prompt-engineering">Prompt Engineering</option>
            <option value="data-ethics">Data Ethics</option>
            <option value="tool-fluency">Tool Fluency</option>
          </select>
        </div>

        <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
          Create Course
        </button>
      </form>
    </div>
  );
}

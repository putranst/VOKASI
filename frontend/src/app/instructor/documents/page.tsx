"use client";

export default function InstructorDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Documents</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          + Upload Document
        </button>
      </div>

      <div className="grid gap-4">
        {[
          { name: "AI_Prompting_Guide.pdf", type: "PDF", size: "2.4 MB", date: "May 8, 2026" },
          { name: "Ethics_Framework.docx", type: "DOCX", size: "1.1 MB", date: "May 5, 2026" },
          { name: "Tool_List.xlsx", type: "XLSX", size: "324 KB", date: "May 3, 2026" },
        ].map((doc, i) => (
          <div key={i} className="flex items-center justify-between bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">📄</span>
              <div>
                <div className="text-white font-medium">{doc.name}</div>
                <div className="text-sm text-slate-400">{doc.type} • {doc.size}</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">{doc.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Plus, MoreHorizontal, Lightbulb, CheckCircle, FileText, Settings, Share2, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function NaskaStudioPage() {
    const [editorContent, setEditorContent] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const [insight, setInsight] = useState<any>(null);
    const [mode, setMode] = useState<'IRIS' | 'MOOC'>('IRIS');
    const [uploading, setUploading] = useState(false);

    // Debounce Logic Gap Detection
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (isTyping && editorContent.length > 20) { // Min length check
                setIsTyping(false);
                setShowInsights(true);

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/naska/analyze`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            draft_text: editorContent,
                            user_id: '1'
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Assuming response format: { analysis: "JSON_STRING_OR_OBJECT" }
                        setInsight({
                            title: "Logic Analysis",
                            snippet: typeof data.analysis === 'string' ? data.analysis.slice(0, 200) : "Analysis complete.",
                            source: "Knowledge Container",
                            confidence: 90
                        });
                    }
                } catch (e) {
                    console.error("Analysis failed", e);
                }
            }
        }, 2000); // 2s debounce
        return () => clearTimeout(timeout);
    }, [editorContent, isTyping]);

    const handleType = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditorContent(e.target.value);
        setIsTyping(true);
        setShowInsights(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/naska/ingest?user_id=1`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert("Source Ingested Successfully");
            } else {
                alert("Ingestion Failed");
            }
        } catch (err) {
            console.error(err);
            alert("Upload Error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#f9f9f9] flex overflow-hidden font-sans text-gray-900">
            {/* Sidebar / Navigation */}
            <aside className="w-16 border-r border-gray-200 bg-white flex flex-col items-center py-6 gap-6 z-20">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft size={20} className="text-gray-500" />
                </Link>

                {/* Upload Trigger */}
                <div className="relative group">
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        accept=".pdf,.txt,.md"
                    />
                    <button className={`p-2 rounded-xl transition-colors ${uploading ? 'bg-purple-100 animate-pulse' : 'hover:bg-gray-100'}`}>
                        <Plus size={20} className={uploading ? "text-purple-600" : "text-gray-400"} />
                    </button>
                    <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                        Upload Source
                    </div>
                </div>

                <div className="flex-1"></div>
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-purple-100">
                    PT
                </div>
            </aside>

            {/* Main Studio Area (Split Pane) */}
            <main className="flex-1 flex max-w-[1920px] mx-auto w-full">

                {/* Visual Editor (Left Pane) */}
                <section className="flex-1 flex flex-col h-full bg-white relative">
                    {/* Editor Header */}
                    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setMode('IRIS')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'IRIS' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    IRIS Sprint
                                </button>
                                <button
                                    onClick={() => setMode('MOOC')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'MOOC' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    MOOC Wiki
                                </button>
                            </div>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <span className="font-bold text-gray-900">Agentic Workflow Application</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 mr-2 flex items-center gap-1">
                                {isTyping ? 'Analyzing...' : 'Saved'}
                            </span>
                            <button className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                                <Share2 size={14} /> Share
                            </button>
                        </div>
                    </header>

                    {/* Editor Canvas */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-16">
                        <textarea
                            className="w-full h-full resize-none outline-none text-xl leading-relaxed text-gray-800 placeholder:text-gray-300 font-medium bg-transparent"
                            placeholder={mode === 'IRIS' ? "Start your Iteration Phase draft..." : "Start your wiki entry..."}
                            value={editorContent}
                            onChange={handleType}
                            spellCheck={false}
                            autoFocus
                        />
                    </div>
                </section>

                {/* Naska Insight Rail (Right Pane) */}
                <aside className="w-[400px] border-l border-gray-100 bg-gray-50/50 flex flex-col h-full relative overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-white/50 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-600" />
                            <span className="font-bold text-sm text-gray-900">Naska Insights</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Live Insight Cards */}
                        <AnimatePresence>
                            {showInsights && insight && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-2xl p-5 border border-purple-100 shadow-[0_4px_20px_rgba(108,89,72,0.08)] relative overflow-hidden group hover:border-purple-200 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start gap-3 mb-2 relative z-10">
                                        <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                                            <Lightbulb size={16} />
                                        </div>
                                        <h4 className="font-bold text-sm text-gray-900 pt-0.5">{insight.title}</h4>
                                    </div>

                                    <p className="text-sm text-gray-600 leading-relaxed mb-3 relative z-10">
                                        "{insight.snippet}"
                                    </p>

                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                                        <FileText size={12} className="text-gray-400" />
                                        <span className="text-xs font-medium text-gray-500">{insight.source}</span>
                                        <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                            {insight.confidence}% Match
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!insight && (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                Start typing to see Logic Gaps...
                            </div>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
}

"use client";

import React, { useState, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Play, RotateCcw, Save, Terminal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CodeEditorProps {
    initialCode?: string;
    language?: string;
    theme?: 'vs-dark' | 'light';
    readOnly?: boolean;
    onRun?: (code: string) => Promise<void>;
    onSave?: (code: string) => void;
    output?: string;
    isRunning?: boolean;
    error?: string | null;
}

export default function CodeEditor({
    initialCode = '# Write your code here\nprint("Hello, VOKASI!")',
    language = 'python',
    theme = 'vs-dark',
    readOnly = false,
    onRun,
    onSave,
    output,
    isRunning = false,
    error = null
}: CodeEditorProps) {
    const editorRef = useRef<any>(null);
    const [code, setCode] = useState(initialCode);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleRun = () => {
        if (onRun && editorRef.current) {
            const currentCode = editorRef.current.getValue();
            onRun(currentCode);
        }
    };

    const handleSave = () => {
        if (onSave && editorRef.current) {
            const currentCode = editorRef.current.getValue();
            onSave(currentCode);
        }
    };

    const handleReset = () => {
        if (editorRef.current) {
            editorRef.current.setValue(initialCode);
            setCode(initialCode);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono ml-2">{language.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded-md transition-colors"
                        title="Reset Code"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button
                        onClick={handleSave}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded-md transition-colors"
                        title="Save Code"
                    >
                        <Save size={16} />
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isRunning
                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                            }`}
                    >
                        {isRunning ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play size={14} fill="currentColor" />
                                Run Code
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative min-h-[400px]">
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    defaultValue={initialCode}
                    theme={theme}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: readOnly,
                        padding: { top: 16, bottom: 16 },
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                    }}
                />
            </div>

            {/* Terminal/Output Area */}
            <div className="bg-[#1e1e1e] border-t border-[#333]">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-b border-[#333]">
                    <Terminal size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-300">TERMINAL</span>
                </div>
                <div className="p-4 font-mono text-sm min-h-[150px] max-h-[200px] overflow-y-auto">
                    {error ? (
                        <div className="flex items-start gap-2 text-red-400">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <pre className="whitespace-pre-wrap break-words font-mono">{error}</pre>
                        </div>
                    ) : output ? (
                        <div className="text-gray-300">
                            <pre className="whitespace-pre-wrap break-words font-mono">{output}</pre>
                            <div className="flex items-center gap-2 mt-2 text-green-500 text-xs">
                                <CheckCircle size={12} />
                                <span>Execution finished</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-600 italic">
                            Ready to execute. Click "Run Code" to see output.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

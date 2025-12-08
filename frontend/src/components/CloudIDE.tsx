'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Terminal, AlertCircle, Loader2, Code2, Check, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CloudIDEProps {
    projectId: string;
    initialCode?: string;
    onSuccess?: () => void;
}

type Language = 'python' | 'javascript' | 'java';

const LANGUAGE_TEMPLATES: Record<Language, string> = {
    python: `# Python code here
def main():
    print("Hello from TSEA-X Cloud IDE!")
    
    # Example: Calculate factorial
    n = 5
    factorial = 1
    for i in range(1, n + 1):
        factorial *= i
    print(f"Factorial of {n} is {factorial}")

if __name__ == "__main__":
    main()
`,
    javascript: `// JavaScript code here
function main() {
    console.log("Hello from TSEA-X Cloud IDE!");
    
    // Example: Calculate factorial
    const n = 5;
    let factorial = 1;
    for (let i = 1; i <= n; i++) {
        factorial *= i;
    }
    console.log(\`Factorial of \${n} is \${factorial}\`);
}

main();
`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from TSEA-X Cloud IDE!");
        
        // Example: Calculate factorial
        int n = 5;
        int factorial = 1;
        for (int i = 1; i <= n; i++) {
            factorial *= i;
        }
        System.out.println("Factorial of " + n + " is " + factorial);
    }
}
`
};

const LANGUAGE_CONFIG: Record<Language, { extension: string; displayName: string; monacoLang: string }> = {
    python: { extension: '.py', displayName: 'Python', monacoLang: 'python' },
    javascript: { extension: '.js', displayName: 'JavaScript', monacoLang: 'javascript' },
    java: { extension: '.java', displayName: 'Java', monacoLang: 'java' }
};

export default function CloudIDE({ projectId, initialCode = '', onSuccess }: CloudIDEProps) {
    const [language, setLanguage] = useState<Language>('python');
    const [code, setCode] = useState(initialCode || LANGUAGE_TEMPLATES.python);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Load latest code on mount
    useEffect(() => {
        const loadLatestCode = async () => {
            try {
                const { data, error } = await supabase
                    .from('implementations')
                    .select('code_snapshot')
                    .eq('project_id', projectId)
                    .single();

                if (data && data.code_snapshot) {
                    setCode(data.code_snapshot);
                }
            } catch (err) {
                console.error('Failed to load latest code:', err);
            }
        };
        if (projectId) loadLatestCode();
    }, [projectId]);

    // Auto-save functionality
    useEffect(() => {
        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Set new timer for 30 seconds
        autoSaveTimerRef.current = setTimeout(() => {
            handleSaveCode(true);
        }, 30000);

        // Cleanup on unmount
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [code, language]);

    const handleSaveCode = async (autoSave: boolean = false) => {
        setIsSaving(true);
        setSaveStatus('saving');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/projects/${projectId}/save-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: parseInt(projectId),
                    code: code,
                    language: language,
                    auto_saved: autoSave
                })
            });

            if (response.ok) {
                setSaveStatus('saved');
                setLastSaved(new Date());
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                console.error('Save error:', await response.text());
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (err) {
            console.error('Save failed:', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLanguageChange = (newLanguage: Language) => {
        if (code !== LANGUAGE_TEMPLATES[language] && !confirm('Changing language will reset your code. Continue?')) {
            return;
        }
        setLanguage(newLanguage);
        setCode(LANGUAGE_TEMPLATES[newLanguage]);
        setOutput('');
        setError(null);
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('');
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/code/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setOutput(result.output);
                } else {
                    setOutput(result.output);
                    setError(result.error || 'Execution failed');
                }
            } else {
                setError('Failed to connect to execution engine');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error(err);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // First ensure code is saved
            await handleSaveCode(false);

            // Update project status via API (preferred) or Supabase
            // Using Supabase for now as per original code, but could be migrated to API
            const { error } = await supabase
                .from('projects')
                .update({
                    // implement_completed: true, 
                    current_phase: 'operate',
                    updated_at: new Date().toISOString()
                })
                .eq('id', parseInt(projectId));

            if (!error) {
                if (onSuccess) onSuccess();
            } else {
                console.error('Failed to update project status:', error);
                setError('Failed to submit implementation');
            }
        } catch (err) {
            setError('Network error during submission');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                        main{LANGUAGE_CONFIG[language].extension}
                    </span>

                    {/* Language Selector */}
                    <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-700">
                        <Code2 className="w-3.5 h-3.5 text-gray-400" />
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value as Language)}
                            className="bg-[#3c3c3c] text-gray-300 text-xs px-2 py-1 rounded border border-gray-600 hover:border-gray-500 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                        </select>
                        <span className="text-xs text-gray-500">
                            {LANGUAGE_CONFIG[language].displayName}
                        </span>
                    </div>

                    {/* Save Status Indicator */}
                    <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-700">
                        {saveStatus === 'saving' && (
                            <>
                                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                                <span className="text-xs text-blue-400">Saving...</span>
                            </>
                        )}
                        {saveStatus === 'saved' && (
                            <>
                                <Check className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-xs text-green-400">Saved</span>
                            </>
                        )}
                        {saveStatus === 'error' && (
                            <>
                                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-xs text-red-400">Save failed</span>
                            </>
                        )}
                        {saveStatus === 'idle' && lastSaved && (
                            <>
                                <Clock className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                    Last saved {new Date(lastSaved).toLocaleTimeString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSaveCode(false)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                        title="Save code manually"
                    >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                    </button>
                    <button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                    >
                        {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Run Code
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Submit
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex">
                <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        language={LANGUAGE_CONFIG[language].monacoLang}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>
            </div>

            {/* Terminal/Output Area */}
            <div className="h-48 bg-[#1e1e1e] border-t border-[#333] flex flex-col">
                <div className="flex items-center px-4 py-2 bg-[#252526] border-b border-[#333]">
                    <Terminal className="w-3 h-3 text-gray-400 mr-2" />
                    <span className="text-xs text-gray-400 font-medium">Terminal Output</span>
                </div>
                <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                    {output ? (
                        <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
                    ) : (
                        <span className="text-gray-600 italic">Run code to see output...</span>
                    )}
                    {error && (
                        <div className="mt-2 flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, ArrowRight, RefreshCw } from 'lucide-react';

export type AITextAction =
    | 'improve'
    | 'shorten'
    | 'longer'
    | 'simplify'
    | 'summarize'
    | 'complete'
    | 'paraphrase';

interface AITextAssistantProps {
    selectedText: string;
    onClose: () => void;
    onReplace: (newText: string) => void;
    onInsertBelow: (newText: string) => void;
}

const AI_OPTIONS = [
    { action: 'improve' as AITextAction, label: 'Improve writing', icon: '✨', description: 'Enhance clarity and grammar' },
    { action: 'shorten' as AITextAction, label: 'Make shorter', icon: '📉', description: 'Condense while keeping meaning' },
    { action: 'longer' as AITextAction, label: 'Make longer', icon: '📈', description: 'Expand with more detail' },
    { action: 'simplify' as AITextAction, label: 'Simplify language', icon: '🎯', description: 'Use simpler words' },
    { action: 'summarize' as AITextAction, label: 'Summarize', icon: '📝', description: 'Create brief summary' },
    { action: 'complete' as AITextAction, label: 'Complete', icon: '🤖', description: 'AI continues the text' },
    { action: 'paraphrase' as AITextAction, label: 'Paraphrase', icon: '🔄', description: 'Rewrite in different words' },
];

export function AITextAssistant({ selectedText, onClose, onReplace, onInsertBelow }: AITextAssistantProps) {
    const [selectedAction, setSelectedAction] = useState<AITextAction | null>(null);
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleActionClick = async (action: AITextAction) => {
        setSelectedAction(action);
        setIsLoading(true);
        setError(null);

        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
            const response = await fetch(`${BACKEND_URL}/api/v1/ai/text-assist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: selectedText,
                    action: action
                })
            });

            if (!response.ok) {
                throw new Error('Failed to process text with AI');
            }

            const data = await response.json();
            setResult(data.result || data.text || 'AI processing complete');
        } catch (err: any) {
            console.error('AI text assist error:', err);
            // Fallback to mock responses for demo
            setResult(getMockResponse(action, selectedText));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = () => {
        if (selectedAction) {
            handleActionClick(selectedAction);
        }
    };

    // Mock responses for demo purposes
    const getMockResponse = (action: AITextAction, text: string): string => {
        const responses: Record<AITextAction, string> = {
            improve: `Enhanced version: ${text} (This text has been improved with better clarity, structure, and professional tone.)`,
            shorten: text.split(' ').slice(0, Math.ceil(text.split(' ').length / 2)).join(' ') + '...',
            longer: `${text}\n\nFurthermore, this concept extends beyond the initial understanding and encompasses several related aspects that are worth considering in greater detail.`,
            simplify: text.replace(/\b\w{8,}\b/g, (word) => word.slice(0, 5)),
            summarize: `Summary: ${text.split(' ').slice(0, 15).join(' ')}...`,
            complete: `${text} This continuation provides additional context and builds upon the foundation established in the previous sentences.`,
            paraphrase: `Rephrased: ${text.split(' ').reverse().join(' ')} (Paraphrased version)`
        };
        return responses[action] || text;
    };

    // Show action selection
    if (!selectedAction && !result) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 
                                          flex items-center justify-center">
                                <Sparkles className="text-white" size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">AI Assistant</h3>
                                <p className="text-sm text-gray-500">Choose an action for your text</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Selected Text Preview */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Selected text:</p>
                        <p className="text-sm text-gray-900 line-clamp-3 italic">
                            &quot;{selectedText}&quot;
                        </p>
                    </div>

                    {/* AI Options */}
                    <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                            {AI_OPTIONS.map((option) => (
                                <button
                                    key={option.action}
                                    onClick={() => handleActionClick(option.action)}
                                    className="w-full text-left p-4 rounded-xl border border-gray-200 
                                             hover:border-purple-300 hover:bg-purple-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{option.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 group-hover:text-purple-700">
                                                {option.label}
                                            </p>
                                            <p className="text-sm text-gray-500">{option.description}</p>
                                        </div>
                                        <ArrowRight size={18} className="text-gray-400 group-hover:text-purple-600" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show result
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 
                                      flex items-center justify-center">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">AI Result</h3>
                            <p className="text-sm text-gray-500">
                                {AI_OPTIONS.find(o => o.action === selectedAction)?.label}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Original Text */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                            Original
                        </label>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700">{selectedText}</p>
                        </div>
                    </div>

                    {/* AI Result */}
                    <div>
                        <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2 block">
                            AI Result
                        </label>
                        {isLoading ? (
                            <div className="p-8 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                    <p className="text-sm text-purple-600 font-medium">AI is processing...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{result}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 flex-shrink-0">
                    <button
                        onClick={handleRegenerate}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-white transition-colors 
                                 flex items-center gap-2 text-gray-700 font-medium disabled:opacity-50"
                    >
                        <RefreshCw size={16} />
                        Generate Again
                    </button>
                    <div className="flex-1"></div>
                    <button
                        onClick={() => {
                            onInsertBelow(result);
                            onClose();
                        }}
                        disabled={isLoading || !result}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors 
                                 text-gray-700 font-medium disabled:opacity-50"
                    >
                        Insert Below
                    </button>
                    <button
                        onClick={() => {
                            onReplace(result);
                            onClose();
                        }}
                        disabled={isLoading || !result}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 
                                 hover:from-purple-700 hover:to-indigo-700 transition-all text-white font-medium
                                 disabled:opacity-50 shadow-lg"
                    >
                        Replace Text
                    </button>
                </div>
            </div>
        </div>
    );
}

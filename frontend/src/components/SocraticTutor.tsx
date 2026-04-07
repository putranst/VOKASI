'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, Trash2 } from 'lucide-react';

// IRIS phase names
type Phase = 'immerse' | 'realize' | 'iterate' | 'scale';

interface SocraticTutorProps {
    projectId: string;
    phase: Phase;
    context?: any;
    className?: string;
}

interface Message {
    role: 'user' | 'ai';
    text: string;
}

// Storage key generator
const getStorageKey = (projectId: string) => `socratic_history_${projectId}`;

export default function SocraticTutor({ projectId, phase, context, className = '' }: SocraticTutorProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);



    // Load messages from localStorage on mount
    useEffect(() => {
        if (!projectId || initialized) return;

        const stored = localStorage.getItem(getStorageKey(projectId));
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                    setInitialized(true);
                    return;
                }
            } catch (e) {
                console.error('Failed to parse stored messages:', e);
            }
        }

        // IRIS-aware greetings
        const greetings: Record<string, string> = {
            immerse: "👋 I'm your Socratic Tutor. In the Immerse phase, let's explore the authentic problem context. What did you observe in the field?",
            realize: "👋 I'm your Socratic Tutor for Realize. Let's analyze your knowledge gaps. What do you already know (Q), and what do you need to learn (P)?",
            iterate: "👋 Ready for Build-Measure-Learn? I'll guide your hypothesis testing. What are you building in this iteration?",
            scale: "👋 Time to scale! Let's ensure institutional adoption succeeds. How will you hand off your solution?"
        };
        setMessages([{ role: 'ai', text: greetings[phase] || greetings.immerse }]);
        setInitialized(true);
    }, [projectId, phase, initialized]);


    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (projectId && messages.length > 0 && initialized) {
            localStorage.setItem(getStorageKey(projectId), JSON.stringify(messages));
        }
    }, [messages, projectId, initialized]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !projectId) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/ai/socratic-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: parseInt(projectId),
                    user_message: userMsg,
                    conversation_history: messages.map(m => ({ role: m.role, text: m.text })),
                    design_context: context || {},
                    phase: phase
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'ai', text: data.ai_response }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "I'm having a bit of trouble connecting. Can you try asking that in a different way?" }]);
            }
        } catch (error) {
            console.error('Socratic AI error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Please check your network." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = () => {
        if (window.confirm('Clear conversation history? This cannot be undone.')) {
            localStorage.removeItem(getStorageKey(projectId));
            const greetings: Record<string, string> = {
                immerse: "👋 I'm your Socratic Tutor. In the Immerse phase, let's explore the authentic problem context. What did you observe in the field?",
                realize: "👋 I'm your Socratic Tutor for Realize. Let's analyze your knowledge gaps. What do you already know (Q), and what do you need to learn (P)?",
                iterate: "👋 Ready for Build-Measure-Learn? I'll guide your hypothesis testing. What are you building in this iteration?",
                scale: "👋 Time to scale! Let's ensure institutional adoption succeeds. How will you hand off your solution?"
            };
            setMessages([{ role: 'ai', text: greetings[phase] || greetings.immerse }]);
        }
    };


    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col ${className}`}>
            <div className={`bg-gradient-to-r ${phase === 'scale' ? 'from-orange-600 to-red-600' : phase === 'realize' ? 'from-blue-600 to-purple-600' : 'from-green-600 to-teal-600'} p-4 text-white`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            AI Socratic Tutor
                        </h3>
                        <p className="text-xs opacity-90 mt-1">I'll guide you, not give answers</p>
                    </div>
                    {messages.length > 1 && (
                        <button
                            onClick={handleClearHistory}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Clear history"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-xl max-w-[90%] ${msg.role === 'ai'
                            ? 'bg-gray-50 border border-gray-100 mr-auto'
                            : 'bg-blue-50 text-blue-900 ml-auto'
                            }`}
                    >
                        <div className="flex gap-2">
                            {msg.role === 'ai' && <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />}
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-2 p-3 bg-gray-50 rounded-xl mr-auto">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 text-sm"
                        placeholder="Ask for guidance..."
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className={`px-4 py-2 rounded-xl font-semibold text-white transition-all ${loading || !input.trim() ? 'bg-gray-300' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Send, Minimize2, Maximize2, MessageSquare } from 'lucide-react';
import { useSocratic } from '@/contexts/SocraticContext';
import SocraticSidebar from '@/components/ui/SocraticSidebar';

interface Message {
    role: 'user' | 'ai';
    text: string;
    timestamp: number;
}

export function AICompanion() {
    const pathname = usePathname();
    const socratic = useSocratic();

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState(false);

    // Close AI Companion when Socratic opens
    useEffect(() => {
        if (socratic.isOpen && isOpen) {
            setIsOpen(false);
        }
    }, [socratic.isOpen]);

    // Initialize welcome message on client mount only to avoid hydration issues
    useEffect(() => {
        if (!initialized) {
            setMessages([
                { role: 'ai', text: 'Hi! I\'m your TSEA-X Companion. How can I help you with your learning journey today?', timestamp: Date.now() }
            ]);
            setInitialized(true);
        }
    }, [initialized]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Context-aware greeting when page changes
    useEffect(() => {
        if (isOpen && messages.length > 1) {
            let greeting = "";
            if (pathname.includes('conceive')) greeting = "I see you're in the Conceive phase. Need help defining your problem statement?";
            else if (pathname.includes('design')) greeting = "Designing your solution? I can act as your Socratic tutor.";
            else if (pathname.includes('implement')) greeting = "Ready to code? I can help you debug or find resources.";
            else if (pathname.includes('operate')) greeting = "Deployment time! Let me know if you need help with the checklist.";

            if (greeting) {
                setMessages(prev => [...prev, { role: 'ai', text: greeting, timestamp: Date.now() }]);
            }
        }
    }, [pathname]);

    const handleOpenCompanion = () => {
        // Close Socratic if open
        if (socratic.isOpen) {
            socratic.setIsOpen(false);
        }
        setIsOpen(true);
    };

    const handleToggleSocratic = () => {
        if (socratic.isOpen) {
            socratic.setIsOpen(false);
        } else {
            // Close AI Companion first
            setIsOpen(false);
            socratic.setIsOpen(true);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: Date.now() }]);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/v1/ai/companion-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_message: userMsg,
                    current_page: pathname,
                    user_context: { path: pathname },
                    conversation_history: messages.slice(-6)
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'ai', text: data.ai_response, timestamp: Date.now() }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "I'm having a bit of trouble connecting. Try again?", timestamp: Date.now() }]);
            }
        } catch (error) {
            console.error('AI Chat error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: "Network error. Please check your connection.", timestamp: Date.now() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (pathname === '/login') return null;

    // Button group position - moves left when Socratic sidebar is open
    const buttonGroupRight = socratic.isOpen ? 'right-[calc(33vw+1.5rem)]' : 'right-6';

    return (
        <>
            {/* Socratic Sidebar - rendered here so it's always available */}
            <SocraticSidebar
                isOpen={socratic.isOpen}
                onClose={() => socratic.setIsOpen(false)}
                projectId={socratic.projectId}
                phase={socratic.phase}
                context={socratic.context}
            />

            {/* Floating buttons and chat window */}
            {!isOpen ? (
                <div className={`fixed bottom-6 ${buttonGroupRight} z-[45] flex items-center gap-3 transition-all duration-300`}>
                    {/* Socratic Tutor Button - only on CDIO pages */}
                    {socratic.isEnabled && (
                        <button
                            onClick={handleToggleSocratic}
                            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${socratic.isOpen
                                    ? 'bg-gray-300 text-gray-600'
                                    : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:scale-110'
                                }`}
                            title="Socratic Tutor"
                        >
                            <MessageSquare size={24} />
                        </button>
                    )}

                    {/* AI Companion Button */}
                    <button
                        onClick={handleOpenCompanion}
                        className="w-14 h-14 bg-gradient-to-r from-primary to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform animate-bounce-slow"
                        title="AI Companion"
                    >
                        <Sparkles size={24} />
                    </button>
                </div>
            ) : (
                <div className={`fixed bottom-6 ${buttonGroupRight} bg-white rounded-2xl shadow-2xl border border-gray-200 z-[45] transition-all duration-300 flex flex-col overflow-hidden ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px]'}`}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-purple-600 p-4 flex items-center justify-between text-white shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} />
                            <span className="font-bold">AI Companion</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:bg-white/20 p-1 rounded">
                                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:bg-white/20 p-1 rounded">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    {!isMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-white border-t border-gray-100">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Ask me anything..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-500"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading}
                                        className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

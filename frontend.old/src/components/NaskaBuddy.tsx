'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Paperclip, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export const NaskaBuddy = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string; type?: 'text' | 'action' }[]>([
        { role: 'ai', content: "Hi! I'm Naska. I've analyzed your recent IRIS progress." },
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Initial simulated analysis push
    useEffect(() => {
        if (isOpen && messages.length === 1) {
            setIsThinking(true);
            setTimeout(() => {
                setIsThinking(false);
                setMessages(prev => [
                    ...prev,
                    { role: 'ai', content: "I found 3 potential logic gaps in your 'Agentic Workflow' draft. Would you like to review them in the Studio?", type: 'action' }
                ]);
            }, 1500);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsThinking(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/naska/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    user_id: '1', // Mock ID
                    context: "current_page_context"
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: 'ai',
                content: data.response || "I heard you, but my response was empty."
            }]);
        } catch (error) {
            console.error("Naska Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "I'm having trouble connecting to the Knowledge Container right now. Please try again."
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleActionClick = () => {
        setIsOpen(false);
        router.push('/studio');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-4 w-[360px] md:w-[400px] bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden flex flex-col max-h-[600px]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Naska Intelligence</h3>
                                    <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        Gemini 1.5 Pro Active
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] bg-white/30">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        {msg.type === 'action' && (
                                            <button
                                                onClick={handleActionClick}
                                                className="mt-3 w-full flex items-center justify-between bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 px-3 py-2 rounded-xl text-xs font-bold transition-all group"
                                            >
                                                <span>Open Studio</span>
                                                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isThinking && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-1">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-gray-100 bg-white">
                            <div className="relative flex items-center bg-gray-50 rounded-full border border-gray-200 px-2 py-1 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                    <Paperclip size={18} />
                                </button>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about your project..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 py-2 outline-none text-gray-800 placeholder:text-gray-400"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(108,89,72,0.25)] transition-all duration-500 z-50 ${isOpen ? 'bg-gray-900 text-white rotate-90' : 'bg-white text-gray-900'
                    }`}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 animate-pulse"></div>
                        <Sparkles size={24} className={isOpen ? '' : 'text-purple-600'} />
                        {/* Notification Dot */}
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
                    </>
                )}
            </motion.button>
        </div>
    );
};

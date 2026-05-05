import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, X, User, ChevronLeft } from 'lucide-react';

interface Message {
    id: number;
    sender_id: number;
    sender_name: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

interface Conversation {
    id: number;
    participants: number[];
    participant_names: string[];
    last_message: Message;
    updated_at: string;
}

export function InboxDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen]);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.id);
            // Poll for new messages
            const interval = setInterval(() => fetchMessages(activeConversation.id), 5000);
            return () => clearInterval(interval);
        }
    }, [activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/inbox/conversations`);
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    const fetchMessages = async (convId: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/inbox/conversations/${convId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/inbox/conversations/${activeConversation.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });

            if (res.ok) {
                const msg = await res.json();
                setMessages([...messages, msg]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const getOtherParticipantName = (conv: Conversation) => {
        // Assuming current user is "You" or ID 1. 
        // In a real app, we'd filter out the current user's name.
        return conv.participant_names.find(name => name !== 'You') || 'Unknown';
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
            >
                <Mail size={20} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                {activeConversation && (
                                    <button
                                        onClick={() => setActiveConversation(null)}
                                        className="mr-2 p-1 hover:bg-gray-200 rounded-full"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <h2 className="font-bold text-lg text-gray-900">
                                    {activeConversation ? getOtherParticipantName(activeConversation) : 'Inbox'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {!activeConversation ? (
                                // Conversation List
                                <div className="overflow-y-auto h-full">
                                    {conversations.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            No messages yet
                                        </div>
                                    ) : (
                                        conversations.map(conv => (
                                            <div
                                                key={conv.id}
                                                onClick={() => setActiveConversation(conv)}
                                                className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-4"
                                            >
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                    {getOtherParticipantName(conv).charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className="font-bold text-gray-900 truncate">
                                                            {getOtherParticipantName(conv)}
                                                        </h3>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(conv.updated_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {conv.last_message?.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                // Chat View
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                                        {messages.map(msg => {
                                            const isMe = msg.sender_name === 'You';
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] p-3 rounded-2xl ${isMe
                                                            ? 'bg-primary text-white rounded-tr-none'
                                                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{msg.content}</p>
                                                        <span className={`text-[10px] block mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="p-2 bg-primary text-white rounded-full hover:bg-[#5a4a3b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

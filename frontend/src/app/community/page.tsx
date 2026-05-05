'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Users, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const EVENTS = [
    { title: "AI Ethics Hackathon", date: "Oct 15, 2026", type: "Virtual", attendees: 120 },
    { title: "Jakarta Tech Meetup", date: "Nov 02, 2026", type: "In-Person", attendees: 50 },
    { title: "Green AI Symposium", date: "Nov 20, 2026", type: "Hybrid", attendees: 300 },
];

const DISCUSSIONS = [
    { title: "How are you implementing RAG in production?", author: "Sarah Chen", replies: 24, topic: "Engineering" },
    { title: "Ethical considerations for AI in government", author: "Budi Santoso", replies: 18, topic: "Policy" },
    { title: "Best resources for learning Rust?", author: "Alex Kim", replies: 45, topic: "Languages" },
];

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            <Navbar />

            <main className="max-w-[70rem] mx-auto px-4 py-8">

                {/* Hero Section */}
                <section className="text-center mb-12 py-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4 animate-fade-in-up">
                        <Users size={14} /> VOKASI Community
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Hive Mind</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Connect with AI practitioners, share knowledge, and learn together through discussions, events, and collaborative exchange.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                            <MessageSquare size={18} /> Join Discussions
                        </button>
                        <button className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2">
                            <Calendar size={18} /> View Events
                        </button>
                    </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Discussion Highlights */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare size={20} className="text-primary" /> Trending Discussions
                            </h3>
                            <Link href="/community/discussions" className="text-xs font-bold text-primary hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {DISCUSSIONS.map((disc, i) => (
                                <div key={i} className="p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">{disc.topic}</span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1"><MessageSquare size={12} /> {disc.replies}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">{disc.title}</h4>
                                    <p className="text-xs text-gray-500">Started by {disc.author}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Calendar size={20} className="text-accent" /> Upcoming Events
                            </h3>
                            <Link href="/community/events" className="text-xs font-bold text-primary hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {EVENTS.map((evt, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex-shrink-0 w-12 text-center bg-gray-100 rounded-lg py-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase">{evt.date.split(' ')[0]}</p>
                                        <p className="text-lg font-black text-gray-900">{evt.date.split(' ')[1].replace(',', '')}</p>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{evt.title}</h4>
                                        <p className="text-xs text-gray-500">{evt.type} · {evt.attendees} attending</p>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}

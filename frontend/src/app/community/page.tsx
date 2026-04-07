'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MapPin, Trophy, Flame, Users, Calendar, MessageSquare, ArrowRight, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';

// Mock Data for "Ekspedisi AI Nusantara"
const PROVINCES = [
    { rank: 1, name: "DKI Jakarta", xp: "18,200", trend: "+5%" },
    { rank: 2, name: "Jawa Barat", xp: "16,800", trend: "+3%" },
    { rank: 3, name: "Jawa Tengah", xp: "15,400", trend: "+4%" },
    { rank: 4, name: "Bali", xp: "14,200", trend: "+8%" },
    { rank: 5, name: "Yogyakarta", xp: "13,500", trend: "+2%" },
];

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
                        <Users size={14} /> T6 Community
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Hive Mind</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Connect with 50,000+ AI practitioners, share knowledge, and compete for your province in the national AI expedition.
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

                {/* Ekspedisi AI Nusantara Section */}
                <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-12">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black text-xl">ID</div>
                            <div>
                                <h2 className="text-2xl font-black leading-none mb-1">Ekspedisi AI Nusantara</h2>
                                <p className="text-red-100 text-sm font-medium">National AI Competition · 38 Provinces</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-black/20 rounded-lg text-sm font-bold flex items-center gap-2">
                            <Flame size={16} className="text-orange-400" fill="currentColor" />
                            Season 2026
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* User Province Stats (Mocked for current user in Jawa Timur) */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-bold mb-3">
                                <MapPin size={16} /> Your Province
                            </div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-3xl font-black text-gray-900">Jawa Timur</h3>
                                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                                    <TrendingUp size={14} /> +2 Ranks
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                                    <Trophy className="mx-auto mb-2 text-amber-600" size={24} />
                                    <p className="text-2xl font-black text-gray-900">#5</p>
                                    <p className="text-xs text-amber-700 font-bold">Rank</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                                    <Flame className="mx-auto mb-2 text-purple-600" size={24} />
                                    <p className="text-2xl font-black text-gray-900">12,450</p>
                                    <p className="text-xs text-purple-700 font-bold">XP Earned</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                    <Users className="mx-auto mb-2 text-blue-600" size={24} />
                                    <p className="text-2xl font-black text-gray-900">847</p>
                                    <p className="text-xs text-blue-700 font-bold">Learners</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                                    <Award className="mx-auto mb-2 text-emerald-600" size={24} />
                                    <p className="text-2xl font-black text-gray-900">3</p>
                                    <p className="text-xs text-emerald-700 font-bold">Badges</p>
                                </div>
                            </div>
                        </div>

                        {/* Top Provinces Leaderboard */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Trophy size={14} /> Top Provinces
                            </h3>
                            <div className="space-y-4">
                                {PROVINCES.map((prov, i) => (
                                    <div key={prov.name} className="group relative">
                                        <div className="flex items-center justify-between mb-2 z-10 relative">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                                    ${i === 0 ? 'bg-amber-100 text-amber-700' :
                                                        i === 1 ? 'bg-gray-100 text-gray-600' :
                                                            i === 2 ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-400'
                                                    }`}>
                                                    {prov.rank}
                                                </div>
                                                <span className="font-bold text-gray-900">{prov.name}</span>
                                            </div>
                                            <div className="font-mono font-bold text-gray-500 text-sm">
                                                {prov.xp} <span className="text-xs text-gray-400">XP</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar Background */}
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out
                                                    ${i === 0 ? 'bg-amber-400' : 'bg-slate-300 group-hover:bg-slate-400'}
                                                `}
                                                style={{ width: `${100 - (i * 15)}%` }} // Mock visual width decay
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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

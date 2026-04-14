'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookMarked, ArrowRight, Bell, Newspaper } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white py-20">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <BookMarked size={16} />
                        INSIGHTS & UPDATES
                    </div>
                    <h1 className="text-5xl font-black mb-6">T6 Blog</h1>
                    <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                        Insights on AI, education, career development, and the future of learning
                    </p>
                </div>
            </section>

            {/* Coming Soon Section */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Newspaper size={48} className="text-purple-600" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Blog Coming Soon</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            We're preparing insightful content about AI in education, the IRIS Cycle, career development, and the future of learning. Check back soon for our first articles.
                        </p>
                    </div>
                </div>
            </section>

            {/* Topics Preview */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Upcoming Topics</h2>
                        <p className="text-gray-600">What we'll be writing about</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'AI in Education',
                                description: 'How artificial intelligence is transforming the learning experience'
                            },
                            {
                                title: 'IRIS Cycle',
                                description: "Deep dives into our action learning methodology"
                            },
                            {
                                title: 'Career Development',
                                description: 'Tips and insights for career changers entering tech'
                            },
                            {
                                title: 'Blockchain Credentials',
                                description: 'The future of verifiable digital certificates'
                            },
                            {
                                title: 'SDG Impact',
                                description: 'How education contributes to sustainable development'
                            },
                            {
                                title: 'Industry Insights',
                                description: 'Trends and opportunities in the tech sector'
                            }
                        ].map((topic, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">{topic.title}</h3>
                                <p className="text-sm text-gray-600">{topic.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-16 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-white text-center">
                        <Bell size={40} className="mx-auto mb-4" />
                        <h2 className="text-3xl font-black mb-4">Get Notified</h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Subscribe to be notified when we publish new articles and insights
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Explore CTA */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-4">Ready to Start Learning?</h2>
                    <p className="text-gray-600 mb-8">Explore our career pathways while you wait for our blog</p>
                    <Link
                        href="/pathways"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all"
                    >
                        View Pathways <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

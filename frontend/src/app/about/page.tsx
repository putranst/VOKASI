'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Target, Heart, Globe, Sparkles, Users, Award, Lightbulb, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a] text-white py-24 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-[70rem] mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <Heart size={16} className="text-red-400" />
                            OUR MISSION
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
                            Tsinghua Southeast Asia
                            <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                Center (TSEA)
                            </span>
                        </h1>
                        <p className="text-xl text-gray-300 leading-relaxed">
                            A dynamic hub for research, collaboration, and knowledge exchange between China, Southeast Asia, and the world.
                        </p>
                    </div>
                </div>
            </section>

            {/* About TSEA */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-6">About TSEA</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    <strong>Tsinghua Southeast Asia Center (TSEA)</strong> is a prestigious institution established to strengthen academic, cultural, and economic ties between China, Southeast Asia, and beyond.
                                </p>
                                <p>
                                    The center was officially established in <strong>October 2018</strong> and its campus was inaugurated on <strong>November 16, 2022</strong>, in Bali, Indonesia, during the 17th Group of 20 (G20) Summit.
                                </p>
                                <p>
                                    TSEA operates from the <strong>Kura Kura Bali campus</strong>, developed in partnership with the <strong>United in Diversity (UID) Foundation</strong>. It is managed by Tsinghua University's School of Continuing Education.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 text-center">
                            <div className="text-6xl font-black text-primary/30 mb-4">TSEA</div>
                            <div className="text-lg font-bold text-gray-700">Est. 2018 • Bali, Indonesia</div>
                            <div className="text-sm text-gray-500 mt-2">Part of Tsinghua University's global strategy</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-white p-10 rounded-3xl shadow-lg">
                            <Target size={48} className="text-cyan-600 mb-6" />
                            <h2 className="text-2xl font-black text-gray-900 mb-4">Our Mission</h2>
                            <p className="text-gray-600 leading-relaxed">
                                To promote mutual understanding, cooperation, and sustainable growth. TSEA is committed to strengthening academic, cultural, and economic ties between China and Southeast Asia, partnering with global allies to contribute to humanity's sustainable future and the United Nations Sustainable Development Goals.
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-3xl shadow-lg">
                            <Lightbulb size={48} className="text-purple-600 mb-6" />
                            <h2 className="text-2xl font-black text-gray-900 mb-4">Our Vision</h2>
                            <p className="text-gray-600 leading-relaxed">
                                To build an innovative ecosystem platform for cooperation, innovation, co-creation, and sharing among academia, government, and the private sector. We address the demands of Industry 4.0 and advance the UN SDGs through talent development and cross-border exchanges.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* T6 Platform */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">The T6 Platform</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            T6 is TSEA's digital learning platform, combining world-class curriculum with AI-powered education
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Sparkles,
                                title: 'AI-Powered Learning',
                                description: 'Socratic AI tutor that guides learners through project-based education using the CDIO framework.',
                                color: 'text-yellow-600',
                                bg: 'bg-yellow-50'
                            },
                            {
                                icon: Award,
                                title: 'Blockchain Credentials',
                                description: 'Verifiable digital credentials that prove your skills and achievements to employers worldwide.',
                                color: 'text-purple-600',
                                bg: 'bg-purple-50'
                            },
                            {
                                icon: Globe,
                                title: 'Global Impact',
                                description: 'Education aligned with UN Sustainable Development Goals, creating positive change across Southeast Asia.',
                                color: 'text-blue-600',
                                bg: 'bg-blue-50'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-gray-50 p-8 rounded-2xl">
                                <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Our Partners</h2>
                    <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                        TSEA is a joint initiative of Tsinghua University and the United in Diversity Foundation
                    </p>
                    <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="text-2xl font-black text-primary mb-2">Tsinghua University</div>
                            <p className="text-sm text-gray-600">One of China's most prestigious universities, managing TSEA through its School of Continuing Education</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="text-2xl font-black text-accent mb-2">UID Foundation</div>
                            <p className="text-sm text-gray-600">United in Diversity Foundation provides the Kura Kura Bali campus and operational support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTAs */}
            <section className="py-16 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Link href="/team" className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all group">
                            <Users size={32} className="text-primary mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                Meet the Faculty
                            </h3>
                            <p className="text-gray-600">World-class academics from MIT, Tsinghua, and beyond</p>
                        </Link>
                        <Link href="/hexahelix" className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all group">
                            <Globe size={32} className="text-accent mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                                Hexahelix Model
                            </h3>
                            <p className="text-gray-600">Our unique approach to multi-stakeholder innovation</p>
                        </Link>
                        <a href="https://tsea.asia" target="_blank" rel="noopener noreferrer" className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all group">
                            <ExternalLink size={32} className="text-green-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                                Visit TSEA.asia
                            </h3>
                            <p className="text-gray-600">Learn more about Tsinghua Southeast Asia Center</p>
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

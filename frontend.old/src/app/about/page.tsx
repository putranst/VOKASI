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
            <section className="relative bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#065f46] text-white py-24 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-[70rem] mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <Heart size={16} className="text-emerald-400" />
                            OUR MISSION
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
                            Pendidikan Vokasi
                            <span className="block bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                Berbasis AI untuk Indonesia
                            </span>
                        </h1>
                        <p className="text-xl text-emerald-100 leading-relaxed">
                            VOKASI is Indonesia's sovereign AI-native vocational education platform — built for SMK, politeknik, and BLK institutions to create, deliver, and verify skills at scale.
                        </p>
                    </div>
                </div>
            </section>

            {/* About VOKASI */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-6">About VOKASI</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    <strong>VOKASI</strong> is an AI-native vocational education platform that unifies course creation, adaptive learning, and blockchain-verified credentialing under one sovereign, white-label system tailored for Indonesia.
                                </p>
                                <p>
                                    Built to serve <strong>SMK (Sekolah Menengah Kejuruan)</strong>, <strong>politeknik</strong>, and <strong>BLK (Balai Latihan Kerja)</strong> ecosystems, VOKASI lets instructors generate Kurikulum Merdeka-aligned courses in minutes using AI, then deliver them through an adaptive student experience.
                                </p>
                                <p>
                                    Our platform aligns with <strong>UN SDG 4 (Quality Education)</strong> and Indonesia's national digital transformation agenda, empowering every learner — regardless of connectivity or geography — to access world-class vocational education.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 text-center">
                            <div className="text-6xl font-black text-primary/30 mb-4">VOKASI</div>
                            <div className="text-lg font-bold text-gray-700">Indonesia-First • AI-Native</div>
                            <div className="text-sm text-gray-500 mt-2">Aligned with Kurikulum Merdeka & UN SDG 4</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-white p-10 rounded-3xl shadow-lg">
                            <Target size={48} className="text-emerald-600 mb-6" />
                            <h2 className="text-2xl font-black text-gray-900 mb-4">Our Mission</h2>
                            <p className="text-gray-600 leading-relaxed">
                                To democratize high-quality vocational education across Indonesia by giving every instructor the power of AI course generation and every student a personalized, competency-tracked learning journey — verified by blockchain credentials that employers trust.
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-3xl shadow-lg">
                            <Lightbulb size={48} className="text-teal-600 mb-6" />
                            <h2 className="text-2xl font-black text-gray-900 mb-4">Our Vision</h2>
                            <p className="text-gray-600 leading-relaxed">
                                To become Indonesia's sovereign vocational education infrastructure — the platform that connects SMK graduates to industry, politeknik programs to global standards, and BLK instructors to AI-powered course creation tools, all without dependency on foreign platforms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform pillars */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">The VOKASI Platform</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Three integrated layers: AI course creation, adaptive student learning, and verifiable credentials.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Sparkles,
                                title: 'AI Course Generation',
                                description: 'Instructors type a prompt in Bahasa Indonesia; VOKASI generates a full Kurikulum Merdeka-aligned module with quizzes, videos, and Socratic chat blocks in under 60 seconds.',
                                color: 'text-yellow-600',
                                bg: 'bg-yellow-50'
                            },
                            {
                                icon: Award,
                                title: 'Blockchain Credentials',
                                description: 'Soulbound Token (SBT) certificates are minted on completion — permanently verifiable, unforgeable, and shareable with Indonesian employers and BNSP.',
                                color: 'text-purple-600',
                                bg: 'bg-purple-50'
                            },
                            {
                                icon: Globe,
                                title: 'Offline-First Delivery',
                                description: 'VOKASI caches course content locally for low-bandwidth regions across the Indonesian archipelago, syncing progress when connectivity returns.',
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

            {/* Ecosystem partners */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Ecosystem Partners</h2>
                    <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                        VOKASI integrates with Indonesia's national education and credentialing infrastructure
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="text-2xl font-black text-primary mb-2">Kemendikbudristek</div>
                            <p className="text-sm text-gray-600">Aligned with the Ministry of Education's Kurikulum Merdeka and Merdeka Belajar initiatives</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="text-2xl font-black text-accent mb-2">BNSP</div>
                            <p className="text-sm text-gray-600">Credentials mapped to national competency standards for professional certification recognition</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="text-2xl font-black text-teal-600 mb-2">UN SDSN</div>
                            <p className="text-sm text-gray-600">Contributing to SDG 4 Quality Education targets through accessible, AI-powered vocational learning</p>
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
                                Meet the Team
                            </h3>
                            <p className="text-gray-600">The educators and engineers building VOKASI</p>
                        </Link>
                        <Link href="/hexahelix" className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all group">
                            <Globe size={32} className="text-accent mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                                Hexahelix Model
                            </h3>
                            <p className="text-gray-600">Our multi-stakeholder approach to education innovation</p>
                        </Link>
                        <Link href="/contact" className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all group">
                            <ExternalLink size={32} className="text-emerald-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                Get in Touch
                            </h3>
                            <p className="text-gray-600">Partner with us or request a pilot for your institution</p>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

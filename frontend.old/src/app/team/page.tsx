'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Users, Linkedin, Globe, GraduationCap, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const leadership = [
    {
        name: 'Putra Nusantara',
        role: 'CEO & Co-Founder',
        description: 'Leads VOKASI\'s vision for AI-native vocational education across Indonesia. Former education technologist with 10+ years in Indonesian SMK and politeknik ecosystems.'
    },
    {
        name: 'Aisyah Rahmawati',
        role: 'Chief Learning Officer',
        description: 'Designed the IRIS learning framework and Kurikulum Merdeka integration. Specialist in competency-based education and Indonesian vocational standards.'
    },
    {
        name: 'Budi Santoso',
        role: 'CTO & Co-Founder',
        description: 'Architected the VOKASI AI engine and Puck-based course builder. Former engineer at Indonesian unicorn startups.'
    },
    {
        name: 'Dewi Lestari',
        role: 'Head of Partnerships',
        description: 'Manages VOKASI\'s relationships with SMK, BLK, and politeknik institutions. Connects the platform to Kemendikbudristek and BNSP certification pipelines.'
    }
];

const advisors = [
    { name: 'Prof. Suhono Supangkat', role: 'AI & Smart Systems Advisor', description: 'Smart city and AI education expert' },
    { name: 'Prof. Togar M. Simatupang', role: 'Curriculum Advisor', description: 'Operations and vocational curriculum design' },
    { name: 'Dr. Shobi Lawalata', role: 'Learning Program Advisor', description: 'Program development and BLK integration' },
    { name: 'Ir. Alessandro Golkar', role: 'Systems Engineering Advisor', description: 'Engineering education and CDIO methodology' },
    { name: 'Dr. Ela Ben-Ur', role: 'Design Thinking Advisor', description: 'Innovation and human-centered design' },
    { name: 'Carlos Faerron', role: 'SDG & Impact Advisor', description: 'Planetary health and UN SDG alignment' }
];

const institutionalPartners = [
    { name: 'Kemendikbudristek', title: 'Ministry of Education, Culture, Research and Technology', role: 'Curriculum alignment partner' },
    { name: 'BNSP', title: 'Badan Nasional Sertifikasi Profesi', role: 'National competency certification body' },
    { name: 'UN SDSN', title: 'UN Sustainable Development Solutions Network', role: 'SDG 4 Quality Education partner' }
];

export default function TeamPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#065f46] text-white py-20">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <Users size={16} />
                        OUR TEAM
                    </div>
                    <h1 className="text-5xl font-black mb-6">The People Behind VOKASI</h1>
                    <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                        Educators, engineers, and policy experts united around one mission: making world-class vocational education accessible across Indonesia.
                    </p>
                </div>
            </section>

            {/* Core Leadership */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Leadership</h2>
                        <p className="text-gray-600">Guiding VOKASI's mission and product strategy</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {leadership.map((person, i) => (
                            <div key={i} className="bg-gray-50 p-8 rounded-2xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                        {person.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                                        <p className="text-primary font-medium text-sm">{person.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{person.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Advisors */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Advisory Board</h2>
                        <p className="text-gray-600">Domain experts shaping VOKASI's curriculum and technical direction</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {advisors.map((person, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-all">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
                                    {person.name.replace(/[^a-zA-Z ]/g, '').split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('')}
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">{person.name}</h3>
                                <p className="text-xs text-primary mt-1 font-medium">{person.role}</p>
                                <p className="text-xs text-gray-500 mt-1">{person.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Institutional Partners */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Institutional Partners</h2>
                        <p className="text-gray-600">Government and international bodies that validate and integrate with VOKASI</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {institutionalPartners.map((partner, i) => (
                            <div key={i} className="flex items-start gap-4 bg-gray-50 p-6 rounded-xl">
                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <GraduationCap size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{partner.name}</h3>
                                    <p className="text-xs text-gray-500 mb-1">{partner.title}</p>
                                    <p className="text-sm text-primary font-medium">{partner.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join CTA */}
            <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black mb-4">Join the VOKASI Team</h2>
                    <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                        We're building Indonesia's vocational education future. If you're passionate about AI, education, or both — we'd love to hear from you.
                    </p>
                    <a
                        href="mailto:hello@vokasi.id"
                        className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Get in Touch <ExternalLink size={18} />
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}

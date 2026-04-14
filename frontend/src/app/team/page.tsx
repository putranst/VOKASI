'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Users, Linkedin, Globe, GraduationCap, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Verified faculty from t6.tsea.asia
const faculty = [
    { name: 'Edward F. Crawley', role: 'Ford Professor of Engineering, MIT', description: 'Chair of the Board of Management of TSEA' },
    { name: 'Mats Hanson', role: 'Professor of Mechatronics', description: 'Engineering education expert' },
    { name: 'Victor Chan', role: 'Professor & Associate Dean', description: 'Academic leadership' },
    { name: 'Shobi Lawalata', role: 'Director of Learning Programs', description: 'Program development and delivery' },
    { name: 'Alessandro Golkar', role: 'Professor of Engineering', description: 'Systems engineering' },
    { name: 'Togar M. Simatupang', role: 'Professor of Operations', description: 'Operations and supply chain' },
    { name: 'Bish Sanyal', role: 'Ford International Professor', description: 'Urban planning and development' },
    { name: 'Ela Ben-Ur', role: 'Design Thinking Expert', description: 'Innovation and design' },
    { name: 'Liu Pei', role: 'Assoc. Professor Energy', description: 'Energy systems' },
    { name: 'Peter Finn', role: 'CEO & Innovator', description: 'Business innovation' },
    { name: 'Marina Alberti', role: 'Professor of Urban Design', description: 'Urban ecology and design' },
    { name: 'Suhono Supangkat', role: 'Professor of Smart Cities', description: 'Smart city technologies' },
    { name: 'Carlos Faerron', role: 'Planetary Health Advisor', description: 'Health and sustainability' }
];

// Key organizational figures (verified from research)
const leadership = [
    {
        name: 'Wang Xiaoxiao',
        role: 'Director of TSEA',
        description: 'Leads the Tsinghua Southeast Asia Center operations and strategic initiatives.'
    },
    {
        name: 'Edward F. Crawley',
        role: 'Chair, Board of Management',
        description: 'MIT Ford Professor of Engineering. Leads strategic direction of TSEA.'
    }
];

// Partner organization leaders (verified)
const partners = [
    { name: 'Mari Elka Pangestu', title: 'President, United in Diversity (UID) Fund', role: 'Strategic partner' },
    { name: 'Cherie Nursalim', title: 'Vice Chairman, UID Foundation', role: 'Campus development partner' },
    { name: 'Tuti Hadiputrato', title: 'Chairman, UID', role: 'Founding partner' }
];

export default function TeamPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero */}
            <section className="bg-gradient-to-br from-teal-900 via-cyan-800 to-blue-900 text-white py-20">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <Users size={16} />
                        OUR TEAM
                    </div>
                    <h1 className="text-5xl font-black mb-6">World-Class Faculty & Leadership</h1>
                    <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
                        T6 brings together distinguished academics and industry leaders from MIT, Tsinghua, and leading institutions worldwide
                    </p>
                </div>
            </section>

            {/* Leadership */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Leadership</h2>
                        <p className="text-gray-600">Guiding TSEA's mission and strategy</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {leadership.map((person, i) => (
                            <div key={i} className="bg-gray-50 p-8 rounded-2xl text-center">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                                    {person.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{person.name}</h3>
                                <p className="text-primary font-medium mb-3">{person.role}</p>
                                <p className="text-sm text-gray-600">{person.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Faculty */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Faculty</h2>
                        <p className="text-gray-600">Distinguished academics from world-leading institutions</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {faculty.map((person, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-all">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
                                    {person.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">{person.name}</h3>
                                <p className="text-xs text-primary mt-1">{person.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partner Organizations */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Partner Leadership</h2>
                        <p className="text-gray-600">United in Diversity (UID) Foundation - our campus partner</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {partners.map((partner, i) => (
                            <div key={i} className="flex items-center gap-4 bg-gray-50 p-6 rounded-xl">
                                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center">
                                    <GraduationCap size={24} className="text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{partner.name}</h3>
                                    <p className="text-sm text-primary">{partner.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About TSEA */}
            <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black mb-4">About Tsinghua SEA</h2>
                    <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                        Tsinghua Southeast Asia Center (TSEA) was established in 2018 and inaugurated in 2022 at Kura Kura Bali, Indonesia. It is a joint initiative of Tsinghua University and the United in Diversity Foundation.
                    </p>
                    <a
                        href="https://tsea.asia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Visit TSEA.asia <ExternalLink size={18} />
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}

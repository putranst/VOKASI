'use client';

import React, { useState, useEffect } from 'react';
import { Zap, ChevronRight, PlayCircle, Briefcase, Cpu, CheckCircle, Brain, Shield, ChevronLeft } from 'lucide-react';

export const HeroSlider: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const slides = [
        {
            badge: "THE FIRST HEXAHELIX LEARNING PLATFORM",
            icon: Zap,
            title: ["Uniting the", "Six Sectors", "of Innovation."],
            description: "Enterprise-grade education bridging Government, Business, and Civil Society. Powered by Tsinghua SEA & United in Diversity.",
            visual: "hexahelix"
        },
        {
            badge: "NEXT-GEN AI POWERED LEARNING",
            icon: Brain,
            title: ["Powered by", "Cutting-Edge", "AI Models."],
            description: "Harness the latest frontier models: ChatGPT 5.1, Gemini 3 Pro, and Claude Sonnet 4.5. Multi-model AI ensemble for unparalleled personalization, real-time tutoring, and intelligent curriculum design.",
            visual: "ai"
        },
        {
            badge: "BLOCKCHAIN-VERIFIED CREDENTIALS",
            icon: Shield,
            title: ["Credentials", "You Can", "Prove."],
            description: "Every achievement is a Soulbound Token on the blockchain—tamper-proof, instantly verifiable, and owned by you forever. No middleman, no paperwork.",
            visual: "blockchain"
        },
        {
            badge: "SOLVING GLOBAL CHALLENGES",
            icon: Zap,
            title: ["Accelerating", "17 SDGs", "Through Education."],
            description: "Align your learning journey with UN Sustainable Development Goals. From climate action to quality education—build skills that create measurable impact on global challenges.",
            visual: "sdg"
        }
    ];

    useEffect(() => {
        if (!mounted) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [mounted, slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const currentSlideData = slides[currentSlide];
    const Icon = currentSlideData.icon;

    return (
        <section className="pt-24 pb-16 px-4 relative overflow-hidden">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-accent/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-primary/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/3 translate-y-1/4" />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-accent shadow-sm tracking-wide" suppressHydrationWarning>
                        <Icon size={14} fill="currentColor" />
                        {currentSlideData.badge}
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.1]" suppressHydrationWarning>
                        {currentSlideData.title[0]} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                            {currentSlideData.title[1]}
                        </span> {currentSlideData.title[2]}
                    </h1>

                    <p className="text-xl text-gray-600 leading-relaxed max-w-xl font-medium" suppressHydrationWarning>
                        {currentSlideData.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-[#5a4a3b] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                            Start Learning <ChevronRight size={20} />
                        </button>
                        <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-base hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                            <PlayCircle size={20} /> Demo for Enterprise
                        </button>
                    </div>

                    {/* Slider Controls */}
                    {mounted && (
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={prevSlide}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex gap-2">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextSlide}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Visual Section */}
                <div className="relative flex justify-center lg:justify-end" suppressHydrationWarning>
                    <div className="relative w-full max-w-md aspect-square animate-float-slow">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-2xl" />

                        {/* Floating Cards - Different for each slide */}
                        {currentSlideData.visual === 'hexahelix' && (
                            <div className="relative z-10 grid gap-4 p-6">
                                <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 transform translate-x-8 translate-y-8 z-20">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Track</p>
                                            <p className="font-bold text-gray-900">Business Executive</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary w-3/4 h-full rounded-full" />
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 transform -translate-x-4 z-10">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center">
                                            <Cpu size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technology</p>
                                            <p className="font-bold text-gray-900">AI Governance</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg w-fit uppercase tracking-wide">
                                        <CheckCircle size={12} /> Verifiable Credential
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSlideData.visual === 'ai' && (
                            <div className="relative z-10 grid gap-4 p-6">
                                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-2xl border border-blue-100 transform translate-y-2">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur text-white flex items-center justify-center">
                                            <Brain size={20} />
                                        </div>
                                        <div className="text-white">
                                            <p className="text-xs font-bold opacity-80 uppercase tracking-wider">AI Ensemble</p>
                                            <p className="font-bold">Multi-Model Intelligence</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 flex items-center justify-between">
                                            <span className="text-white text-xs font-medium">ChatGPT 5.1</span>
                                            <span className="text-emerald-300 text-[10px] font-bold">ACTIVE</span>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 flex items-center justify-between">
                                            <span className="text-white text-xs font-medium">Gemini 3 Pro</span>
                                            <span className="text-emerald-300 text-[10px] font-bold">ACTIVE</span>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 flex items-center justify-between">
                                            <span className="text-white text-xs font-medium">Claude Sonnet 4.5</span>
                                            <span className="text-emerald-300 text-[10px] font-bold">ACTIVE</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 transform -translate-x-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Next-Gen Features</span>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Live</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-blue-600" />
                                            <span className="text-sm text-gray-600">Real-time Reasoning</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-blue-600" />
                                            <span className="text-sm text-gray-600">Vision Analysis</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-blue-600" />
                                            <span className="text-sm text-gray-600">Multimodal Learning</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSlideData.visual === 'blockchain' && (
                            <div className="relative z-10 grid gap-4 p-6">
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-2xl border border-emerald-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur text-white flex items-center justify-center">
                                            <Shield size={20} />
                                        </div>
                                        <div className="text-white">
                                            <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Soulbound Token</p>
                                            <p className="font-bold">NFT Credential</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 space-y-2">
                                        <div className="flex justify-between text-white text-xs">
                                            <span className="opacity-70">Token ID:</span>
                                            <span className="font-mono font-bold">#42851</span>
                                        </div>
                                        <div className="flex justify-between text-white text-xs">
                                            <span className="opacity-70">Blockchain:</span>
                                            <span className="font-bold">Ethereum</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white text-xs pt-2 border-t border-white/20">
                                            <CheckCircle size={12} />
                                            <span className="font-bold">Verified & Immutable</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 transform -translate-x-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                            🏆
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Achievement</p>
                                            <p className="font-bold text-gray-900">AI Governance Master</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        0x7a8f...9d2e
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSlideData.visual === 'sdg' && (
                            <div className="relative z-10 grid gap-4 p-6">
                                <div className="bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 p-6 rounded-2xl shadow-2xl border border-green-100 transform translate-y-2">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur text-white flex items-center justify-center text-lg">
                                            🌍
                                        </div>
                                        <div className="text-white">
                                            <p className="text-xs font-bold opacity-80 uppercase tracking-wider">UN SDGs</p>
                                            <p className="font-bold">Global Impact</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { num: "4", label: "Quality\nEducation", color: "bg-red-500" },
                                            { num: "8", label: "Decent\nWork", color: "bg-pink-500" },
                                            { num: "9", label: "Industry\nInnovation", color: "bg-orange-500" },
                                            { num: "13", label: "Climate\nAction", color: "bg-green-600" },
                                            { num: "16", label: "Peace &\nJustice", color: "bg-blue-600" },
                                            { num: "17", label: "Partner-\nships", color: "bg-indigo-600" }
                                        ].map((sdg, i) => (
                                            <div key={i} className={`${sdg.color} rounded-lg p-2 text-white text-center`}>
                                                <div className="text-xl font-black">{sdg.num}</div>
                                                <div className="text-[8px] font-bold leading-tight whitespace-pre-line">{sdg.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 transform -translate-x-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Your Impact</span>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Tracking</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">SDG 4: Quality Education</span>
                                            <span className="font-bold text-green-600">+12 skills</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">SDG 13: Climate Action</span>
                                            <span className="font-bold text-green-600">+8 projects</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

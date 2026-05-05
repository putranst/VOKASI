'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Building2, GraduationCap, Zap, Globe, Briefcase, PlayCircle } from 'lucide-react';

export const EnterpriseHero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const slides = [
        {
            target: "THE PLATFORM",
            icon: Globe,
            title: "Where Industry, Academia, and Government Converge.",
            description: "VOKASI is Indonesia's sovereign AI-native vocational education platform — uniting SMK, politeknik, BLK, industry, and government in one adaptive learning ecosystem.",
            primaryCta: { text: "Explore Our Vision", href: "/hexahelix" },
            secondaryCta: { text: "View Partners", href: "/partners" },
            visualType: "platform",
            gradient: "from-blue-600 to-indigo-700"
        },
        {
            target: "FOR LEARNERS",
            icon: GraduationCap,
            title: "Master the Skills of Tomorrow, Today.",
            description: "AI-guided career pathways in Sustainability, Future Tech, and Digital Transformation. Earn blockchain-verified credentials recognized by global employers.",
            primaryCta: { text: "Find Your Career Path", href: "/pathways" },
            secondaryCta: { text: "Try AI Tutor", href: "/ai-tutor" },
            visualType: "learner",
            gradient: "from-emerald-500 to-teal-600"
        },
        {
            target: "FOR ENTERPRISE & GOV",
            icon: Building2,
            title: "Future-Proof Your Workforce.",
            description: "Scalable, AI-driven upskilling aligned with SDGs and ESG goals. Measure impact with verifiable data and transform your organization's capabilities.",
            primaryCta: { text: "Request Demo", href: "/enterprise" },
            secondaryCta: { text: "Corporate Solutions", href: "/corporate" },
            visualType: "enterprise",
            gradient: "from-purple-600 to-pink-600"
        },
        {
            target: "FOR UNIVERSITIES",
            icon: Briefcase, // academic partnership
            title: "The Next Evolution of Higher Ed.",
            description: "Augment your curriculum with AI grading, Socratic tutoring, and global industry projects. Join the network of forward-thinking institutions.",
            primaryCta: { text: "Partner With Us", href: "/partners" },
            secondaryCta: { text: "Academic Research", href: "/research" },
            visualType: "university",
            gradient: "from-orange-500 to-red-600"
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

    const currentData = slides[currentSlide];

    return (
        <section className="relative overflow-hidden bg-slate-50 min-h-[650px] flex items-center">
            {/* Abstract Background - Subtle & Professional */}
            <div className="absolute inset-0 bg-white">
                <div className="absolute top-0 right-0 w-[60%] h-full bg-slate-50 rounded-l-[100px] z-0" />
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl z-0" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 w-full py-12 md:py-20">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Target Audience Badge - Tab-like look */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {slides.map((slide, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`text-xs font-bold px-4 py-2 rounded-full transition-all uppercase tracking-wider ${idx === currentSlide
                                            ? `bg-gray-900 text-white shadow-lg`
                                            : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    {slide.target}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6 animate-fadeIn">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15]">
                                {currentData.title}
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                                {currentData.description}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Link href={currentData.primaryCta.href} className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                {currentData.primaryCta.text}
                                <ArrowRight size={20} />
                            </Link>
                            <Link href={currentData.secondaryCta.href} className="bg-white hover:bg-gray-50 text-slate-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                                {currentData.secondaryCta.text === "Try AI Tutor" ? <Zap size={20} className="text-amber-500" /> : <PlayCircle size={20} />}
                                {currentData.secondaryCta.text}
                            </Link>
                        </div>

                        {/* Navigation Arrows (Subtle) */}
                        <div className="flex items-center gap-4 pt-8">
                            <button onClick={prevSlide} className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <div className="flex gap-2">
                                {slides.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-gray-900' : 'w-2 bg-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <button onClick={nextSlide} className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Right Visual - Glassmorphism Cards */}
                    <div className="relative h-[400px] w-full flex items-center justify-center lg:justify-end">
                        <div className="relative w-full max-w-md aspect-square">
                            {/* Dynamic Visual Content */}
                            {currentData.visualType === 'platform' && (
                                <div className="relative w-full h-full animate-float-slow">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl opacity-20 blur-3xl"></div>
                                    <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/50 w-full mb-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
                                                <Globe size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">Hexahelix Economy</h3>
                                                <p className="text-sm text-slate-500">Cross-sector integration</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                                            <span className="text-slate-600">Global Partners</span>
                                            <span className="font-bold text-slate-900">120+</span>
                                        </div>
                                    </div>
                                    <div className="relative z-20 bg-slate-900 text-white rounded-2xl p-6 shadow-xl w-[90%] ml-auto transform translate-y-[-20px]">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Impact Metrics</span>
                                            <span className="text-green-400 font-bold">+24%</span>
                                        </div>
                                        <div className="text-2xl font-black mb-1">UN SDG 4</div>
                                        <p className="text-sm text-slate-400">Quality Education Access</p>
                                    </div>
                                </div>
                            )}

                            {currentData.visualType === 'learner' && (
                                <div className="relative w-full h-full animate-float-slow">
                                    <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 blur-3xl"></div>
                                    <div className="relative z-10 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 w-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">JS</div>
                                                <div>
                                                    <div className="font-bold text-sm">Jane Smith</div>
                                                    <div className="text-xs text-gray-500">AI Product Manager</div>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">Top 5%</div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="w-[85%] h-full bg-emerald-500 rounded-full"></div>
                                            </div>
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span>Course Progress</span>
                                                <span className="text-emerald-600">85%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 z-20 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Zap size={20} className="text-yellow-300" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold uppercase opacity-80">Skill Acquired</div>
                                            <div className="font-bold">Prompt Engineering</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(currentData.visualType === 'enterprise') && (
                                <div className="relative w-full h-full animate-float-slow">
                                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full opacity-15 blur-3xl"></div>
                                    <div className="relative z-10 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-200 p-6 w-full">
                                        <div className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Organization Skills Gap</div>
                                        <div className="space-y-4">
                                            {[
                                                { label: "Data Science", val: 30, color: "bg-purple-500" },
                                                { label: "Sustainability", val: 65, color: "bg-pink-500" },
                                                { label: "Leadership", val: 80, color: "bg-orange-500" }
                                            ].map((item, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between text-xs mb-1 font-medium">
                                                        <span>{item.label}</span>
                                                        <span>{item.val}% closure</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full">
                                                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute -right-4 top-20 z-20 bg-slate-800 text-white p-4 rounded-xl shadow-2xl skew-y-3">
                                        <div className="text-3xl font-black mb-1">ROI</div>
                                        <div className="text-sm opacity-80">Dashboard Live</div>
                                    </div>
                                </div>
                            )}

                            {currentData.visualType === 'university' && (
                                <div className="relative w-full h-full animate-float-slow">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-40"></div>
                                    <div className="relative z-10 bg-white p-6 rounded-t-2xl shadow-2xl border-b-4 border-orange-500 w-[80%] mx-auto">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full mb-4 flex items-center justify-center">
                                                <Building2 className="text-slate-400" size={32} />
                                            </div>
                                            <div className="h-2 w-24 bg-slate-200 rounded mb-2"></div>
                                            <div className="h-2 w-16 bg-slate-100 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="relative z-20 -mt-4 bg-orange-600 text-white p-5 rounded-xl shadow-xl w-full rotate-2 hover:rotate-0 transition-transform">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white/20 p-2 rounded-lg">
                                                <GraduationCap size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold">Next-Gen Curriculum</div>
                                                <div className="text-xs opacity-90">Powered by VOKASI AI</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

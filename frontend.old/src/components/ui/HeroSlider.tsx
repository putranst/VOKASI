'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, GraduationCap, Building2, Briefcase, PlayCircle } from 'lucide-react';

export const HeroSlider = () => {
    const [currentSubSlide, setCurrentSubSlide] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    const t6SubSlides = [
        {
            target: "THE PLATFORM",
            icon: Globe,
            title: "Where Industry, Academia, and Government Converge.",
            description: "VOKASI is Indonesia's sovereign AI-native vocational education platform — uniting SMK, politeknik, BLK, industry, and government in one learning ecosystem.",
            primaryCta: { text: "Explore Our Vision", href: "/hexahelix" },
            secondaryCta: { text: "View Partners", href: "/partners" },
        },
        {
            target: "FOR LEARNERS",
            icon: GraduationCap,
            title: "Master the Skills of Tomorrow, Today.",
            description: "AI-guided career pathways in Sustainability, Future Tech, and Digital Transformation. Earn blockchain-verified credentials.",
            primaryCta: { text: "Find Your Career Path", href: "/pathways" },
            secondaryCta: { text: "Try AI Tutor", href: "/ai-tutor" },
        },
        {
            target: "FOR ENTERPRISE",
            icon: Building2,
            title: "Future-Proof Your Workforce.",
            description: "Scalable, AI-driven upskilling aligned with SDGs and ESG goals. Measure impact with verifiable data.",
            primaryCta: { text: "Request Demo", href: "/enterprise" },
            secondaryCta: { text: "Corporate Solutions", href: "/enterprise" },
        },
        {
            target: "FOR UNIVERSITIES",
            icon: Briefcase,
            title: "The Next Evolution of Higher Ed.",
            description: "Augment your curriculum with AI grading, Socratic tutoring, and global industry projects.",
            primaryCta: { text: "Partner With Us", href: "/partners" },
            secondaryCta: { text: "Academic Research", href: "/partners" },
        }
    ];

    // Auto-rotate sub-slides
    useEffect(() => {
        if (!mounted) return;
        const timer = setInterval(() => {
            setCurrentSubSlide((prev) => (prev + 1) % t6SubSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [mounted, t6SubSlides.length]);

    const currentT6Data = t6SubSlides[currentSubSlide];

    return (
        <section className="relative overflow-hidden w-full max-w-[100vw]">
            <div>
                <div
                    className="relative bg-slate-50 overflow-hidden flex items-center min-h-[calc(100vh-64px)] py-12 md:py-0"
                >
                    {/* Abstract Background */}
                    <div className="absolute inset-0 bg-white">
                        <div className="absolute top-0 right-0 w-[60%] h-full bg-slate-50 rounded-l-[100px] z-0" />
                        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl z-0" />
                    </div>

                    <div className="relative z-10 max-w-[70rem] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                            {/* Left Content */}
                            <div className="space-y-6 md:space-y-8 overflow-hidden text-center lg:text-left">
                                {/* Sub-slide tabs - Simplified for mobile */}
                                <div className="flex justify-center lg:justify-start gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                    {t6SubSlides.map((slide, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSubSlide(idx)}
                                            className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full transition-all uppercase tracking-wider whitespace-nowrap ${idx === currentSubSlide
                                                ? 'bg-gray-900 text-white shadow-lg'
                                                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            {slide.target}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4" key={currentSubSlide}>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] break-words">
                                        {currentT6Data.title}
                                    </h1>
                                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                        {currentT6Data.description}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                                    <Link
                                        href={currentT6Data.primaryCta.href}
                                        className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 w-full sm:w-auto"
                                    >
                                        {currentT6Data.primaryCta.text}
                                        <ArrowRight size={20} />
                                    </Link>
                                    <Link
                                        href={currentT6Data.secondaryCta.href}
                                        className="bg-white hover:bg-gray-50 text-slate-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                                    >
                                        <PlayCircle size={20} />
                                        {currentT6Data.secondaryCta.text}
                                    </Link>
                                </div>

                                {/* Sub-slide indicators */}
                                <div className="flex justify-center lg:justify-start gap-2 pt-2">
                                    {t6SubSlides.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1 rounded-full transition-all duration-500 ${idx === currentSubSlide ? 'w-10 bg-gray-900' : 'w-2 bg-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Right Visual */}
                            <div className="relative hidden lg:flex items-center justify-end">
                                <div className="relative w-full max-w-sm">
                                    {/* Platform Visual */}
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                                    <div
                                        className="relative z-10 bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-white/50 w-full mb-4"
                                        style={{ animation: 'float 6s ease-in-out infinite' }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                                <currentT6Data.icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm">Hexahelix Economy</h3>
                                                <p className="text-xs text-slate-500">Cross-sector integration</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3">
                                            <span className="text-slate-600 text-sm">Global Partners</span>
                                            <span className="font-bold text-slate-900">120+</span>
                                        </div>
                                    </div>
                                    <div
                                        className="relative z-20 bg-slate-900 text-white rounded-2xl p-4 shadow-xl w-[85%] ml-auto transform -translate-y-4"
                                        style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Impact Metrics</span>
                                            <span className="text-green-400 font-bold text-sm">+24%</span>
                                        </div>
                                        <div className="text-xl font-black mb-0.5">UN SDG 4</div>
                                        <p className="text-xs text-slate-400">Quality Education Access</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation Keyframes */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
            `}</style>
        </section>
    );
};

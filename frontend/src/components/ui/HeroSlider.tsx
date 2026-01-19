'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Globe, GraduationCap, Building2, Briefcase, PlayCircle, Cpu } from 'lucide-react';

interface MainSlide {
    id: string;
    type: 'ekspedisi' | 't6-platform';
}

export const HeroSlider = () => {
    const [currentMainSlide, setCurrentMainSlide] = useState(0);
    const [currentSubSlide, setCurrentSubSlide] = useState(0);
    const [showEnglish, setShowEnglish] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const mainSlides: MainSlide[] = [
        { id: 'ekspedisi', type: 'ekspedisi' },
        { id: 't6-platform', type: 't6-platform' },
    ];

    // T6 Platform sub-slides (for slide 2)
    const t6SubSlides = [
        {
            target: "THE PLATFORM",
            icon: Globe,
            title: "Where Industry, Academia, and Government Converge.",
            description: "TSEA-X is the world's first Hexahelix learning ecosystem. Co-created by Tsinghua University & United in Diversity.",
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

    // Title toggle animation (matches ekspedisi - every 4 seconds)
    useEffect(() => {
        if (!mounted || currentMainSlide !== 0) return;
        const timer = setInterval(() => {
            setShowEnglish(prev => !prev);
        }, 4000);
        return () => clearInterval(timer);
    }, [mounted, currentMainSlide]);

    // Auto-rotate main slides
    useEffect(() => {
        if (!mounted) return;
        const timer = setInterval(() => {
            setCurrentMainSlide((prev) => (prev + 1) % mainSlides.length);
        }, 12000);
        return () => clearInterval(timer);
    }, [mounted, mainSlides.length]);

    // Auto-rotate sub-slides when on T6 platform
    useEffect(() => {
        if (!mounted || currentMainSlide !== 1) return;
        const timer = setInterval(() => {
            setCurrentSubSlide((prev) => (prev + 1) % t6SubSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [mounted, currentMainSlide, t6SubSlides.length]);

    const nextMainSlide = useCallback(() => {
        setCurrentMainSlide((prev) => (prev + 1) % mainSlides.length);
    }, [mainSlides.length]);

    const prevMainSlide = useCallback(() => {
        setCurrentMainSlide((prev) => (prev - 1 + mainSlides.length) % mainSlides.length);
    }, [mainSlides.length]);

    const currentT6Data = t6SubSlides[currentSubSlide];

    return (
        <section className="relative overflow-hidden w-full max-w-[100vw] bg-[#0f172a]">
            {/* Main Slide Navigation Arrows - Hidden on Mobile for cleaner look? Keeping for now but adjusting pos */}
            <button
                onClick={prevMainSlide}
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg group hidden md:block"
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
                onClick={nextMainSlide}
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg group hidden md:block"
                aria-label="Next slide"
            >
                <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Main Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
                {mainSlides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentMainSlide(idx)}
                        className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${idx === currentMainSlide
                            ? 'w-6 md:w-8 bg-white'
                            : 'w-1.5 md:w-2 bg-white/40 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* ============================================ */}
            {/* Slide 1: Ekspedisi AI Nusantara             */}
            {/* ============================================ */}
            <div
                className={`transition-all duration-700 ease-out ${currentMainSlide === 0
                    ? 'opacity-100 translate-x-0 relative'
                    : 'opacity-0 absolute inset-0 translate-x-[-100%] pointer-events-none'
                    }`}
            >
                <section
                    className="relative flex items-center text-white overflow-hidden min-h-[calc(100vh-64px)] py-12 md:py-0"
                    style={{
                        backgroundColor: '#0f172a',
                        backgroundImage: `
                            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
                            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
                            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)
                        `,
                        fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif'
                    }}
                >
                    {/* Indonesia Map Background - Strictly contained */}
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center overflow-hidden">
                        <img
                            src="https://ekspedisi.tsea.asia/id.png"
                            alt="Peta Indonesia"
                            className="w-[150%] max-w-none md:w-full md:max-w-6xl object-contain invert px-4"
                        />
                    </div>

                    {/* Animated Floating Orbs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <div
                            className="absolute top-10 left-10 w-40 md:w-64 h-40 md:h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                            style={{ animation: 'float 6s ease-in-out infinite' }}
                        />
                        <div
                            className="absolute top-20 right-10 w-40 md:w-64 h-40 md:h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                            style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}
                        />
                    </div>

                    <div className="max-w-[70rem] mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
                        {/* Left Content */}
                        <div className="space-y-6 md:space-y-8 text-center lg:text-left mt-8 lg:mt-0">
                            {/* Badge */}
                            <div className="flex justify-center lg:justify-start">
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium"
                                    style={{ color: '#f59e0b' }}
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                    Tsinghua SEA & UID Initiative
                                </div>
                            </div>

                            {/* Animated Title */}
                            <div className="h-32 sm:h-36 relative">
                                {/* English Title */}
                                <h1
                                    className={`absolute inset-0 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight transition-all duration-700 ease-in-out ${showEnglish
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-4 pointer-events-none'
                                        }`}
                                >
                                    Grounding the <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                        AI Cloud
                                    </span>
                                </h1>

                                {/* Indonesian Title */}
                                <h1
                                    className={`absolute inset-0 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight transition-all duration-700 ease-in-out ${!showEnglish
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-4 pointer-events-none'
                                        }`}
                                >
                                    Membumikan <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
                                        Kecerdasan Awan
                                    </span>
                                </h1>
                            </div>

                            {/* Description */}
                            <p className="text-lg text-slate-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                Transforming abstract digital potential into real-world solutions.
                                38 Provinces. 12 Months. <br className="hidden md:block" />
                                <span className="text-cyan-400 font-semibold block mt-1">National Survivability & Sovereignty.</span>
                            </p>

                            {/* CTA Button - Full width on mobile */}
                            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <a
                                    href="https://ekspedisi.tsea.asia"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto text-center bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-slate-200 flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                                >
                                    Join the Initiative
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </a>
                                <Link
                                    href="/hexahelix"
                                    className="w-full sm:w-auto text-center px-8 py-4 rounded-xl font-bold text-lg text-white border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>

                        {/* Right Content - Stats Card (Hidden on very small screens if needed, but keeping for now) */}
                        <div className="relative hidden lg:block">
                            <div
                                className="relative z-10 p-6 rounded-2xl border-t border-l border-white/20 shadow-2xl"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    animation: 'float 6s ease-in-out infinite'
                                }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f59e0b' }}>Target 2027</p>
                                        <h3 className="text-xl font-bold">Peta Potensi AI Nusantara</h3>
                                    </div>
                                    <Cpu className="text-cyan-400 w-6 h-6" />
                                </div>

                                {/* Map Preview Area */}
                                <div className="h-36 bg-slate-800/50 rounded-lg mb-4 relative overflow-hidden border border-white/5 flex items-center justify-center group">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-60">
                                        <div className="w-full h-full relative">
                                            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                                            <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                                            <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[10px] text-cyan-300 font-mono bg-black/40 p-2 rounded">
                                        <span>Processing Node: KALIMANTAN-04</span>
                                        <span><span className="text-green-400">●</span> Live</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <p className="text-xs font-bold uppercase mb-1" style={{ color: '#f59e0b' }}>Impact Goal</p>
                                        <p className="text-lg font-bold text-white leading-tight">100,000</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">IRIS Certified AI Practitioners</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <p className="text-xs font-bold uppercase mb-1" style={{ color: '#f59e0b' }}>Coverage</p>
                                        <p className="text-lg font-bold text-white leading-tight">38 Provinces</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Synchronized Relay</p>
                                    </div>
                                </div>
                            </div>

                            {/* Glow Effect */}
                            <div className="absolute -z-10 top-10 -right-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl" />
                        </div>
                    </div>
                </section>
            </div>

            {/* ============================================ */}
            {/* Slide 2: T6 Learning Platform               */}
            {/* ============================================ */}
            <div
                className={`transition-all duration-700 ease-out ${currentMainSlide === 1
                    ? 'opacity-100 translate-x-0 relative'
                    : 'opacity-0 absolute inset-0 translate-x-[100%] pointer-events-none'
                    }`}
            >
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
                                    <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] break-words">
                                        {currentT6Data.title}
                                    </h1>
                                    <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
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

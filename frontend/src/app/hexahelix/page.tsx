import React from 'react';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { Zap, Layers, Users, Globe, Hexagon, Briefcase } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function HexahelixPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Logo />
                        <nav className="hidden lg:flex items-center gap-8">
                            <NavItem label="Hexahelix Model" active href="/hexahelix" />
                            <NavItem label="Career Pathways" href="/pathways" />
                            <NavItem label="Enterprise" href="/enterprise" />
                            <NavItem label="Government" href="/government" />
                            <NavItem label="All Courses" href="/courses" />
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full text-xs font-bold text-accent shadow-sm tracking-wide mb-6">
                        <Hexagon size={14} fill="currentColor" />
                        THE TSEA-X FRAMEWORK
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-6">The Hexahelix Model</h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Innovation doesn't happen in silos. We unite the six critical sectors of society to solve complex systemic challenges.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: "Government", icon: Globe, color: "text-blue-600", desc: "Policy frameworks and regulatory innovation." },
                        { title: "Business", icon: Briefcase, color: "text-primary", desc: "Corporate strategy and economic drivers." },
                        { title: "Civil Society", icon: Users, color: "text-green-600", desc: "Community engagement and social impact." },
                        { title: "Academia", icon: Layers, color: "text-accent", desc: "Research, theory, and pedagogical rigor." },
                        { title: "Media", icon: Zap, color: "text-yellow-600", desc: "Communication and public discourse." },
                        { title: "Environment", icon: Hexagon, color: "text-teal-600", desc: "Ecological sustainability and planetary health." }
                    ].map((sector, i) => (
                        <div key={i} className="p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 ${sector.color}`}>
                                <sector.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{sector.title}</h3>
                            <p className="text-gray-600 font-medium">{sector.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Building2, ShieldCheck, Globe } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function GovernmentPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            <main>
                <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20" />
                    <div className="max-w-[70rem] mx-auto px-4 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-bold text-white mb-8">
                            <Building2 size={14} /> TRUSTED BY 15+ MINISTRIES
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-8">Public Sector Transformation</h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Equip civil servants with the digital skills, policy frameworks, and leadership capabilities needed for the 21st century.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all">
                                Partner with VOKASI
                            </button>
                            <button className="border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
                                View Case Studies
                            </button>
                        </div>
                    </div>
                </section>

                <section className="py-20 max-w-[70rem] mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="p-6">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Sovereign Identity</h3>
                            <p className="text-gray-600">Secure, blockchain-based credentialing for national talent databases.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Globe size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Cross-Border Mobility</h3>
                            <p className="text-gray-600">Standardized skills recognition across ASEAN and beyond.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Building2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Smart City Governance</h3>
                            <p className="text-gray-600">Training for the administrators of tomorrow's urban centers.</p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

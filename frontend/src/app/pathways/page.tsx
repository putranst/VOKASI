'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, Sparkles, TrendingUp, Clock, Award } from 'lucide-react';
import { CareerCard } from '@/components/CareerCard';
import { CareerModal } from '@/components/CareerModal';
import { CAREER_PATHWAYS, CAREER_CATEGORIES, CareerPathway } from '@/components/careerData';

export default function PathwaysPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCareer, setSelectedCareer] = useState<CareerPathway | null>(null);

    const filteredCareers = CAREER_PATHWAYS.filter(career => {
        const matchesCategory = selectedCategory === 'all' || career.category === getCategoryNameFromId(selectedCategory);
        const matchesSearch = searchTerm === '' ||
            career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            career.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
            career.keySkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero Section - Inspiring Copy */}
            <section className="relative bg-gradient-to-br from-primary via-purple-700 to-indigo-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

                <div className="relative max-w-[70rem] mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <Sparkles size={16} />
                            33 Career Pathways • Blockchain-Verified Credentials
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                            Your Future Starts Here.<br />Pick Your Path.
                        </h1>

                        <p className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed font-medium">
                            The world is changing faster than ever. Climate crisis demands action. AI is reshaping every industry. Remote work opened global opportunities.
                        </p>

                        <p className="text-2xl md:text-3xl font-bold mb-8 text-cyan-300">
                            But here's the truth: <span className="text-white underline decoration-4 decoration-cyan-400">the jobs of tomorrow already exist today</span>—and they're hungry for talent.
                        </p>

                        <p className="text-lg md:text-xl text-white/80 mb-12">
                            Whether you want to save the planet, build the future, or start earning immediately, <strong>T6 Career Pathways</strong> give you the exact roadmap from where you are to where you want to be.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <div className="text-3xl font-black text-cyan-300 mb-1">47%</div>
                                <div className="text-xs md:text-sm text-white/70 font-medium">Avg. Salary Increase</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <div className="text-3xl font-black text-cyan-300 mb-1">4.2mo</div>
                                <div className="text-xs md:text-sm text-white/70 font-medium">Time to Job Offer</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <div className="text-3xl font-black text-cyan-300 mb-1">89%</div>
                                <div className="text-xs md:text-sm text-white/70 font-medium">Remote-Friendly</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <div className="text-3xl font-black text-cyan-300 mb-1">450+</div>
                                <div className="text-xs md:text-sm text-white/70 font-medium">Hiring Companies</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white py-16 border-b border-gray-200">
                <div className="max-w-[70rem] mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-12">
                        How T6 Pathways Work
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">1</div>
                            <h3 className="font-bold text-gray-900 mb-2">Pick a Career</h3>
                            <p className="text-gray-600 text-sm">Browse 33 real jobs that excite you</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">2</div>
                            <h3 className="font-bold text-gray-900 mb-2">Follow the Pathway</h3>
                            <p className="text-gray-600 text-sm">See exactly which courses you need</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">3</div>
                            <h3 className="font-bold text-gray-900 mb-2">Build Real Projects</h3>
                            <p className="text-gray-600 text-sm">Use CDIO framework for hands-on learning</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">4</div>
                            <h3 className="font-bold text-gray-900 mb-2">Get Hired</h3>
                            <p className="text-gray-600 text-sm">Blockchain-verified credentials employers trust</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Careers Section */}
            <main className="max-w-[70rem] mx-auto px-4 py-16">
                {/* Search & Filter */}
                <div className="mb-12">
                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by job title, skills, or keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-3 rounded-full font-bold transition-all ${selectedCategory === 'all'
                                ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Careers ({CAREER_PATHWAYS.length})
                        </button>
                        {CAREER_CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-6 py-3 rounded-full font-bold transition-all ${selectedCategory === category.id
                                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category.icon} {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category-Specific Inspiring Headers */}
                {selectedCategory !== 'all' && (
                    <div className="text-center mb-12 max-w-3xl mx-auto">
                        {selectedCategory === 'sdg-esg' && (
                            <>
                                <h2 className="text-4xl font-black text-gray-900 mb-4">Turn Your Values Into a Career</h2>
                                <p className="text-xl text-gray-600">
                                    Companies are desperate for sustainability talent. ESG is no longer optional—it's boardroom priority #1. <strong>Make impact your job description.</strong>
                                </p>
                            </>
                        )}
                        {selectedCategory === 'future-tech' && (
                            <>
                                <h2 className="text-4xl font-black text-gray-900 mb-4">Build What Doesn't Exist Yet</h2>
                                <p className="text-xl text-gray-600">
                                    The gap between sci-fi and reality is closing. Quantum computing, AI ethics, metaverse design—<strong>these aren't future jobs, they're hiring now.</strong> Be the architect of tomorrow.
                                </p>
                            </>
                        )}
                        {selectedCategory === 'in-demand' && (
                            <>
                                <h2 className="text-4xl font-black text-gray-900 mb-4">High Pay, High Demand, Start Today</h2>
                                <p className="text-xl text-gray-600">
                                    Cloud architects earn $180K. Cybersecurity can't hire fast enough. Data scientists solve billion-dollar problems. <strong>These careers don't require decades—just the right skills.</strong>
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Results Count */}
                <div className="mb-6 text-center">
                    <p className="text-gray-600 font-medium">
                        Showing <span className="font-bold text-primary">{filteredCareers.length}</span> career{filteredCareers.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Career Grid */}
                {filteredCareers.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {filteredCareers.map((career) => (
                            <CareerCard
                                key={career.id}
                                career={career}
                                onClick={() => setSelectedCareer(career)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No careers found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                )}
            </main>

            {/* Modal */}
            {selectedCareer && (
                <CareerModal
                    career={selectedCareer}
                    onClose={() => setSelectedCareer(null)}
                />
            )}

            <Footer />
        </div>
    );
}

function getCategoryNameFromId(id: string): string {
    const category = CAREER_CATEGORIES.find(cat => cat.id === id);
    return category ? category.name : '';
}

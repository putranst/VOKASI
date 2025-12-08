'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { InstitutionCard } from '@/components/InstitutionCard';
import { Search, Filter, Globe, Building2, Briefcase, GraduationCap, Users } from 'lucide-react';

interface Institution {
    id: number;
    name: string;
    short_name: string;
    type: string;
    description: string;
    logo_url: string;
    country: string;
    total_courses: number;
    total_learners: string;
    is_featured: boolean;
}

export default function PartnersPage() {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCountry, setSelectedCountry] = useState('all');

    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/institutions`);
                if (response.ok) {
                    const data = await response.json();
                    setInstitutions(data);
                }
            } catch (error) {
                console.error('Failed to fetch institutions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstitutions();
    }, []);

    // Filter logic
    const filteredInstitutions = institutions.filter(inst => {
        const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inst.short_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || inst.type === selectedType;
        const matchesCountry = selectedCountry === 'all' || inst.country === selectedCountry;

        return matchesSearch && matchesType && matchesCountry;
    });

    // Get unique countries for filter
    const countries = Array.from(new Set(institutions.map(i => i.country))).sort();

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-slate-900 text-white pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        World-Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Partners</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        Learn from the best. We collaborate with leading universities and industry giants to bring you cutting-edge education.
                    </p>

                    {/* Stats Banner */}
                    <div className="inline-flex flex-wrap justify-center gap-8 md:gap-16 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-8 py-6">
                        <div className="text-center">
                            <div className="text-3xl font-black text-white mb-1">{institutions.length}+</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Global Partners</div>
                        </div>
                        <div className="w-px bg-white/10 hidden md:block" />
                        <div className="text-center">
                            <div className="text-3xl font-black text-white mb-1">
                                {institutions.reduce((acc, curr) => acc + curr.total_courses, 0)}+
                            </div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Courses Available</div>
                        </div>
                        <div className="w-px bg-white/10 hidden md:block" />
                        <div className="text-center">
                            <div className="text-3xl font-black text-white mb-1">2M+</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Learners</div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Filter size={18} />
                                Filters
                            </h3>

                            {/* Search */}
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search partners..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                />
                            </div>

                            {/* Type Filter */}
                            <div className="mb-6">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                                    Institution Type
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'all', label: 'All Types', icon: Globe },
                                        { id: 'university', label: 'Universities', icon: GraduationCap },
                                        { id: 'corporate', label: 'Corporate', icon: Building2 },
                                        { id: 'nonprofit', label: 'Non-Profit', icon: Users },
                                        { id: 'government', label: 'Government', icon: Briefcase },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedType === type.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <type.icon size={16} />
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Country Filter */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                                    Location
                                </label>
                                <select
                                    value={selectedCountry}
                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                >
                                    <option value="all">All Locations</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Showing {filteredInstitutions.length} Partners
                            </h2>
                            <div className="text-sm text-gray-500">
                                Sorted by Name
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredInstitutions.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredInstitutions.map((inst) => (
                                    <InstitutionCard key={inst.id} institution={inst} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No partners found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedType('all');
                                        setSelectedCountry('all');
                                    }}
                                    className="mt-4 text-primary font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

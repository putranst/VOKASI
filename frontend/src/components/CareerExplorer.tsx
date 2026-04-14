'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import { CAREER_PATHWAYS, CareerPathway } from './careerData';
import { CareerModal } from './CareerModal';

interface CareerExplorerProps {
    onSelectPathway: (pathwayId: string) => void;
    selectedPathwayId?: string | null;
}

// Get 3 featured careers (one from each category)
const getFeaturedCareers = (): CareerPathway[] => {
    const categories = ['SDGs & ESG', 'Future Tech', 'In-Demand Now'];
    return categories.map(cat => {
        const careerInCategory = CAREER_PATHWAYS.find(c => c.category === cat);
        return careerInCategory || CAREER_PATHWAYS[0];
    }).filter(Boolean);
};

export const CareerExplorer: React.FC<CareerExplorerProps> = ({ onSelectPathway, selectedPathwayId }) => {
    const [selectedCareer, setSelectedCareer] = useState<CareerPathway | null>(null);
    const [showModal, setShowModal] = useState(false);

    const featuredCareers = getFeaturedCareers();

    const handleCareerClick = (career: CareerPathway) => {
        setSelectedCareer(career);
        setShowModal(true);
    };

    const handleSelectPathway = () => {
        if (selectedCareer) {
            onSelectPathway(selectedCareer.id);
            setShowModal(false);
        }
    };

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'SDGs & ESG':
                return 'from-green-500 to-emerald-600';
            case 'Future Tech':
                return 'from-purple-500 to-indigo-600';
            case 'In-Demand Now':
                return 'from-blue-500 to-cyan-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Explore careers</h3>
                <Link
                    href="/pathways"
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                    View all <ArrowRight size={14} />
                </Link>
            </div>

            {/* Career Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCareers.map((career) => (
                    <div
                        key={career.id}
                        onClick={() => handleCareerClick(career)}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
                    >
                        {/* Career Image/Icon Section */}
                        <div className={`h-32 bg-gradient-to-br ${getCategoryColor(career.category)} relative flex items-center justify-center`}>
                            <span className="text-6xl opacity-90">{career.icon}</span>
                            <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                                {career.category}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                {career.title}
                            </h4>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                {career.shortDescription}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <DollarSign size={14} className="text-green-500" />
                                    <span className="font-semibold text-gray-900">{career.salary.split(' - ')[0]}</span>
                                    <span className="text-gray-400">median salary</span>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-sm">
                                <TrendingUp size={14} className="text-blue-500" />
                                <span className="font-semibold text-blue-600">{career.growth}</span>
                                <span className="text-gray-400">job growth</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Career Modal */}
            {showModal && selectedCareer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`bg-gradient-to-r ${getCategoryColor(selectedCareer.category)} p-8 text-white relative`}>
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
                            >
                                ✕
                            </button>
                            <div className="text-5xl mb-4">{selectedCareer.icon}</div>
                            <h2 className="text-2xl font-bold mb-2">{selectedCareer.title}</h2>
                            <p className="text-white/90">{selectedCareer.shortDescription}</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">About this career</h3>
                                <p className="text-gray-600">{selectedCareer.fullDescription}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="text-sm text-gray-500 mb-1">Salary Range</div>
                                    <div className="font-bold text-green-700">{selectedCareer.salary}</div>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="text-sm text-gray-500 mb-1">Job Growth</div>
                                    <div className="font-bold text-blue-700">{selectedCareer.growth}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Key Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCareer.keySkills.map((skill, idx) => (
                                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Required Courses</h3>
                                <ul className="space-y-2">
                                    {selectedCareer.requiredCourses.map((course, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-gray-600">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            {course}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleSelectPathway}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    Set as My Goal
                                </button>
                                <Link
                                    href="/pathways"
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-center hover:bg-gray-200 transition-all"
                                    onClick={() => setShowModal(false)}
                                >
                                    Explore More
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerExplorer;

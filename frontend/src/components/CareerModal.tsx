'use client';

import React from 'react';
import { X, TrendingUp, Clock, Award, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { CareerPathway } from './careerData';

interface CareerModalProps {
    career: CareerPathway;
    onClose: () => void;
}

export const CareerModal: React.FC<CareerModalProps> = ({ career, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`bg-gradient-to-r ${getCategoryColor(career.category)} p-8 text-white relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                    >
                        <X size={28} />
                    </button>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="text-6xl">{career.icon}</div>
                        <div className="flex-1">
                            <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                                {career.category}
                            </div>
                            <h2 className="text-3xl font-black mb-2">{career.title}</h2>
                            <p className="text-white/90 text-lg">{career.shortDescription}</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                                <TrendingUp size={16} />
                                Salary Range
                            </div>
                            <div className="text-2xl font-bold">{career.salary}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                                <Sparkles size={16} />
                                Growth
                            </div>
                            <div className="text-2xl font-bold">{career.growth}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                                <Clock size={16} />
                                Time to Master
                            </div>
                            <div className="text-2xl font-bold">{career.timeToMastery}</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Full Description */}
                    <section className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">What You'll Do</h3>
                        <p className="text-gray-700 text-lg leading-relaxed">{career.fullDescription}</p>
                    </section>

                    {/* Key Skills */}
                    <section className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Skills You'll Master</h3>
                        <div className="flex flex-wrap gap-3">
                            {career.keySkills.map((skill, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 px-4 py-2 rounded-full text-gray-800 font-semibold"
                                >
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Required Courses */}
                    <section className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="text-primary" size={28} />
                            Your Learning Path
                        </h3>
                        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/20">
                            <h4 className="font-bold text-gray-900 mb-3">Required Courses:</h4>
                            <ul className="space-y-2 mb-4">
                                {career.requiredCourses.map((course, index) => (
                                    <li key={index} className="flex items-center gap-2 text-gray-800">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="font-medium">{course}</span>
                                    </li>
                                ))}
                            </ul>
                            {career.optionalCourses.length > 0 && (
                                <>
                                    <h4 className="font-bold text-gray-900 mb-3 mt-4">Recommended for Specialization:</h4>
                                    <ul className="space-y-2">
                                        {career.optionalCourses.map((course, index) => (
                                            <li key={index} className="flex items-center gap-2 text-gray-700">
                                                <div className="w-2 h-2 bg-accent rounded-full"></div>
                                                <span>{course}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Career Progression */}
                    <section className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Award className="text-accent" size={28} />
                            Your Career Journey
                        </h3>
                        <div className="relative">
                            {career.careerProgression.map((stage, index) => (
                                <div key={index} className="flex items-center gap-4 mb-4 last:mb-0">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-green-500' :
                                            index === career.careerProgression.length - 1 ? 'bg-purple-600' :
                                                'bg-blue-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="font-bold text-gray-900">{stage}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA Button */}
                    <div className="flex gap-4">
                        <button className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            Start This Pathway
                            <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-primary hover:text-primary transition-colors"
                        >
                            Keep Exploring
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

function getCategoryColor(category: string): string {
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
}

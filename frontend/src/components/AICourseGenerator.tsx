import React, { useState } from 'react';
import { Sparkles, Loader2, BookOpen, CheckCircle } from 'lucide-react';

interface AICourseGeneratorProps {
    onCourseGenerated: (courseData: any) => void;
}

export function AICourseGenerator({ onCourseGenerated }: AICourseGeneratorProps) {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setIsGenerating(true);
        setError('');

        try {
            // Simulate AI generation delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Mock response for demo
            const mockCourse = {
                title: `Mastering ${topic}`,
                description: `A comprehensive guide to understanding and applying ${topic} in real-world scenarios.`,
                level: 'Intermediate',
                duration: '4 weeks',
                tag: topic,
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
                modules: [
                    { title: 'Introduction', content: 'Basics and fundamentals.' },
                    { title: 'Advanced Concepts', content: 'Deep dive into complex topics.' },
                    { title: 'Practical Application', content: 'Hands-on projects.' }
                ]
            };

            onCourseGenerated(mockCourse);
        } catch (err) {
            setError('Failed to generate course. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">What do you want to teach?</h2>
                    <p className="text-gray-500">Enter a topic and let AI structure your course</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Topic
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Sustainable Urban Farming, Intro to Python..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!topic.trim() || isGenerating}
                        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${!topic.trim() || isGenerating
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-200 transform hover:-translate-y-0.5'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Generating Course Structure...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Course
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

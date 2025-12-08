'use client';

import React, { useState } from 'react';
import { Image, BookOpen, User, Building2, Tag, TrendingUp } from 'lucide-react';

interface CourseFormData {
    title: string;
    instructor: string;
    org: string;
    image: string;
    tag: string;
    level: string;
    description: string;
    duration: string;
    institution_id: string;
}

interface CourseCreationFormProps {
    onSubmit: (data: CourseFormData) => Promise<void>;
    onCancel?: () => void;
}

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Executive'];
const TAG_OPTIONS = ['New', 'Trending', 'Popular', 'Bestseller', 'Updated'];

export const CourseCreationForm: React.FC<CourseCreationFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CourseFormData>({
        title: '',
        instructor: '',
        org: '',
        image: '',
        tag: 'New',
        level: 'Beginner',
        description: '',
        duration: '',
        institution_id: ''
    });

    const [errors, setErrors] = useState<Partial<CourseFormData>>({});
    const [loading, setLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors: Partial<CourseFormData> = {};

        if (!formData.title || formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }
        if (!formData.instructor || formData.instructor.length < 2) {
            newErrors.instructor = 'Instructor name must be at least 2 characters';
        }
        if (!formData.org || formData.org.length < 2) {
            newErrors.org = 'Organization name must be at least 2 characters';
        }
        if (!formData.image) {
            newErrors.image = 'Course image URL is required';
        }
        if (!formData.level) {
            newErrors.level = 'Please select a difficulty level';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Failed to create course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof CourseFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            {/* Basic Information Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="text-primary" size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Basic Information</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Course Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.title ? 'border-red-500' : 'border-gray-200'
                                }`}
                            placeholder="e.g., Introduction to Machine Learning"
                        />
                        {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Provide a brief overview of the course..."
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Difficulty Level *
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.level}
                                    onChange={(e) => handleChange('level', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white ${errors.level ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                >
                                    {LEVEL_OPTIONS.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                                <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                            {errors.level && <p className="mt-2 text-sm text-red-600">{errors.level}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Duration
                            </label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => handleChange('duration', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g., 4 weeks"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructor & Organization Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="text-purple-600" size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Instructor & Organization</h2>
                </div>

                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Instructor Name *
                            </label>
                            <input
                                type="text"
                                value={formData.instructor}
                                onChange={(e) => handleChange('instructor', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.instructor ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="e.g., Dr. Jane Smith"
                            />
                            {errors.instructor && <p className="mt-2 text-sm text-red-600">{errors.instructor}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Organization *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.org}
                                    onChange={(e) => handleChange('org', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.org ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    placeholder="e.g., MIT, Harvard"
                                />
                                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                            {errors.org && <p className="mt-2 text-sm text-red-600">{errors.org}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Tag
                        </label>
                        <div className="relative">
                            <select
                                value={formData.tag}
                                onChange={(e) => handleChange('tag', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white"
                            >
                                {TAG_OPTIONS.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Media Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Image className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Course Media</h2>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Course Image URL *
                    </label>
                    <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.image ? 'border-red-500' : 'border-gray-200'
                            }`}
                        placeholder="https://images.unsplash.com/..."
                    />
                    {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
                    <p className="mt-2 text-sm text-gray-500">
                        Provide a URL to an image for the course. We recommend using Unsplash.
                    </p>

                    {formData.image && (
                        <div className="mt-4">
                            <p className="text-sm font-bold text-gray-700 mb-2">Preview:</p>
                            <img
                                src={formData.image}
                                alt="Course preview"
                                className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating...
                        </>
                    ) : (
                        'Create Course'
                    )}
                </button>
            </div>
        </form>
    );
};

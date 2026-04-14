'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Upload, ChevronDown, Edit3, Check, X } from 'lucide-react';

interface GeneratedCourse {
    title: string;
    description: string;
    level: string;
    duration: string;
    tag: string;
    image: string;
    category?: string;
    modules?: Array<{ title: string; content: string }>;
    capstone_project?: string;
}

interface AICourseGeneratorProps {
    onCourseGenerated: (courseData: GeneratedCourse) => void;
}

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Executive'];

export function AICourseGenerator({ onCourseGenerated }: AICourseGeneratorProps) {
    const [topic, setTopic] = useState('');
    const [targetAudience, setTargetAudience] = useState('Intermediate');
    const [files, setFiles] = useState<File[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    // Preview state
    const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCourse, setEditedCourse] = useState<GeneratedCourse | null>(null);
    const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setIsGenerating(true);
        setError('');
        setGeneratedCourse(null);

        try {
            const formData = new FormData();
            formData.append('topic', topic);
            formData.append('target_audience', targetAudience);

            // Append uploaded files if any
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/generate`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Create course object from AI response
            const course: GeneratedCourse = {
                title: data.title || `Course on ${topic}`,
                description: data.description || '',
                level: targetAudience,
                duration: data.duration || '4 weeks',
                tag: 'New',
                image: data.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
                category: data.category || topic,
                modules: data.modules || [],
                capstone_project: data.capstone_project || ''
            };

            setGeneratedCourse(course);
            setEditedCourse(course);
        } catch (err) {
            console.error('AI generation failed:', err);
            setError('Failed to generate course. Please check your connection and try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConfirm = () => {
        if (editedCourse) {
            onCourseGenerated(editedCourse);
        }
    };

    const handleReset = () => {
        setGeneratedCourse(null);
        setEditedCourse(null);
        setIsEditing(false);
    };

    // Show preview if we have a generated course
    if (generatedCourse && editedCourse) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sparkles size={24} />
                                <h2 className="text-xl font-bold">AI Generated Course Preview</h2>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            >
                                <Edit3 size={16} />
                                {isEditing ? 'Done Editing' : 'Edit'}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Course Image Preview */}
                        <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100">
                            <img
                                src={editedCourse.image}
                                alt={editedCourse.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
                                }}
                            />
                            <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                AI Generated
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedCourse.title}
                                    onChange={(e) => setEditedCourse({ ...editedCourse, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                />
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">{editedCourse.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            {isEditing ? (
                                <textarea
                                    value={editedCourse.description}
                                    onChange={(e) => setEditedCourse({ ...editedCourse, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                />
                            ) : (
                                <p className="text-gray-600 leading-relaxed">{editedCourse.description}</p>
                            )}
                        </div>

                        {/* Meta Info */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-500">Level</p>
                                <p className="font-bold text-gray-900">{editedCourse.level}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-500">Duration</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedCourse.duration}
                                        onChange={(e) => setEditedCourse({ ...editedCourse, duration: e.target.value })}
                                        className="w-full text-center font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                                    />
                                ) : (
                                    <p className="font-bold text-gray-900">{editedCourse.duration}</p>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="font-bold text-gray-900">{editedCourse.category}</p>
                            </div>
                        </div>

                        {/* Modules Preview - Expandable */}
                        {editedCourse.modules && editedCourse.modules.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Course Modules</label>
                                <div className="space-y-2">
                                    {editedCourse.modules.map((module, idx) => {
                                        const isExpanded = expandedModules[idx] || false;
                                        return (
                                            <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                                <button
                                                    onClick={() => setExpandedModules(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={module.title}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => {
                                                                    const updatedModules = [...(editedCourse.modules || [])];
                                                                    updatedModules[idx] = { ...module, title: e.target.value };
                                                                    setEditedCourse({ ...editedCourse, modules: updatedModules });
                                                                }}
                                                                className="w-full font-semibold text-gray-900 bg-white border border-gray-200 rounded px-2 py-1"
                                                            />
                                                        ) : (
                                                            <p className="font-semibold text-gray-900">{module.title}</p>
                                                        )}
                                                    </div>
                                                    <ChevronDown
                                                        size={18}
                                                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </button>

                                                {/* Expanded Content */}
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                                                        <div className="ml-11">
                                                            {isEditing ? (
                                                                <textarea
                                                                    value={module.content}
                                                                    onChange={(e) => {
                                                                        const updatedModules = [...(editedCourse.modules || [])];
                                                                        updatedModules[idx] = { ...module, content: e.target.value };
                                                                        setEditedCourse({ ...editedCourse, modules: updatedModules });
                                                                    }}
                                                                    rows={4}
                                                                    className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded-lg p-3 mt-2 resize-none"
                                                                    placeholder="Module content and learning materials..."
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                                    {module.content || 'Click "Edit" to add content for this module.'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Capstone Project */}
                        {editedCourse.capstone_project && (
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                                <label className="block text-sm font-bold text-purple-700 mb-2">🎓 Capstone Project</label>
                                <p className="text-gray-700">{editedCourse.capstone_project}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={18} />
                                Start Over
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Create Course
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">What do you want to teach?</h2>
                    <p className="text-gray-500">Enter a topic and let AI structure your IRIS-based course</p>
                </div>

                <div className="space-y-6">
                    {/* Topic Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Topic *
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., AI Agents for Small Business, Sustainable Urban Farming..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                        />
                    </div>

                    {/* Target Audience Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Audience
                        </label>
                        <div className="relative">
                            <select
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none appearance-none bg-white"
                            >
                                {LEVEL_OPTIONS.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    {/* File Upload (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Materials (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                id="material-upload"
                                accept=".txt,.pdf,.doc,.docx,.md"
                            />
                            <label
                                htmlFor="material-upload"
                                className="flex flex-col items-center gap-2 cursor-pointer"
                            >
                                <Upload className="text-gray-400" size={24} />
                                <span className="text-sm text-gray-500">
                                    Click to upload lecture notes, syllabi, or reference materials
                                </span>
                                <span className="text-xs text-gray-400">
                                    Supports TXT, PDF, DOC, DOCX, MD
                                </span>
                            </label>
                        </div>

                        {/* Show uploaded files */}
                        {files.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                                        <span className="text-sm text-purple-700 truncate">{file.name}</span>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="text-purple-400 hover:text-purple-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
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
                                Generating IRIS Course Structure...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Course with AI
                            </>
                        )}
                    </button>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 border border-blue-100">
                        <p className="font-medium mb-1">💡 How it works</p>
                        <p>Our AI will analyze your topic and create a complete IRIS-structured course with phases covering Immersion, Reflection, Iteration, and Scale.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

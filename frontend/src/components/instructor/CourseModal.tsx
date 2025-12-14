import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Link, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

export interface CourseFormData {
    id?: number;
    title: string;
    description: string;
    level: string;
    category: string;
    image: string;
    duration?: string;
}

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (course: CourseFormData) => void;
    initialData?: CourseFormData | null;
    isEditing: boolean;
}

export const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, onSubmit, initialData, isEditing }) => {
    const [formData, setFormData] = useState<CourseFormData>({
        title: '',
        description: '',
        level: 'Beginner',
        category: '',
        image: '',
        duration: ''
    });

    // Image handling state
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [aiTopic, setAiTopic] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                description: initialData.description || '',
                duration: initialData.duration || ''
            });
            setImagePreview(initialData.image || '');
        } else {
            setFormData({
                title: '',
                description: '',
                level: 'Beginner',
                category: '',
                image: '',
                duration: ''
            });
            setImagePreview('');
        }
        setImageMode('url');
        setShowAIPanel(false);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                setFormData({ ...formData, image: base64 });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiTopic.trim()) return;

        setIsGenerating(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    topic: aiTopic,
                    target_audience: formData.level || 'Beginner'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setFormData({
                    ...formData,
                    title: data.title || `Course on ${aiTopic}`,
                    description: data.description || '',
                    category: data.category || aiTopic,
                    duration: data.duration || '4 weeks',
                    image: data.image || formData.image
                });
                if (data.image) {
                    setImagePreview(data.image);
                }
                setShowAIPanel(false);
            }
        } catch (error) {
            console.error('AI generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Course' : 'Create New Course'}</h2>
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={() => setShowAIPanel(!showAIPanel)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${showAIPanel ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                        >
                            <Sparkles size={16} />
                            AI Assist
                        </button>
                    )}
                </div>

                {/* AI Generation Panel */}
                {showAIPanel && (
                    <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 to-purple-100 rounded-xl border border-primary/20">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            AI Course Generator
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">Enter a topic and let AI generate course details for you.</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="e.g. Machine Learning, Sustainable Energy, Digital Marketing"
                                className="flex-1 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !aiTopic.trim()}
                                className="px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={16} />}
                                Generate
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. Advanced AI Systems"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                            placeholder="Briefly describe what students will learn..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Level</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Executive">Executive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="e.g. Technology"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
                        <input
                            type="text"
                            value={formData.duration || ''}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. 4 weeks"
                        />
                    </div>

                    {/* Enhanced Image Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">Course Image</label>
                            <div className="flex bg-gray-100 rounded-lg p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setImageMode('url')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${imageMode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    <Link size={12} />
                                    URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageMode('upload')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${imageMode === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    <Upload size={12} />
                                    Upload
                                </button>
                            </div>
                        </div>

                        {imageMode === 'url' ? (
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => {
                                    setFormData({ ...formData, image: e.target.value });
                                    setImagePreview(e.target.value);
                                }}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://example.com/image.jpg"
                                required
                            />
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">Click to upload image</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                            </div>
                        )}

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mt-3 relative">
                                <div className="h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={() => setImagePreview('')}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview('');
                                        setFormData({ ...formData, image: '' });
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            {isEditing ? 'Save Changes' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

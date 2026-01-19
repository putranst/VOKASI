'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, FileText, Sparkles, ChevronRight, ChevronLeft,
    Check, Loader2, X, Eye, Edit3, Wand2, BookOpen,
    Brain, Target, Clock, Users, Layers, Play, MessageSquare,
    HelpCircle, Lightbulb, CheckCircle2, Trash2, Image
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface ParsedContent {
    title: string;
    summary: string;
    main_topics: Array<{ name: string; description: string; subtopics: string[] }>;
    learning_objectives: string[];
    key_concepts: string[];
    suggested_structure: {
        immerse: { title: string; focus: string };
        realize: { title: string; focus: string };
        iterate: { title: string; focus: string };
        scale: { title: string; focus: string };
    };
    difficulty_level: string;
    estimated_duration: string;
    target_audience: string;
    prerequisites: string[];
}

interface TeachingAction {
    type: 'EXPLAIN' | 'DISCUSS' | 'PRACTICE' | 'QUIZ' | 'DEMO' | 'REFLECT' | 'COLLABORATE';
    title: string;
    content?: string;
    prompt?: string;
    instructions?: string;
    questions?: string[];
    duration_minutes: number;
}

interface Module {
    week: number;
    phase: string;
    title: string;
    learning_goals: string[];
    teaching_actions: TeachingAction[];
    assignments: string[];
    resources: string[];
}

interface TeachingAgenda {
    course_title: string;
    tagline: string;
    modules: Module[];
    capstone_project: {
        title: string;
        description: string;
        deliverables: string[];
        rubric_summary: string;
    };
    auto_generated_quizzes: Array<{
        module: number;
        questions: Array<{
            question: string;
            options: string[];
            correct: number;
            explanation: string;
        }>;
    }>;
}

interface UploadedFile {
    file: File;
    preview?: string;
    status: 'pending' | 'uploading' | 'parsed' | 'error';
    base64?: string;
}

interface SmartCourseWizardProps {
    onCourseCreated?: (courseData: any) => void;
    onCancel?: () => void;
}

const TEACHING_ACTION_ICONS: Record<string, React.ReactNode> = {
    EXPLAIN: <BookOpen size={16} />,
    DISCUSS: <MessageSquare size={16} />,
    PRACTICE: <Target size={16} />,
    QUIZ: <HelpCircle size={16} />,
    DEMO: <Play size={16} />,
    REFLECT: <Lightbulb size={16} />,
    COLLABORATE: <Users size={16} />
};

const TEACHING_ACTION_COLORS: Record<string, string> = {
    EXPLAIN: 'bg-blue-100 text-blue-700 border-blue-200',
    DISCUSS: 'bg-purple-100 text-purple-700 border-purple-200',
    PRACTICE: 'bg-green-100 text-green-700 border-green-200',
    QUIZ: 'bg-orange-100 text-orange-700 border-orange-200',
    DEMO: 'bg-pink-100 text-pink-700 border-pink-200',
    REFLECT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    COLLABORATE: 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

export function SmartCourseWizard({ onCourseCreated, onCancel }: SmartCourseWizardProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
    const [teachingAgenda, setTeachingAgenda] = useState<TeachingAgenda | null>(null);
    const [durationWeeks, setDurationWeeks] = useState(4);
    const [targetAudience, setTargetAudience] = useState('Intermediate');
    const [error, setError] = useState<string | null>(null);
    const [courseThumbnail, setCourseThumbnail] = useState<string>('');

    // Preset thumbnails based on common course topics
    const PRESET_THUMBNAILS = [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', // Education
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800', // Technology
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', // Business
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', // Team
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', // Design
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', // AI/Tech
    ];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // File handling
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(file => {
            const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain', 'text/markdown'];
            return validTypes.includes(file.type) || file.name.endsWith('.pptx') || file.name.endsWith('.md');
        });

        setFiles(prev => [
            ...prev,
            ...validFiles.map(file => ({
                file,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                status: 'pending' as const
            }))
        ]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Step 1: Upload & Parse
    const handleAnalyze = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setError(null);
        setProcessingStatus('Uploading files...');

        try {
            // Convert first file to base64 for parsing
            const file = files[0].file;
            const reader = new FileReader();

            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.readAsDataURL(file);
            });

            const base64 = await base64Promise;
            setProcessingStatus('Analyzing content with AI...');

            // Call parse endpoint
            const parseResponse = await fetch(`${BACKEND_URL}/api/v1/courses/smart-create/parse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_base64: base64,
                    file_name: file.name,
                    mime_type: file.type || 'application/pdf'
                })
            });

            if (!parseResponse.ok) throw new Error('Failed to parse materials');

            const parseResult = await parseResponse.json();

            if (parseResult.success && parseResult.data) {
                setParsedContent(parseResult.data);
                setStep(2);
            } else {
                throw new Error(parseResult.error || 'Failed to extract content');
            }
        } catch (err: any) {
            setError(err.message || 'Analysis failed');
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    // Step 2 -> 3: Generate Teaching Agenda
    const handleGenerateAgenda = async () => {
        if (!parsedContent) return;

        setIsProcessing(true);
        setError(null);
        setProcessingStatus('Generating teaching agenda...');

        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/courses/smart-create/agenda`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parsed_content: parsedContent,
                    target_audience: targetAudience,
                    duration_weeks: durationWeeks
                })
            });

            if (!response.ok) throw new Error('Failed to generate agenda');

            const result = await response.json();

            if (result.success && result.agenda) {
                setTeachingAgenda(result.agenda);
                setStep(3);
            } else {
                throw new Error(result.error || 'Failed to generate teaching agenda');
            }
        } catch (err: any) {
            setError(err.message || 'Generation failed');
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    // Step 4: Publish
    const handlePublish = async () => {
        if (!teachingAgenda || !parsedContent) return;

        setIsProcessing(true);
        setProcessingStatus('Creating course...');

        try {
            // Create the course with instructor details
            const courseData = {
                title: teachingAgenda.course_title,
                description: parsedContent.summary,
                level: parsedContent.difficulty_level || 'Intermediate',
                duration: parsedContent.estimated_duration || `${durationWeeks} weeks`,
                tag: 'AI Generated',
                image: courseThumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                category: 'Technology',
                instructor: user?.name || 'Instructor',
                org: 'TSEA',
                instructor_id: user?.id  // Link to logged-in instructor
            };

            const response = await fetch(`${BACKEND_URL}/api/v1/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });

            if (response.ok) {
                const createdCourse = await response.json();

                // Save teaching agenda as syllabus
                setProcessingStatus('Saving syllabus...');
                const syllabusData = {
                    title: `Syllabus: ${teachingAgenda.course_title}`,
                    overview: teachingAgenda.tagline,
                    learning_outcomes: parsedContent.learning_objectives || [],
                    assessment_strategy: {
                        quizzes: 20,
                        assignments: 30,
                        project: 30,
                        capstone: 20
                    },
                    resources: [],
                    sections: teachingAgenda.modules?.map((mod: any, idx: number) => ({
                        order: idx + 1,
                        title: mod.title,
                        cdio_phase: mod.phase || 'conceive',
                        week_number: mod.week || idx + 1,
                        topics: mod.learning_goals || [],
                        activities: mod.teaching_actions?.map((a: any) => a.title) || [],
                        assessment: 'Quiz',
                        duration_hours: mod.teaching_actions?.reduce((sum: number, a: any) => sum + (a.duration_minutes || 0), 0) / 60 || 2
                    })) || []
                };

                await fetch(`${BACKEND_URL}/api/v1/courses/${createdCourse.id}/syllabus`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(syllabusData)
                });

                onCourseCreated?.(createdCourse);
            } else {
                throw new Error('Failed to create course');
            }
        } catch (err: any) {
            setError(err.message || 'Publication failed');
        } finally {
            setIsProcessing(false);
        }
    };

    // Render steps
    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full mb-4">
                    <Sparkles className="text-purple-600" size={18} />
                    <span className="text-sm font-semibold text-purple-700">Alexandria AI</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Upload Your Materials</h2>
                <p className="text-gray-500">Drag & drop slides, PDFs, or images. AI will extract the structure.</p>
            </div>

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer
                         hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 group"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.pptx,.png,.jpg,.jpeg,.webp,.txt,.md"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center
                                  group-hover:scale-110 transition-transform duration-300">
                        <Upload className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-700">Drop files here or click to upload</p>
                        <p className="text-sm text-gray-400 mt-1">PDF, PPTX, Images (PNG, JPG), Markdown</p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700">Uploaded Files</h3>
                    {files.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            {f.preview ? (
                                <img src={f.preview} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FileText className="text-purple-600" size={24} />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="font-medium text-gray-800 truncate">{f.file.name}</p>
                                <p className="text-sm text-gray-400">{(f.file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button onClick={() => removeFile(idx)} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 size={18} className="text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={files.length === 0 || isProcessing}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl
                         hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-3 transition-all duration-300"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        {processingStatus}
                    </>
                ) : (
                    <>
                        <Wand2 size={20} />
                        Analyze with AI
                    </>
                )}
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Content Analysis</h2>
                <p className="text-gray-500">Review AI-extracted structure and customize</p>
            </div>

            {parsedContent && (
                <div className="space-y-6">
                    {/* Course Title */}
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl">
                        <h3 className="text-xl font-black text-gray-900">{parsedContent.title}</h3>
                        <p className="text-gray-600 mt-2">{parsedContent.summary}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                {parsedContent.difficulty_level}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {parsedContent.estimated_duration}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                {parsedContent.target_audience}
                            </span>
                        </div>
                    </div>

                    {/* Topics */}
                    <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Layers size={18} /> Main Topics
                        </h4>
                        <div className="grid gap-3">
                            {parsedContent.main_topics.map((topic, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                                    <p className="font-semibold text-gray-800">{topic.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {topic.subtopics.map((sub, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Learning Objectives */}
                    <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Target size={18} /> Learning Objectives
                        </h4>
                        <ul className="space-y-2">
                            {parsedContent.learning_objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-700">
                                    <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    {obj}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Configuration */}
                    <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={18} /> Course Configuration
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Duration (weeks)</label>
                                <select
                                    value={durationWeeks}
                                    onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                >
                                    {[2, 4, 6, 8, 12].map(w => (
                                        <option key={w} value={w}>{w} weeks</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Target Audience</label>
                                <select
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                >
                                    {['Beginner', 'Intermediate', 'Advanced', 'Executive'].map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerateAgenda}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl
                         hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-3 transition-all duration-300"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        {processingStatus}
                    </>
                ) : (
                    <>
                        <Sparkles size={20} />
                        Generate Teaching Agenda
                    </>
                )}
            </button>
        </div>
    );

    const renderStep3 = () => {
        // Editing handlers
        const updateModuleTitle = (moduleIdx: number, newTitle: string) => {
            if (!teachingAgenda) return;
            const updated = { ...teachingAgenda };
            updated.modules[moduleIdx].title = newTitle;
            setTeachingAgenda(updated);
        };

        const updateActionTitle = (moduleIdx: number, actionIdx: number, newTitle: string) => {
            if (!teachingAgenda) return;
            const updated = { ...teachingAgenda };
            updated.modules[moduleIdx].teaching_actions[actionIdx].title = newTitle;
            setTeachingAgenda(updated);
        };

        const updateActionDuration = (moduleIdx: number, actionIdx: number, duration: number) => {
            if (!teachingAgenda) return;
            const updated = { ...teachingAgenda };
            updated.modules[moduleIdx].teaching_actions[actionIdx].duration_minutes = duration;
            setTeachingAgenda(updated);
        };

        const deleteAction = (moduleIdx: number, actionIdx: number) => {
            if (!teachingAgenda) return;
            const updated = { ...teachingAgenda };
            updated.modules[moduleIdx].teaching_actions.splice(actionIdx, 1);
            setTeachingAgenda(updated);
        };

        const addAction = (moduleIdx: number, type: TeachingAction['type']) => {
            if (!teachingAgenda) return;
            const updated = { ...teachingAgenda };
            updated.modules[moduleIdx].teaching_actions.push({
                type,
                title: `New ${type.toLowerCase()} activity`,
                duration_minutes: 30
            });
            setTeachingAgenda(updated);
        };

        const updateCourseTitle = (newTitle: string) => {
            if (!teachingAgenda) return;
            setTeachingAgenda({ ...teachingAgenda, course_title: newTitle });
        };

        const updateTagline = (newTagline: string) => {
            if (!teachingAgenda) return;
            setTeachingAgenda({ ...teachingAgenda, tagline: newTagline });
        };

        return (
            <div className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Teaching Agenda</h2>
                    <p className="text-gray-500">Review and edit your Alexandria AI structured curriculum</p>
                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                        <Edit3 size={14} />
                        <span>Click any text to edit</span>
                    </div>
                </div>

                {teachingAgenda && (
                    <div className="space-y-6">
                        {/* Editable Course Header */}
                        <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl">
                            <input
                                type="text"
                                value={teachingAgenda.course_title}
                                onChange={(e) => updateCourseTitle(e.target.value)}
                                className="text-2xl font-black bg-transparent border-b border-white/30 w-full 
                                         focus:outline-none focus:border-white placeholder-white/50"
                                placeholder="Course Title"
                            />
                            <input
                                type="text"
                                value={teachingAgenda.tagline}
                                onChange={(e) => updateTagline(e.target.value)}
                                className="text-purple-100 mt-2 bg-transparent border-b border-white/20 w-full
                                         focus:outline-none focus:border-white/50 placeholder-white/30"
                                placeholder="Tagline"
                            />
                        </div>

                        {/* Editable Modules */}
                        <div className="space-y-4">
                            {teachingAgenda.modules.map((module, idx) => (
                                <div key={idx} className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                                ${module.phase === 'immerse' ? 'bg-blue-100 text-blue-700' :
                                                    module.phase === 'realize' ? 'bg-purple-100 text-purple-700' :
                                                        module.phase === 'iterate' ? 'bg-green-100 text-green-700' :
                                                            'bg-orange-100 text-orange-700'}`}>
                                                {module.phase}
                                            </span>
                                            <input
                                                type="text"
                                                value={module.title}
                                                onChange={(e) => updateModuleTitle(idx, e.target.value)}
                                                className="text-lg font-bold text-gray-800 mt-2 bg-transparent border-b border-transparent
                                                         hover:border-gray-300 focus:border-purple-500 focus:outline-none w-full transition-colors"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-400 ml-4">Week {module.week}</span>
                                    </div>

                                    {/* Editable Teaching Actions */}
                                    <div className="space-y-2">
                                        {module.teaching_actions.map((action, actionIdx) => (
                                            <div key={actionIdx}
                                                className={`flex items-center gap-3 p-3 rounded-xl border group ${TEACHING_ACTION_COLORS[action.type]}`}>
                                                {TEACHING_ACTION_ICONS[action.type]}
                                                <input
                                                    type="text"
                                                    value={action.title}
                                                    onChange={(e) => updateActionTitle(idx, actionIdx, e.target.value)}
                                                    className="flex-1 font-medium bg-transparent border-b border-transparent 
                                                             hover:border-current focus:border-current focus:outline-none"
                                                />
                                                <input
                                                    type="number"
                                                    value={action.duration_minutes}
                                                    onChange={(e) => updateActionDuration(idx, actionIdx, parseInt(e.target.value) || 0)}
                                                    className="w-12 text-xs text-center bg-white/50 rounded px-1 py-0.5"
                                                    min={5}
                                                    max={180}
                                                />
                                                <span className="text-xs opacity-70">min</span>
                                                <button
                                                    onClick={() => deleteAction(idx, actionIdx)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                                                    title="Remove action"
                                                >
                                                    <Trash2 size={14} className="text-red-500" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add Action Dropdown */}
                                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dashed border-gray-200">
                                            <span className="text-xs text-gray-400 mr-2">Add:</span>
                                            {(['EXPLAIN', 'DISCUSS', 'PRACTICE', 'QUIZ', 'DEMO', 'REFLECT', 'COLLABORATE'] as const).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => addAction(idx, type)}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 
                                                             rounded-lg transition-colors"
                                                    title={`Add ${type} activity`}
                                                >
                                                    {TEACHING_ACTION_ICONS[type]}
                                                    <span className="hidden sm:inline">{type}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Editable Capstone */}
                        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">🏆</span>
                                <input
                                    type="text"
                                    value={teachingAgenda.capstone_project.title}
                                    onChange={(e) => {
                                        const updated = { ...teachingAgenda };
                                        updated.capstone_project.title = e.target.value;
                                        setTeachingAgenda(updated);
                                    }}
                                    className="font-bold text-gray-800 bg-transparent border-b border-transparent 
                                             hover:border-amber-400 focus:border-amber-500 focus:outline-none flex-1"
                                />
                            </div>
                            <textarea
                                value={teachingAgenda.capstone_project.description}
                                onChange={(e) => {
                                    const updated = { ...teachingAgenda };
                                    updated.capstone_project.description = e.target.value;
                                    setTeachingAgenda(updated);
                                }}
                                className="w-full text-gray-600 text-sm bg-transparent border border-transparent 
                                         hover:border-amber-300 focus:border-amber-500 focus:outline-none rounded-lg p-2 resize-none"
                                rows={2}
                                placeholder="Describe the capstone project..."
                            />

                            {/* Deliverables */}
                            <div className="mt-3">
                                <span className="text-xs font-semibold text-amber-700 uppercase">Deliverables</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {teachingAgenda.capstone_project.deliverables?.map((d, i) => (
                                        <div key={i} className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-amber-200 group">
                                            <input
                                                type="text"
                                                value={d}
                                                onChange={(e) => {
                                                    const updated = { ...teachingAgenda };
                                                    updated.capstone_project.deliverables[i] = e.target.value;
                                                    setTeachingAgenda(updated);
                                                }}
                                                className="text-xs bg-transparent focus:outline-none w-auto"
                                                style={{ width: `${Math.max(d.length, 8)}ch` }}
                                            />
                                            <button
                                                onClick={() => {
                                                    const updated = { ...teachingAgenda };
                                                    updated.capstone_project.deliverables.splice(i, 1);
                                                    setTeachingAgenda(updated);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-amber-600 hover:text-red-500"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const updated = { ...teachingAgenda };
                                            if (!updated.capstone_project.deliverables) {
                                                updated.capstone_project.deliverables = [];
                                            }
                                            updated.capstone_project.deliverables.push('New deliverable');
                                            setTeachingAgenda(updated);
                                        }}
                                        className="px-3 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full"
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Publish Button */}
                <button
                    onClick={() => setStep(4)}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl
                             hover:from-purple-700 hover:to-blue-700 flex items-center justify-center gap-3"
                >
                    <Eye size={20} />
                    Preview & Publish
                </button>
            </div>
        );
    };

    const renderStep4 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <Check className="text-green-600" size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Ready to Publish!</h2>
                <p className="text-gray-500">Your AI-generated course is complete</p>
            </div>

            {teachingAgenda && parsedContent && (
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900">{teachingAgenda.course_title}</h3>
                    <p className="text-gray-600 mt-2">{parsedContent.summary}</p>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 bg-white rounded-xl">
                            <p className="text-2xl font-black text-purple-600">{teachingAgenda.modules.length}</p>
                            <p className="text-sm text-gray-500">Modules</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl">
                            <p className="text-2xl font-black text-blue-600">
                                {teachingAgenda.modules.reduce((acc, m) => acc + m.teaching_actions.length, 0)}
                            </p>
                            <p className="text-sm text-gray-500">Activities</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl">
                            <p className="text-2xl font-black text-green-600">{durationWeeks}</p>
                            <p className="text-sm text-gray-500">Weeks</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Thumbnail Selection */}
            <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <Image size={18} className="text-purple-600" />
                            Course Thumbnail
                        </h4>
                        <p className="text-sm text-gray-500">Select a cover image for your course</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {PRESET_THUMBNAILS.map((url, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCourseThumbnail(url)}
                            className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all
                                ${courseThumbnail === url
                                    ? 'border-purple-500 ring-2 ring-purple-200'
                                    : 'border-gray-200 hover:border-purple-300'}`}
                        >
                            <img
                                src={url}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {courseThumbnail === url && (
                                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                    <Check className="text-white" size={24} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Custom URL input */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="text-xs text-gray-500 mb-1 block">Or paste a custom image URL:</label>
                    <input
                        type="text"
                        value={courseThumbnail}
                        onChange={(e) => setCourseThumbnail(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                </div>
            </div>

            <button
                onClick={handlePublish}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl
                         hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-3 transition-all duration-300"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        {processingStatus}
                    </>
                ) : (
                    <>
                        <CheckCircle2 size={20} />
                        Publish Course
                    </>
                )}
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <React.Fragment key={s}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                            ${step >= s
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'bg-gray-200 text-gray-500'}`}>
                            {step > s ? <Check size={18} /> : s}
                        </div>
                        {s < 4 && (
                            <div className={`w-16 h-1 rounded-full transition-all
                                ${step > s ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'}`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-xs text-gray-500 mb-8 px-4">
                <span className={step >= 1 ? 'text-purple-600 font-semibold' : ''}>Upload</span>
                <span className={step >= 2 ? 'text-purple-600 font-semibold' : ''}>Analyze</span>
                <span className={step >= 3 ? 'text-purple-600 font-semibold' : ''}>Generate</span>
                <span className={step >= 4 ? 'text-purple-600 font-semibold' : ''}>Publish</span>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <X className="text-red-500" size={20} />
                    <span className="text-red-700">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded">
                        <X size={16} className="text-red-500" />
                    </button>
                </div>
            )}

            {/* Step Content */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>

            {/* Navigation */}
            {step > 1 && (
                <div className="flex justify-between mt-6">
                    <button
                        onClick={() => setStep(step - 1)}
                        className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft size={18} />
                        Back
                    </button>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default SmartCourseWizard;

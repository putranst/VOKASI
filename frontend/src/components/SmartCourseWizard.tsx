'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, FileText, Sparkles, ChevronRight, ChevronLeft, ChevronDown,
    Check, Loader2, X, Eye, Edit3, Wand2, BookOpen,
    Brain, Target, Clock, Users, Layers, Play, MessageSquare,
    HelpCircle, Lightbulb, CheckCircle2, Trash2, Image, Plus
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
    const [expandedActions, setExpandedActions] = useState<Record<string, boolean>>({});

    // Comprehensive thumbnail library organized by category/topic
    const THUMBNAIL_LIBRARY: Record<string, string[]> = {
        leadership: [
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', // Team meeting
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', // Leadership presentation
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', // Executive meeting
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800', // Strategy session
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800', // Team collaboration
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800', // Business meeting
        ],
        sustainability: [
            'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800', // Green leaves
            'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800', // Wind energy
            'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800', // Solar panels
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', // Nature
            'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800', // Ocean
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', // Forest
        ],
        technology: [
            'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800', // Code
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', // AI/Circuits
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', // Tech circuit
            'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', // Robot
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', // Data matrix
            'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800', // Programming
        ],
        business: [
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', // Business planning
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', // Analytics
            'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800', // Office
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', // Professional
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', // Corporate building
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', // Business team
        ],
        education: [
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', // Learning
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', // Classroom
            'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800', // Students
            'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', // Graduation
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800', // Books
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', // Campus
        ],
        mindfulness: [
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', // Meditation
            'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800', // Yoga
            'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=800', // Zen
            'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800', // Peaceful
            'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800', // Nature calm
            'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', // Wellness
        ],
        health: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', // Fitness
            'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800', // Healthy food
            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800', // Healthcare
            'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800', // Medical
            'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', // Workout
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', // Yoga pose
        ],
        finance: [
            'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800', // Trading
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800', // Finance charts
            'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800', // Money growth
            'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800', // Investment
            'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800', // Stock market
            'https://images.unsplash.com/photo-1565514020179-026b92b2d192?w=800', // Financial planning
        ],
        default: [
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', // General meeting
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', // Team collaboration
            'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', // Workshop
            'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', // Learning group
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', // Classroom
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800', // Study
        ]
    };

    // Function to detect category from parsed content
    const detectCategory = (): string => {
        if (!parsedContent && !teachingAgenda) return 'default';

        const text = [
            parsedContent?.title || '',
            parsedContent?.summary || '',
            teachingAgenda?.course_title || '',
            teachingAgenda?.tagline || '',
            ...(parsedContent?.key_concepts || []),
        ].join(' ').toLowerCase();

        // Category detection keywords
        if (/leadership|leader|manage|executive|conscious|ceo|director|governance/.test(text)) return 'leadership';
        if (/sustain|green|environment|carbon|climate|eco|renewable|energy/.test(text)) return 'sustainability';
        if (/mindful|meditation|wellness|conscious|awareness|mental|stress|balance/.test(text)) return 'mindfulness';
        if (/health|medical|fitness|nutrition|wellness|diet|exercise/.test(text)) return 'health';
        if (/finance|invest|trading|money|capital|banking|fintech|stock/.test(text)) return 'finance';
        if (/ai|machine learning|data|code|programming|software|tech|digital|cyber/.test(text)) return 'technology';
        if (/business|startup|entrepreneur|marketing|sales|strategy|mba/.test(text)) return 'business';
        if (/education|teach|learn|school|university|academic|student/.test(text)) return 'education';

        return 'default';
    };

    // Get thumbnails based on detected category
    const getContextualThumbnails = (): string[] => {
        const category = detectCategory();
        return THUMBNAIL_LIBRARY[category] || THUMBNAIL_LIBRARY.default;
    };

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

    const renderStep2 = () => {
        // Helper to update parsed content
        const updateParsedContent = (updates: Partial<ParsedContent>) => {
            if (!parsedContent) return;
            setParsedContent({ ...parsedContent, ...updates });
        };

        const updateTopic = (idx: number, field: 'name' | 'description', value: string) => {
            if (!parsedContent) return;
            const topics = [...parsedContent.main_topics];
            topics[idx] = { ...topics[idx], [field]: value };
            setParsedContent({ ...parsedContent, main_topics: topics });
        };

        const updateSubtopic = (topicIdx: number, subIdx: number, value: string) => {
            if (!parsedContent) return;
            const topics = [...parsedContent.main_topics];
            const subtopics = [...topics[topicIdx].subtopics];
            subtopics[subIdx] = value;
            topics[topicIdx] = { ...topics[topicIdx], subtopics };
            setParsedContent({ ...parsedContent, main_topics: topics });
        };

        const addSubtopic = (topicIdx: number) => {
            if (!parsedContent) return;
            const topics = [...parsedContent.main_topics];
            topics[topicIdx].subtopics.push('New subtopic');
            setParsedContent({ ...parsedContent, main_topics: topics });
        };

        const removeSubtopic = (topicIdx: number, subIdx: number) => {
            if (!parsedContent) return;
            const topics = [...parsedContent.main_topics];
            topics[topicIdx].subtopics.splice(subIdx, 1);
            setParsedContent({ ...parsedContent, main_topics: topics });
        };

        const addTopic = () => {
            if (!parsedContent) return;
            setParsedContent({
                ...parsedContent,
                main_topics: [...parsedContent.main_topics, { name: 'New Topic', description: 'Topic description...', subtopics: [] }]
            });
        };

        const removeTopic = (idx: number) => {
            if (!parsedContent) return;
            const topics = parsedContent.main_topics.filter((_, i) => i !== idx);
            setParsedContent({ ...parsedContent, main_topics: topics });
        };

        const updateObjective = (idx: number, value: string) => {
            if (!parsedContent) return;
            const objectives = [...parsedContent.learning_objectives];
            objectives[idx] = value;
            setParsedContent({ ...parsedContent, learning_objectives: objectives });
        };

        const addObjective = () => {
            if (!parsedContent) return;
            setParsedContent({
                ...parsedContent,
                learning_objectives: [...parsedContent.learning_objectives, 'New learning objective']
            });
        };

        const removeObjective = (idx: number) => {
            if (!parsedContent) return;
            const objectives = parsedContent.learning_objectives.filter((_, i) => i !== idx);
            setParsedContent({ ...parsedContent, learning_objectives: objectives });
        };

        return (
            <div className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Content Analysis</h2>
                    <p className="text-gray-500">Review and customize AI-extracted curriculum structure</p>
                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                        <Edit3 size={14} />
                        <span>All fields are editable</span>
                    </div>
                </div>

                {parsedContent && (
                    <div className="space-y-6">
                        {/* Editable Course Header */}
                        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Course Title</label>
                                <input
                                    type="text"
                                    value={parsedContent.title}
                                    onChange={(e) => updateParsedContent({ title: e.target.value })}
                                    className="w-full text-xl font-black text-gray-900 bg-transparent border-b-2 border-purple-200 
                                             focus:border-purple-500 focus:outline-none py-2 mt-1"
                                    placeholder="Course Title"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Course Description</label>
                                <textarea
                                    value={parsedContent.summary}
                                    onChange={(e) => updateParsedContent({ summary: e.target.value })}
                                    rows={3}
                                    className="w-full text-gray-600 bg-transparent border border-purple-200 rounded-lg
                                             focus:border-purple-500 focus:outline-none p-3 mt-1 resize-none"
                                    placeholder="Describe what students will learn..."
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex-1 min-w-[150px]">
                                    <label className="text-xs font-semibold text-gray-500">Difficulty</label>
                                    <select
                                        value={parsedContent.difficulty_level}
                                        onChange={(e) => updateParsedContent({ difficulty_level: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500"
                                    >
                                        {['Beginner', 'Intermediate', 'Advanced', 'Executive'].map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="text-xs font-semibold text-gray-500">Target Audience</label>
                                    <input
                                        type="text"
                                        value={parsedContent.target_audience}
                                        onChange={(e) => updateParsedContent({ target_audience: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-purple-500"
                                        placeholder="e.g., Professionals and students"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Editable Main Topics */}
                        <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Layers size={18} /> Main Topics & Modules
                                </h4>
                                <button
                                    onClick={addTopic}
                                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                    + Add Topic
                                </button>
                            </div>
                            <div className="space-y-4">
                                {parsedContent.main_topics.map((topic, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <label className="text-xs text-gray-400">Topic Name</label>
                                                    <input
                                                        type="text"
                                                        value={topic.name}
                                                        onChange={(e) => updateTopic(idx, 'name', e.target.value)}
                                                        className="w-full font-semibold text-gray-800 bg-transparent border-b border-transparent
                                                                 hover:border-gray-300 focus:border-purple-500 focus:outline-none py-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Description</label>
                                                    <textarea
                                                        value={topic.description}
                                                        onChange={(e) => updateTopic(idx, 'description', e.target.value)}
                                                        rows={2}
                                                        className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded-lg
                                                                 focus:border-purple-500 focus:outline-none p-2 resize-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Subtopics / Key Concepts</label>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {topic.subtopics.map((sub, i) => (
                                                            <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg group/sub">
                                                                <input
                                                                    type="text"
                                                                    value={sub}
                                                                    onChange={(e) => updateSubtopic(idx, i, e.target.value)}
                                                                    className="text-xs bg-transparent focus:outline-none w-auto min-w-[80px]"
                                                                    style={{ width: `${Math.max(sub.length * 7, 80)}px` }}
                                                                />
                                                                <button
                                                                    onClick={() => removeSubtopic(idx, i)}
                                                                    className="opacity-0 group-hover/sub:opacity-100 text-gray-400 hover:text-red-500"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => addSubtopic(idx)}
                                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"
                                                        >
                                                            + Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeTopic(idx)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Editable Learning Objectives */}
                        <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Target size={18} /> Learning Objectives
                                </h4>
                                <button
                                    onClick={addObjective}
                                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                >
                                    + Add Objective
                                </button>
                            </div>
                            <div className="space-y-2">
                                {parsedContent.learning_objectives.map((obj, idx) => (
                                    <div key={idx} className="flex items-start gap-2 group">
                                        <CheckCircle2 size={18} className="text-green-500 mt-2 flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={obj}
                                            onChange={(e) => updateObjective(idx, e.target.value)}
                                            className="flex-1 text-gray-700 bg-transparent border-b border-transparent
                                                     hover:border-gray-300 focus:border-green-500 focus:outline-none py-1"
                                        />
                                        <button
                                            onClick={() => removeObjective(idx)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Configuration */}
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
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Target Audience Level</label>
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
    };

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
            const defaultContent = {
                EXPLAIN: { content: 'Key concepts and explanations to cover...', prompt: '', instructions: '', questions: [] },
                DISCUSS: { content: '', prompt: 'Discussion question or topic to explore...', instructions: '', questions: [] },
                PRACTICE: { content: '', prompt: '', instructions: 'Step-by-step exercise instructions...', questions: [] },
                QUIZ: { content: '', prompt: '', instructions: '', questions: ['Question 1?', 'Question 2?'] },
                DEMO: { content: 'What will be demonstrated and key takeaways...', prompt: '', instructions: '', questions: [] },
                REFLECT: { content: '', prompt: 'Reflection prompt for students...', instructions: '', questions: [] },
                COLLABORATE: { content: '', prompt: '', instructions: 'Group activity instructions and expected outcomes...', questions: [] },
            };
            updated.modules[moduleIdx].teaching_actions.push({
                type,
                title: `New ${type.toLowerCase()} activity`,
                duration_minutes: 30,
                ...defaultContent[type]
            });
            setTeachingAgenda(updated);
        };

        const updateActionContent = (moduleIdx: number, actionIdx: number, field: 'content' | 'prompt' | 'instructions', value: string) => {
            if (!teachingAgenda) return;
            const updated = { ...teachingAgenda };
            updated.modules[moduleIdx].teaching_actions[actionIdx][field] = value;
            setTeachingAgenda(updated);
        };

        const updateActionQuestion = (moduleIdx: number, actionIdx: number, qIdx: number, value: string) => {
            if (!teachingAgenda) return;
            const updated = { ...teachingAgenda };
            const questions = [...(updated.modules[moduleIdx].teaching_actions[actionIdx].questions || [])];
            questions[qIdx] = value;
            updated.modules[moduleIdx].teaching_actions[actionIdx].questions = questions;
            setTeachingAgenda(updated);
        };

        const addQuestion = (moduleIdx: number, actionIdx: number) => {
            if (!teachingAgenda) return;
            const updated = { ...teachingAgenda };
            const questions = [...(updated.modules[moduleIdx].teaching_actions[actionIdx].questions || [])];
            questions.push('New question?');
            updated.modules[moduleIdx].teaching_actions[actionIdx].questions = questions;
            setTeachingAgenda(updated);
        };

        const removeQuestion = (moduleIdx: number, actionIdx: number, qIdx: number) => {
            if (!teachingAgenda) return;
            const updated = { ...teachingAgenda };
            const questions = [...(updated.modules[moduleIdx].teaching_actions[actionIdx].questions || [])];
            questions.splice(qIdx, 1);
            updated.modules[moduleIdx].teaching_actions[actionIdx].questions = questions;
            setTeachingAgenda(updated);
        };

        const toggleActionExpand = (moduleIdx: number, actionIdx: number) => {
            const key = `${moduleIdx}-${actionIdx}`;
            setExpandedActions(prev => ({ ...prev, [key]: !prev[key] }));
        };

        const isActionExpanded = (moduleIdx: number, actionIdx: number) => {
            return expandedActions[`${moduleIdx}-${actionIdx}`] || false;
        };

        // Helper to get placeholder text based on action type
        const getContentLabel = (type: TeachingAction['type']) => {
            switch (type) {
                case 'EXPLAIN': return { label: 'Explanation Content', placeholder: 'Key concepts, definitions, and explanations to deliver...' };
                case 'DISCUSS': return { label: 'Discussion Prompt', placeholder: 'Questions or topics for group discussion...' };
                case 'PRACTICE': return { label: 'Exercise Instructions', placeholder: 'Step-by-step hands-on activity instructions...' };
                case 'QUIZ': return { label: 'Quiz Questions', placeholder: '' };
                case 'DEMO': return { label: 'Demo Content', placeholder: 'What to demonstrate and key points to highlight...' };
                case 'REFLECT': return { label: 'Reflection Prompt', placeholder: 'Guiding questions for self-reflection...' };
                case 'COLLABORATE': return { label: 'Collaboration Instructions', placeholder: 'Group work guidelines and expected deliverables...' };
                default: return { label: 'Content', placeholder: 'Activity content...' };
            }
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

                                    {/* Editable Teaching Actions - Expandable */}
                                    <div className="space-y-3">
                                        {module.teaching_actions.map((action, actionIdx) => {
                                            const expanded = isActionExpanded(idx, actionIdx);
                                            const contentInfo = getContentLabel(action.type);

                                            return (
                                                <div key={actionIdx}
                                                    className={`rounded-xl border overflow-hidden ${TEACHING_ACTION_COLORS[action.type]}`}>
                                                    {/* Header - always visible */}
                                                    <div className="flex items-center gap-3 p-3 group">
                                                        <button
                                                            onClick={() => toggleActionExpand(idx, actionIdx)}
                                                            className="flex-shrink-0 p-1 hover:bg-white/30 rounded transition-colors"
                                                        >
                                                            <ChevronDown
                                                                size={16}
                                                                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                                                            />
                                                        </button>
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

                                                    {/* Expanded Content */}
                                                    {expanded && (
                                                        <div className="px-4 pb-4 pt-2 bg-white/50 border-t border-current/10">
                                                            {action.type === 'QUIZ' ? (
                                                                // Quiz-specific: editable questions list
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-semibold text-gray-600 uppercase">
                                                                        {contentInfo.label}
                                                                    </label>
                                                                    {(action.questions || []).map((q, qIdx) => (
                                                                        <div key={qIdx} className="flex items-start gap-2 group/q">
                                                                            <span className="text-xs text-gray-400 mt-2">Q{qIdx + 1}.</span>
                                                                            <input
                                                                                type="text"
                                                                                value={q}
                                                                                onChange={(e) => updateActionQuestion(idx, actionIdx, qIdx, e.target.value)}
                                                                                className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2
                                                                                         focus:border-purple-500 focus:outline-none"
                                                                            />
                                                                            <button
                                                                                onClick={() => removeQuestion(idx, actionIdx, qIdx)}
                                                                                className="opacity-0 group-hover/q:opacity-100 p-1 text-gray-400 hover:text-red-500"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    <button
                                                                        onClick={() => addQuestion(idx, actionIdx)}
                                                                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 mt-2"
                                                                    >
                                                                        <Plus size={14} /> Add Question
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                // Other types: single textarea
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-semibold text-gray-600 uppercase">
                                                                        {contentInfo.label}
                                                                    </label>
                                                                    <textarea
                                                                        value={action.content || action.prompt || action.instructions || ''}
                                                                        onChange={(e) => {
                                                                            const field = action.type === 'DISCUSS' || action.type === 'REFLECT'
                                                                                ? 'prompt'
                                                                                : action.type === 'PRACTICE' || action.type === 'COLLABORATE'
                                                                                    ? 'instructions'
                                                                                    : 'content';
                                                                            updateActionContent(idx, actionIdx, field, e.target.value);
                                                                        }}
                                                                        rows={4}
                                                                        className="w-full text-sm bg-white border border-gray-200 rounded-lg p-3
                                                                                 focus:border-purple-500 focus:outline-none resize-none"
                                                                        placeholder={contentInfo.placeholder}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

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
                    {getContextualThumbnails().map((url, idx) => (
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
        </div >
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

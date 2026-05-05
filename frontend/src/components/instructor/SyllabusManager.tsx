'use client';

import React, { useState, useEffect } from 'react';
import {
    BookOpen, Sparkles, Upload, Plus, Trash2, GripVertical,
    ChevronDown, ChevronUp, FileText, Loader2, Save, Eye, CheckCircle, AlertCircle,
    MessageSquare, Target, HelpCircle, Play, Lightbulb, Users, Clock, Layout
} from 'lucide-react';
import { CAPSTONE_TEMPLATES, CapstoneTemplate } from '@/data/capstoneTemplates';

// Teaching Action Types (matching SmartCourseWizard / MAIC)
type TeachingActionType = 'EXPLAIN' | 'DISCUSS' | 'PRACTICE' | 'QUIZ' | 'DEMO' | 'REFLECT' | 'COLLABORATE';

interface TeachingAction {
    type: TeachingActionType;
    title: string;
    duration_minutes: number;
}

interface SyllabusSection {
    order: number;
    title: string;
    iris_phase: string;
    week_number?: number;
    topics: string[];
    activities: string[];
    teaching_actions: TeachingAction[];
    assessment?: string;
    duration_hours: number;
}

interface SyllabusData {
    title: string;
    overview: string;
    learning_outcomes: string[];
    assessment_strategy: {
        quizzes?: number;
        assignments?: number;
        project?: number;
        capstone?: number;
    };
    resources: string[];
    hexahelix_sectors: string[];
    duration_weeks: number;
    sections: SyllabusSection[];
}

interface Props {
    courseId: number;
    courseTitle: string;
    courseDuration?: string;
    onSave: (syllabus: SyllabusData) => Promise<void>;
    onClose: () => void;
}

const IRIS_PHASES = [
    { id: 'immerse', label: 'Immerse', color: 'bg-blue-500' },
    { id: 'realize', label: 'Realize', color: 'bg-purple-500' },
    { id: 'iterate', label: 'Iterate', color: 'bg-green-500' },
    { id: 'scale', label: 'Scale', color: 'bg-orange-500' }
];

const TEACHING_ACTION_CONFIG: Record<TeachingActionType, { icon: React.ReactNode; color: string; label: string }> = {
    EXPLAIN: { icon: <BookOpen size={14} />, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Explain' },
    DISCUSS: { icon: <MessageSquare size={14} />, color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Discuss' },
    PRACTICE: { icon: <Target size={14} />, color: 'bg-green-100 text-green-700 border-green-200', label: 'Practice' },
    QUIZ: { icon: <HelpCircle size={14} />, color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Quiz' },
    DEMO: { icon: <Play size={14} />, color: 'bg-pink-100 text-pink-700 border-pink-200', label: 'Demo' },
    REFLECT: { icon: <Lightbulb size={14} />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Reflect' },
    COLLABORATE: { icon: <Users size={14} />, color: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Collaborate' }
};

const HEXAHELIX_SECTORS = [
    'Government', 'Academia', 'Industry', 'Civil Society', 'Media', 'Community'
];

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function SyllabusManager({ courseId, courseTitle, courseDuration, onSave, onClose }: Props) {
    const [mode, setMode] = useState<'manual' | 'ai' | 'templates'>('manual');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [expandedSections, setExpandedSections] = useState<number[]>([]);
    const [existingSyllabusId, setExistingSyllabusId] = useState<number | null>(null);
    const [selectedCapstoneTemplate, setSelectedCapstoneTemplate] = useState<CapstoneTemplate | null>(null);

    // Parse duration to weeks
    const parseDuration = (dur?: string): number => {
        if (!dur) return 4;
        const match = dur.match(/(\d+)/);
        return match ? parseInt(match[1]) : 4;
    };

    const [syllabus, setSyllabus] = useState<SyllabusData>({
        title: `Syllabus: ${courseTitle}`,
        overview: '',
        learning_outcomes: [''],
        assessment_strategy: { quizzes: 20, assignments: 30, project: 30, capstone: 20 },
        resources: [''],
        hexahelix_sectors: [],
        duration_weeks: parseDuration(courseDuration),
        sections: []
    });

    // Load existing syllabus on mount
    const loadExistingSyllabus = async () => {
        try {
            setIsLoading(true);
            // Add timestamp to prevent caching
            const url = `${API_BASE}/api/v1/courses/${courseId}/syllabus?t=${new Date().getTime()}`;
            const response = await fetch(url, { cache: 'no-store', headers: { 'Pragma': 'no-cache' } });

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    // Load the MOST RECENT syllabus (last in array, highest ID)
                    const existing = data[data.length - 1];
                    setExistingSyllabusId(existing.id);
                    setSyllabus({
                        title: existing.title || `Syllabus: ${courseTitle}`,
                        overview: existing.overview || '',
                        learning_outcomes: existing.learning_outcomes || [''],
                        assessment_strategy: existing.assessment_strategy || { quizzes: 20, assignments: 30, project: 30, capstone: 20 },
                        resources: existing.resources || [''],
                        hexahelix_sectors: existing.hexahelix_sectors || [],
                        duration_weeks: existing.duration_weeks || parseDuration(courseDuration),
                        sections: existing.sections || []
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load existing syllabus:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load existing syllabus on mount
    useEffect(() => {
        loadExistingSyllabus();
    }, [courseId, courseTitle, courseDuration]);

    // AI generation state
    const [aiTopic, setAiTopic] = useState(courseTitle);
    const [aiFiles, setAiFiles] = useState<File[]>([]);

    const handleAIGenerate = async () => {
        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append('course_id', courseId.toString());
            formData.append('topic', aiTopic);
            formData.append('description', syllabus.overview || '');
            formData.append('duration_weeks', syllabus.duration_weeks.toString());
            formData.append('level', 'Intermediate');
            formData.append('hexahelix_sectors', syllabus.hexahelix_sectors.join(','));

            aiFiles.forEach(file => formData.append('files', file));

            const response = await fetch(`${API_BASE}/api/v1/syllabus/generate`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setSyllabus({
                    ...syllabus,
                    title: data.title || syllabus.title,
                    overview: data.overview || '',
                    learning_outcomes: data.learning_outcomes || [''],
                    assessment_strategy: data.assessment_strategy || syllabus.assessment_strategy,
                    resources: data.resources || [''],
                    sections: data.sections || []
                });
                setMode('manual'); // Switch to manual to edit
            }
        } catch (error) {
            console.error('AI generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const addSection = () => {
        const newOrder = syllabus.sections.length + 1;
        const phaseIndex = Math.floor((newOrder - 1) / Math.max(1, syllabus.duration_weeks / 4));
        const phase = IRIS_PHASES[Math.min(phaseIndex, 3)].id;

        setSyllabus({
            ...syllabus,
            sections: [...syllabus.sections, {
                order: newOrder,
                title: `Week ${newOrder}`,
                iris_phase: phase,
                week_number: newOrder,
                topics: [''],
                activities: [''],
                teaching_actions: [],
                assessment: '',
                duration_hours: 3
            }]
        });
        setExpandedSections([...expandedSections, newOrder - 1]);
    };

    // Teaching action helpers
    const addTeachingAction = (sectionIndex: number, type: TeachingActionType) => {
        const newSections = [...syllabus.sections];
        if (!newSections[sectionIndex].teaching_actions) {
            newSections[sectionIndex].teaching_actions = [];
        }
        newSections[sectionIndex].teaching_actions.push({
            type,
            title: `${TEACHING_ACTION_CONFIG[type].label} activity`,
            duration_minutes: 30
        });
        setSyllabus({ ...syllabus, sections: newSections });
    };

    const removeTeachingAction = (sectionIndex: number, actionIndex: number) => {
        const newSections = [...syllabus.sections];
        newSections[sectionIndex].teaching_actions.splice(actionIndex, 1);
        setSyllabus({ ...syllabus, sections: newSections });
    };

    const updateTeachingAction = (sectionIndex: number, actionIndex: number, field: keyof TeachingAction, value: any) => {
        const newSections = [...syllabus.sections];
        (newSections[sectionIndex].teaching_actions[actionIndex] as any)[field] = value;
        setSyllabus({ ...syllabus, sections: newSections });
    };

    const removeSection = (index: number) => {
        const newSections = syllabus.sections.filter((_, i) => i !== index);
        newSections.forEach((s, i) => s.order = i + 1);
        setSyllabus({ ...syllabus, sections: newSections });
    };

    const updateSection = (index: number, field: keyof SyllabusSection, value: any) => {
        const newSections = [...syllabus.sections];
        (newSections[index] as any)[field] = value;
        setSyllabus({ ...syllabus, sections: newSections });
    };

    const toggleSection = (index: number) => {
        setExpandedSections(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            await onSave(syllabus);
            // Reload to get the new ID and confirm persistence
            await loadExistingSyllabus();
            setSaveStatus('success');
            // Keep modal open briefly to show success, then close
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Syllabus Manager</h2>
                        <p className="text-sm text-gray-500">{courseTitle}</p>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setMode('manual')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            <FileText size={16} />
                            Manual
                        </button>
                        <button
                            onClick={() => setMode('ai')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'ai' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            <Sparkles size={16} />
                            AI Assisted
                        </button>
                        <button
                            onClick={() => setMode('templates')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            <Layout size={16} />
                            Templates
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-gray-500">Loading syllabus...</p>
                        </div>
                    ) : mode === 'ai' ? (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-primary/10 to-purple-100 rounded-2xl p-6 border border-primary/20">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="text-primary" size={20} />
                                    AI Syllabus Generator
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Topic</label>
                                        <input
                                            type="text"
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-xl"
                                            placeholder="e.g., Machine Learning Fundamentals"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
                                            <input
                                                type="number"
                                                value={syllabus.duration_weeks}
                                                onChange={(e) => setSyllabus({ ...syllabus, duration_weeks: parseInt(e.target.value) || 4 })}
                                                min={1}
                                                max={52}
                                                className="w-full p-3 border border-gray-200 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hexahelix Sectors</label>
                                            <div className="flex flex-wrap gap-2">
                                                {HEXAHELIX_SECTORS.map(sector => (
                                                    <button
                                                        key={sector}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = syllabus.hexahelix_sectors;
                                                            setSyllabus({
                                                                ...syllabus,
                                                                hexahelix_sectors: current.includes(sector)
                                                                    ? current.filter(s => s !== sector)
                                                                    : [...current, sector]
                                                            });
                                                        }}
                                                        className={`px-2 py-1 text-xs rounded-full border transition-colors ${syllabus.hexahelix_sectors.includes(sector)
                                                            ? 'bg-primary text-white border-primary'
                                                            : 'border-gray-300 hover:border-primary'
                                                            }`}
                                                    >
                                                        {sector}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Upload Teaching Materials (Optional)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf,.docx,.pptx,.txt,.md,.png,.jpg,.jpeg"
                                                onChange={(e) => setAiFiles(Array.from(e.target.files || []))}
                                                className="hidden"
                                                id="material-upload"
                                            />
                                            <label htmlFor="material-upload" className="cursor-pointer">
                                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    {aiFiles.length > 0 ? `${aiFiles.length} file(s) selected` : 'PDF, DOCX, PPTX, Images'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">Supports OCR for scanned documents</p>
                                            </label>
                                        </div>
                                        {aiFiles.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {aiFiles.map((f, i) => (
                                                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{f.name}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleAIGenerate}
                                        disabled={isGenerating || !aiTopic.trim()}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Generating VOKASI Syllabus...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={20} />
                                                Generate Syllabus
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : mode === 'templates' ? (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Layout className="text-indigo-600" size={20} />
                                    Capstone Project Templates
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Choose a pre-built template to quickly set up your capstone project with deliverables and rubrics.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {CAPSTONE_TEMPLATES.map(template => (
                                        <div
                                            key={template.id}
                                            className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer hover:shadow-md ${selectedCapstoneTemplate?.id === template.id
                                                    ? 'border-indigo-500 shadow-md'
                                                    : 'border-gray-100 hover:border-indigo-200'
                                                }`}
                                            onClick={() => setSelectedCapstoneTemplate(template)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-gray-900">{template.title}</h4>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${template.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                                        template.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                            template.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' :
                                                                'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {template.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {template.estimatedWeeks} weeks
                                                </span>
                                                <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{template.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedCapstoneTemplate && (
                                    <div className="mt-6 p-4 bg-white rounded-xl border border-indigo-200">
                                        <h4 className="font-bold text-gray-900 mb-3">
                                            Selected: {selectedCapstoneTemplate.title}
                                        </h4>
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-gray-500 mb-2">Deliverables:</p>
                                            <ul className="text-sm text-gray-700 space-y-1">
                                                {selectedCapstoneTemplate.deliverables.map((d, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <CheckCircle size={14} className="text-green-500" /> {d}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <button
                                            onClick={() => {
                                                // Create sections from template IRIS phases
                                                const newSections: SyllabusSection[] = Object.entries(selectedCapstoneTemplate.irisPhaseMapping).map(([phase, desc], idx) => ({
                                                    order: idx + 1,
                                                    title: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase`,
                                                    iris_phase: phase,
                                                    week_number: idx + 1,
                                                    topics: [desc],
                                                    activities: selectedCapstoneTemplate.deliverables.slice(idx, idx + 2),
                                                    teaching_actions: [],
                                                    assessment: selectedCapstoneTemplate.rubricCriteria[idx]?.criterion || '',
                                                    duration_hours: selectedCapstoneTemplate.estimatedWeeks
                                                }));

                                                setSyllabus({
                                                    ...syllabus,
                                                    title: `${courseTitle} - ${selectedCapstoneTemplate.title}`,
                                                    sections: newSections,
                                                    learning_outcomes: selectedCapstoneTemplate.deliverables.slice(0, 4)
                                                });
                                                setMode('manual');
                                            }}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            Apply Template
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={syllabus.title}
                                        onChange={(e) => setSyllabus({ ...syllabus, title: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-xl"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Overview</label>
                                    <textarea
                                        value={syllabus.overview}
                                        onChange={(e) => setSyllabus({ ...syllabus, overview: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-xl h-24 resize-none"
                                        placeholder="Brief course overview..."
                                    />
                                </div>
                            </div>

                            {/* Learning Outcomes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Learning Outcomes</label>
                                {syllabus.learning_outcomes.map((outcome, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={outcome}
                                            onChange={(e) => {
                                                const newOutcomes = [...syllabus.learning_outcomes];
                                                newOutcomes[i] = e.target.value;
                                                setSyllabus({ ...syllabus, learning_outcomes: newOutcomes });
                                            }}
                                            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
                                            placeholder={`Outcome ${i + 1}`}
                                        />
                                        <button
                                            onClick={() => {
                                                const newOutcomes = syllabus.learning_outcomes.filter((_, idx) => idx !== i);
                                                setSyllabus({ ...syllabus, learning_outcomes: newOutcomes.length ? newOutcomes : [''] });
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setSyllabus({ ...syllabus, learning_outcomes: [...syllabus.learning_outcomes, ''] })}
                                    className="text-sm text-primary font-medium flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add Outcome
                                </button>
                            </div>

                            {/* Sections */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-gray-700">Sections ({syllabus.sections.length})</label>
                                    <button
                                        onClick={addSection}
                                        className="text-sm text-primary font-medium flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add Section
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {syllabus.sections.map((section, index) => (
                                        <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                                            <div
                                                className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer"
                                                onClick={() => toggleSection(index)}
                                            >
                                                <GripVertical size={16} className="text-gray-400" />
                                                <div className={`w-3 h-3 rounded-full ${IRIS_PHASES.find(p => p.id === section.iris_phase)?.color || 'bg-gray-400'}`} />
                                                <span className="font-medium flex-1">{section.title}</span>
                                                <span className="text-xs text-gray-500 capitalize">{section.iris_phase}</span>
                                                {expandedSections.includes(index) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>

                                            {expandedSections.includes(index) && (
                                                <div className="p-4 space-y-3 border-t">
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <input
                                                            type="text"
                                                            value={section.title}
                                                            onChange={(e) => updateSection(index, 'title', e.target.value)}
                                                            placeholder="Section title"
                                                            className="p-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        <select
                                                            value={section.iris_phase}
                                                            onChange={(e) => updateSection(index, 'iris_phase', e.target.value)}
                                                            className="p-2 border border-gray-200 rounded-lg text-sm"
                                                        >
                                                            {IRIS_PHASES.map(p => (
                                                                <option key={p.id} value={p.id}>{p.label}</option>
                                                            ))}                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={section.assessment || ''}
                                                            onChange={(e) => updateSection(index, 'assessment', e.target.value)}
                                                            placeholder="Assessment type"
                                                            className="p-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 mb-1 block">Topics (comma-separated)</label>
                                                        <input
                                                            type="text"
                                                            value={section.topics.join(', ')}
                                                            onChange={(e) => updateSection(index, 'topics', e.target.value.split(',').map(t => t.trim()))}
                                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                    </div>

                                                    {/* Teaching Actions Section */}
                                                    <div className="mt-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                                                <Sparkles size={12} className="text-primary" />
                                                                Teaching Actions ({section.teaching_actions?.length || 0})
                                                            </label>
                                                            <div className="relative group">
                                                                <button
                                                                    type="button"
                                                                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                                                                >
                                                                    <Plus size={12} /> Add Action
                                                                </button>
                                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-10 w-40">
                                                                    {(Object.keys(TEACHING_ACTION_CONFIG) as TeachingActionType[]).map(actionType => (
                                                                        <button
                                                                            key={actionType}
                                                                            type="button"
                                                                            onClick={() => addTeachingAction(index, actionType)}
                                                                            className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-gray-50 ${TEACHING_ACTION_CONFIG[actionType].color}`}
                                                                        >
                                                                            {TEACHING_ACTION_CONFIG[actionType].icon}
                                                                            {TEACHING_ACTION_CONFIG[actionType].label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {section.teaching_actions && section.teaching_actions.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {section.teaching_actions.map((action, aIdx) => (
                                                                    <div key={aIdx} className={`flex items-center gap-2 p-2 rounded-lg border ${TEACHING_ACTION_CONFIG[action.type]?.color || 'bg-gray-100'}`}>
                                                                        {TEACHING_ACTION_CONFIG[action.type]?.icon}
                                                                        <input
                                                                            type="text"
                                                                            value={action.title}
                                                                            onChange={(e) => updateTeachingAction(index, aIdx, 'title', e.target.value)}
                                                                            className="flex-1 bg-transparent text-sm font-medium outline-none"
                                                                        />
                                                                        <div className="flex items-center gap-1 text-xs">
                                                                            <Clock size={12} />
                                                                            <input
                                                                                type="number"
                                                                                value={action.duration_minutes}
                                                                                onChange={(e) => updateTeachingAction(index, aIdx, 'duration_minutes', parseInt(e.target.value) || 0)}
                                                                                className="w-12 bg-white/50 rounded px-1 py-0.5 text-center"
                                                                            />
                                                                            <span>min</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeTeachingAction(index, aIdx)}
                                                                            className="p-1 hover:bg-white/50 rounded"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-400 italic">No teaching actions yet. Add actions like Explain, Quiz, Practice, etc.</p>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => removeSection(index)}
                                                        className="text-red-500 text-sm flex items-center gap-1 hover:underline mt-3"
                                                    >
                                                        <Trash2 size={14} /> Remove Section
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-between items-center">
                    {saveStatus === 'success' ? (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={20} />
                            <span className="font-medium">Syllabus saved successfully!</span>
                        </div>
                    ) : saveStatus === 'error' ? (
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle size={20} />
                            <span className="font-medium">Failed to save. Please try again.</span>
                        </div>
                    ) : existingSyllabusId ? (
                        <div className="text-sm text-gray-500">
                            Editing existing syllabus (ID: {existingSyllabusId})
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            Creating new syllabus
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Syllabus
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

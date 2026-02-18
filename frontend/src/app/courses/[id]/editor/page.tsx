'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Save, Plus } from 'lucide-react';
import { CourseEditor } from '@/components/CourseEditor';
import { useToast } from '@/lib/ToastContext';

interface CourseData {
    id: number;
    title: string;
    description: string;
}

interface CourseModule {
    title: string;
    order: number;
    content_blocks: any[];
    status: string;
}

export default function CourseEditorPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;
    const { showToast } = useToast();

    const [course, setCourse] = useState<CourseData | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                // Fetch course info
                const courseRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}`);
                if (courseRes.ok) {
                    setCourse(await courseRes.json());
                }

                // Fetch modules
                const modulesRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}/modules`);
                if (modulesRes.ok) {
                    setModules(await modulesRes.json());
                }
            } catch (error) {
                console.error('Error fetching context:', error);
                showToast('error', 'Failed to load editor context');
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchContext();
        }
    }, [courseId, showToast]);

    const handleSave = async (blocks: any[]) => {
        setIsSaving(true);
        try {
            // Update the current module's blocks in state
            const updatedModules = [...modules];
            if (!updatedModules[selectedModuleIdx]) {
                // Should not happen if module exists, but handled for safety
                updatedModules[selectedModuleIdx] = {
                    title: 'New Module',
                    order: selectedModuleIdx,
                    content_blocks: blocks,
                    status: 'draft'
                };
            } else {
                updatedModules[selectedModuleIdx].content_blocks = blocks;
            }
            setModules(updatedModules);

            // Persist to backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedModules)
            });

            if (!response.ok) throw new Error('Failed to save');

            showToast('success', 'Course content saved successfully');
        } catch (error) {
            console.error('Error saving:', error);
            showToast('error', 'Failed to save content');
        } finally {
            setIsSaving(false);
        }
    };

    const addNewModule = () => {
        const newModule: CourseModule = {
            title: `Module ${modules.length + 1}`,
            order: modules.length,
            content_blocks: [],
            status: 'draft'
        };
        const updated = [...modules, newModule];
        setModules(updated);
        setSelectedModuleIdx(updated.length - 1);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Loading course editor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Course</span>
                    </button>
                    {isSaving && (
                        <span className="flex items-center gap-2 text-sm text-purple-600 animate-pulse">
                            <Save size={14} /> Saving...
                        </span>
                    )}
                </div>
            </div>

            {/* Module Selector */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {modules.map((module, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedModuleIdx(idx)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border
                                    ${selectedModuleIdx === idx
                                        ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                                        : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                                    }`}
                            >
                                Module {idx + 1}: {module.title}
                            </button>
                        ))}
                        <button
                            onClick={addNewModule}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1"
                        >
                            <Plus size={16} /> New Module
                        </button>
                    </div>
                </div>
            </div>

            {/* Course Editor */}
            <CourseEditor
                key={selectedModuleIdx} // Force re-render on module switch to reset internal state
                courseTitle={course?.title || 'Untitled Course'}
                moduleTitle={modules[selectedModuleIdx]?.title || 'New Module'}
                initialBlocks={modules[selectedModuleIdx]?.content_blocks || []}
                onSave={handleSave}
            />
        </div>
    );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CourseEditor } from '@/components/CourseEditor';

interface CourseData {
    id: number;
    title: string;
    description: string;
    modules?: Array<{
        title: string;
        content: string;
    }>;
}

export default function CourseEditorPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [course, setCourse] = useState<CourseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState(0);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(`/api/v1/courses/${courseId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCourse(data);
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleSave = async (blocks: any[]) => {
        try {
            // Save the content blocks to the course
            console.log('Saving blocks for course:', courseId, blocks);
            // TODO: Implement API call to save content blocks
            alert('Content saved successfully!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save content');
        }
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
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Course</span>
                    </button>
                </div>
            </div>

            {/* Module Selector (if course has multiple modules) */}
            {course?.modules && course.modules.length > 1 && (
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-6 py-3">
                        <div className="flex gap-2 overflow-x-auto">
                            {course.modules.map((module, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedModule(idx)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedModule === idx
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Module {idx + 1}: {module.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Course Editor */}
            <CourseEditor
                courseTitle={course?.title || 'Untitled Course'}
                moduleTitle={course?.modules?.[selectedModule]?.title || 'Module Content'}
                onSave={handleSave}
            />
        </div>
    );
}

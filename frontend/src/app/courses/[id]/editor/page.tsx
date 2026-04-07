'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { WYSIWYGCourseEditor } from '@/components/course-editor';
import { CourseData } from '@/components/course-editor/types';

export default function CourseEditorPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [courseData, setCourseData] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [courseTitle, setCourseTitle] = useState('Course Editor');

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // Fetch course data on mount
    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch course metadata
            const courseRes = await fetch(`${BACKEND_URL}/api/v1/courses/${courseId}`);
            if (!courseRes.ok) throw new Error('Failed to fetch course data');
            const course = await courseRes.json();
            setCourseTitle(course.title || 'Course Editor');

            // Fetch course modules
            const modulesRes = await fetch(`${BACKEND_URL}/api/v1/courses/${courseId}/modules`);

            let modules = [];
            if (modulesRes.ok) {
                const modulesData = await modulesRes.json();
                modules = transformModulesToEditorFormat(modulesData);
            } else {
                // If no modules exist, create a default structure
                modules = createDefaultModules();
            }

            const editorData: CourseData = {
                id: courseId,
                title: course.title,
                approval_status: course.approval_status,
                modules: modules
            };

            setCourseData(editorData);
        } catch (err: any) {
            console.error('Error fetching course data:', err);
            setError(err.message || 'Failed to load course data');
        } finally {
            setLoading(false);
        }
    };

    // Transform backend modules to editor format
    const transformModulesToEditorFormat = (modulesData: any[]): any[] => {
        return modulesData.map((mod, idx) => ({
            id: mod.id?.toString() || `module-${idx}`,
            title: mod.title || `Module ${idx + 1}`,
            order: mod.order ?? idx,
            isExpanded: idx === 0, // Expand first module by default
            pages: [
                {
                    id: `page-${mod.id || idx}-1`,
                    title: mod.title || `Page 1`,
                    order: 0,
                    content: mod.content_blocks || []
                }
            ]
        }));
    };

    // Create default modules if none exist
    const createDefaultModules = () => {
        return [
            {
                id: 'module-1',
                title: 'Introduction',
                order: 0,
                isExpanded: true,
                pages: [
                    {
                        id: 'page-1-1',
                        title: 'Getting Started',
                        order: 0,
                        content: []
                    }
                ]
            }
        ];
    };

    // Handle save
    const handleSave = async (data: CourseData) => {
        try {
            // Transform editor data back to backend format
            const modulesPayload = data.modules.map(module => ({
                title: module.title,
                order: module.order,
                status: 'published',
                content_blocks: module.pages[0]?.content || [] // For now, use first page's content
            }));

            const response = await fetch(`${BACKEND_URL}/api/v1/courses/${courseId}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(modulesPayload)
            });

            if (!response.ok) {
                throw new Error('Failed to save course content');
            }

            console.log('Course content saved successfully');
            return true;
        } catch (err: any) {
            console.error('Error saving course:', err);
            alert('Failed to save course. Please try again.');
            return false;
        }
    };

    // Handle publish
    const handlePublish = async (data: CourseData) => {
        const saved = await handleSave(data);

        if (saved) {
            try {
                const response = await fetch(`${BACKEND_URL}/api/v1/courses/${courseId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ approval_status: 'approved' })
                });

                if (response.ok) {
                    alert('Course published successfully! It is now live.');
                    // Update local state to reflect change
                    if (courseData) {
                        setCourseData({ ...courseData, approval_status: 'approved' });
                    }
                } else {
                    alert('Course saved, but failed to publish status.');
                }
            } catch (err) {
                console.error('Publish error:', err);
                alert('Error publishing course.');
            }
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading course editor...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Course</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/instructor')}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={fetchCourseData}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main editor view
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with breadcrumb */}
            {/* Header removed - handled by EditorCanvas */}

            {/* WYSIWYG Editor */}
            {courseData && (
                <WYSIWYGCourseEditor
                    courseId={courseId}
                    initialData={courseData}
                    onSave={async (data) => { await handleSave(data); }}
                    onPublish={handlePublish}
                />
            )}
        </div>
    );
}

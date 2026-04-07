'use client';

import React from 'react';
import WYSIWYGCourseEditor from '@/components/course-editor/WYSIWYGCourseEditor';
import { CourseData } from '@/components/course-editor/types';

export default function EditorDemoPage() {
    // Sample data to demonstrate the editor
    const initialData: CourseData = {
        id: 'demo-course-1',
        title: 'Digital Marketing Mastery for SFIA Level 3',
        description: 'A comprehensive course on digital marketing',
        modules: [
            {
                id: 'module-1',
                title: 'Foundations of Digital Marketing',
                order: 0,
                courseId: 'demo-course-1',
                isExpanded: true,
                pages: [
                    {
                        id: 'page-1',
                        title: 'Understanding the Customer Journey',
                        order: 0,
                        moduleId: 'module-1',
                        content: [
                            {
                                id: 'block-1',
                                type: 'heading',
                                category: 'text',
                                content: 'Understanding the Customer Journey',
                                order: 0,
                                metadata: {}
                            },
                            {
                                id: 'block-2',
                                type: 'text',
                                category: 'text',
                                content: 'The customer journey is a crucial concept in digital marketing. It represents the complete experience customers go through when interacting with your brand, from initial awareness to purchase and beyond.',
                                order: 1,
                                metadata: {}
                            },
                            {
                                id: 'block-3',
                                type: 'video',
                                category: 'video',
                                content: '',
                                order: 2,
                                metadata: {
                                    videoUrl: 'https://www.youtube.com/watch?v=example',
                                    title: 'Customer Journey Explained'
                                }
                            }
                        ]
                    },
                    {
                        id: 'page-2',
                        title: 'The Digital Marketing Landscape',
                        order: 1,
                        moduleId: 'module-1',
                        content: []
                    }
                ]
            },
            {
                id: 'module-2',
                title: 'Content Marketing Strategies',
                order: 1,
                courseId: 'demo-course-1',
                isExpanded: false,
                pages: [
                    {
                        id: 'page-3',
                        title: 'Creating Engaging Content',
                        order: 0,
                        moduleId: 'module-2',
                        content: []
                    }
                ]
            }
        ]
    };

    const handleSave = async (data: CourseData) => {
        console.log('Saving course data:', data);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    const handlePublish = async (data: CourseData) => {
        console.log('Publishing course:', data);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    return (
        <div className="w-screen h-screen">
            <WYSIWYGCourseEditor
                courseId="demo-course-1"
                initialData={initialData}
                onSave={handleSave}
                onPublish={handlePublish}
            />
        </div>
    );
}

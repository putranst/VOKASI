'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Sparkles, BookOpen, FileEdit, Wand2 } from 'lucide-react';
import { CourseCreationForm } from '@/components/CourseCreationForm';
import { AICourseGenerator } from '@/components/AICourseGenerator';
import { SmartCourseWizard } from '@/components/SmartCourseWizard';

import { useAuth } from '@/lib/AuthContext';

export default function CreateCoursePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [mode, setMode] = useState<'smart' | 'ai' | 'manual'>('smart');
    const [showSuccess, setShowSuccess] = useState(false);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    const buildPuckDataFromAgenda = (agenda: any) => {
        const content: Array<{ type: string; props: Record<string, any> }> = [];

        (agenda?.modules || []).forEach((mod: any, modIdx: number) => {
            const learningObjectives = (mod.learning_objectives || [])
                .map((objective: any) => typeof objective === 'string' ? objective : objective?.text || objective?.objective)
                .filter(Boolean)
                .join('\n');

            content.push({
                type: 'ModuleHeader',
                props: {
                    id: `module-header-${modIdx}`,
                    title: mod.title || `Module ${modIdx + 1}`,
                    subtitle: mod.subtitle || '',
                    learningObjectives: learningObjectives || '',
                    estimatedMinutes: Math.round(((mod.duration_hours || 2) * 60)),
                },
            });

            const readingsHtml = [
                ...(mod.readings?.required || []).map((reading: any) => `<li><strong>${reading.title || 'Required reading'}</strong>${reading.author ? ` — ${reading.author}` : ''}${reading.chapters ? `, ${reading.chapters}` : ''}${reading.pages ? `, ${reading.pages}` : ''}</li>`),
                ...(mod.readings?.optional || []).map((reading: any) => `<li><strong>${reading.title || 'Optional reading'}</strong>${reading.description ? ` — ${reading.description}` : ''}</li>`),
            ];

            const overviewHtml = [
                mod.subtitle ? `<p>${mod.subtitle}</p>` : '',
                learningObjectives ? `<h3>Learning objectives</h3><ul>${learningObjectives.split('\n').map((item: string) => `<li>${item}</li>`).join('')}</ul>` : '',
                readingsHtml.length ? `<h3>Readings</h3><ul>${readingsHtml.join('')}</ul>` : '',
            ].filter(Boolean).join('');

            if (overviewHtml) {
                content.push({
                    type: 'RichContent',
                    props: {
                        id: `module-overview-${modIdx}`,
                        html: overviewHtml,
                    },
                });
            }

            (mod.session_schedule || mod.teaching_actions || []).forEach((action: any, actionIdx: number) => {
                const actionType = String(action?.type || '').toUpperCase();
                const actionTitle = action?.title || actionType || `Activity ${actionIdx + 1}`;

                if (actionType === 'QUIZ') {
                    content.push({
                        type: 'QuizBuilder',
                        props: {
                            id: `quiz-${modIdx}-${actionIdx}`,
                            quizTitle: actionTitle,
                            questions: (action?.questions || []).map((question: any) => ({
                                question: question?.question || 'Question',
                                options: Array.isArray(question?.options) ? question.options.join('\n') : (question?.options || 'Option A\nOption B'),
                                correctIndex: typeof question?.correct === 'number'
                                    ? question.correct
                                    : typeof question?.correctIndex === 'number'
                                    ? question.correctIndex
                                    : 0,
                            })),
                            passingScore: action?.passing_threshold || 70,
                        },
                    });
                    return;
                }

                if (actionType === 'DISCUSS' || actionType === 'COLLABORATE') {
                    content.push({
                        type: 'DiscussionSeed',
                        props: {
                            id: `discussion-${modIdx}-${actionIdx}`,
                            topic: actionTitle,
                            seedPost: (action?.discussion_prompts || []).join('\n') || action?.description || action?.content || 'Share your perspective on this topic.',
                            requiredReplies: 2,
                            gradingNotes: action?.facilitation_notes || 'Substantive replies required.',
                        },
                    });
                    return;
                }

                if (actionType === 'REFLECT') {
                    content.push({
                        type: 'ReflectionJournal',
                        props: {
                            id: `reflection-${modIdx}-${actionIdx}`,
                            prompt: (action?.reflection_prompts || []).join('\n') || action?.description || 'Reflect on what you learned in this module.',
                            minWords: 120,
                            tags: 'reflection, ai-generated',
                        },
                    });
                    return;
                }

                if (actionType === 'PRACTICE' && /code|python|javascript|typescript|sql|java/i.test(`${action?.description || ''} ${actionTitle}`)) {
                    content.push({
                        type: 'CodeSandbox',
                        props: {
                            id: `code-${modIdx}-${actionIdx}`,
                            language: /python/i.test(`${action?.description || ''} ${actionTitle}`) ? 'python' : 'javascript',
                            starterCode: '',
                            instructions: (action?.instructions || []).join('\n') || action?.description || 'Complete the activity described here.',
                            testCases: '',
                        },
                    });
                    return;
                }

                if (actionType === 'DISCUSS' || actionType === 'REFLECT') {
                    content.push({
                        type: 'SocraticChat',
                        props: {
                            id: `socratic-${modIdx}-${actionIdx}`,
                            seedQuestion: action?.description || actionTitle,
                            persona: 'VOKASI Tutor',
                            maxTurns: 6,
                        },
                    });
                    return;
                }

                const detailHtml = [
                    `<h3>${actionTitle}</h3>`,
                    action?.description ? `<p>${action.description}</p>` : '',
                    Array.isArray(action?.key_points) && action.key_points.length ? `<h4>Key points</h4><ul>${action.key_points.map((point: string) => `<li>${point}</li>`).join('')}</ul>` : '',
                    Array.isArray(action?.instructions) && action.instructions.length ? `<h4>Instructions</h4><ol>${action.instructions.map((step: string) => `<li>${step}</li>`).join('')}</ol>` : '',
                    Array.isArray(action?.key_takeaways) && action.key_takeaways.length ? `<h4>Takeaways</h4><ul>${action.key_takeaways.map((point: string) => `<li>${point}</li>`).join('')}</ul>` : '',
                ].filter(Boolean).join('');

                content.push({
                    type: 'RichContent',
                    props: {
                        id: `content-${modIdx}-${actionIdx}`,
                        html: detailHtml || `<p>${actionTitle}</p>`,
                    },
                });
            });

            if (mod.assignment) {
                content.push({
                    type: 'Assignment',
                    props: {
                        id: `assignment-${modIdx}`,
                        title: mod.assignment.title || `Assignment ${modIdx + 1}`,
                        description: mod.assignment.description || 'Complete the assignment described here.',
                        dueLabel: mod.assignment.due_week ? `Week ${mod.assignment.due_week}` : 'End of module',
                        submissionType: 'file',
                        maxScore: mod.assignment.weight_percent || 100,
                    },
                });

                if (Array.isArray(mod.assignment.rubric) && mod.assignment.rubric.length) {
                    content.push({
                        type: 'PeerReviewRubric',
                        props: {
                            id: `rubric-${modIdx}`,
                            rubricTitle: `${mod.assignment.title || `Assignment ${modIdx + 1}`} Rubric`,
                            instructions: 'Use this rubric to evaluate the submission quality.',
                            criteria: mod.assignment.rubric.map((criterion: any) => ({
                                criterion: criterion?.criterion || 'Criterion',
                                maxPoints: criterion?.weight || 10,
                                description: criterion?.excellent || criterion?.proficient || criterion?.description || '',
                            })),
                        },
                    });
                }
            }
        });

        return {
            content,
            root: { props: {} },
        };
    };

    const handleManualSubmit = async (formData: any) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    instructor: formData.instructor,
                    org: formData.org,
                    image: formData.image,
                    tag: formData.tag,
                    level: formData.level,
                    category: formData.category || 'Technology',
                    description: formData.description,
                    duration: formData.duration,
                    institution_id: formData.institution_id ? parseInt(formData.institution_id) : undefined,
                    instructor_id: formData.instructor_id  // Link to instructor
                })
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                    router.push('/instructor');
                }, 2000);
            } else {
                throw new Error('Failed to create course');
            }
        } catch (error) {
            console.error('Failed to create course:', error);
            alert('Failed to create course. Please try again.');
        }
    };

    const handleAICourseCreated = async (courseData: any) => {
        try {
            const courseResponse = await fetch(`${BACKEND_URL}/api/v1/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: courseData.title,
                    description: courseData.description,
                    level: courseData.level,
                    duration: courseData.duration,
                    tag: courseData.tag || 'AI Generated',
                    image: courseData.image,
                    category: courseData.category || 'Technology',
                    instructor: user?.name || 'Instructor',
                    org: 'VOKASI',
                    instructor_id: user?.id
                })
            });

            if (!courseResponse.ok) {
                throw new Error('Failed to create AI-generated course');
            }

            const createdCourse = await courseResponse.json();
            const agenda = courseData.agenda;
            const parsedContent = courseData.parsed_content;

            if (agenda?.modules?.length) {
                const modulesPayload = agenda.modules.map((mod: any, modIdx: number) => {
                    const objectiveLines = (mod.learning_objectives || [])
                        .map((objective: any) => typeof objective === 'string' ? objective : objective?.text)
                        .filter(Boolean)
                        .join('\n');

                    const contentBlocks: any[] = [
                        {
                            id: `module-header-${modIdx}`,
                            type: 'heading',
                            content: mod.title,
                            metadata: { level: 1 }
                        },
                    ];

                    if (mod.subtitle) {
                        contentBlocks.push({
                            id: `module-subtitle-${modIdx}`,
                            type: 'text',
                            content: mod.subtitle,
                            metadata: {}
                        });
                    }

                    if (objectiveLines) {
                        contentBlocks.push({
                            id: `module-objectives-${modIdx}`,
                            type: 'text',
                            content: `Learning Objectives:\n${objectiveLines}`,
                            metadata: {}
                        });
                    }

                    (mod.session_schedule || mod.teaching_actions || []).forEach((action: any, actionIdx: number) => {
                        const actionTitle = action?.title || action?.type || `Activity ${actionIdx + 1}`;
                        contentBlocks.push({
                            id: `module-${modIdx}-action-${actionIdx}-heading`,
                            type: 'heading',
                            content: actionTitle,
                            metadata: { level: 2 }
                        });

                        const actionType = String(action?.type || '').toUpperCase();
                        if (actionType === 'QUIZ') {
                            contentBlocks.push({
                                id: `module-${modIdx}-action-${actionIdx}-quiz`,
                                type: 'quiz',
                                content: action?.description || 'Knowledge check',
                                metadata: {
                                    questions: action?.questions || [],
                                    question_count: action?.question_count,
                                    passing_threshold: action?.passing_threshold
                                }
                            });
                        } else if (actionType === 'DISCUSS' || actionType === 'REFLECT' || actionType === 'COLLABORATE') {
                            contentBlocks.push({
                                id: `module-${modIdx}-action-${actionIdx}-discussion`,
                                type: 'discussion',
                                content: (action?.discussion_prompts || action?.reflection_prompts || []).join('\n') || action?.description || action?.content || 'Discussion prompt',
                                metadata: {
                                    facilitation_notes: action?.facilitation_notes
                                }
                            });
                        } else {
                            const detailContent = [
                                action?.description,
                                Array.isArray(action?.key_points) && action.key_points.length ? `Key Points:\n${action.key_points.map((point: string) => `- ${point}`).join('\n')}` : '',
                                Array.isArray(action?.instructions) && action.instructions.length ? `Instructions:\n${action.instructions.map((step: string) => `- ${step}`).join('\n')}` : '',
                                Array.isArray(action?.key_takeaways) && action.key_takeaways.length ? `Takeaways:\n${action.key_takeaways.map((point: string) => `- ${point}`).join('\n')}` : ''
                            ].filter(Boolean).join('\n\n');

                            contentBlocks.push({
                                id: `module-${modIdx}-action-${actionIdx}-text`,
                                type: 'text',
                                content: detailContent || 'Activity details will appear here.',
                                metadata: {
                                    duration_minutes: action?.duration_minutes,
                                    action_type: actionType || 'EXPLAIN'
                                }
                            });
                        }
                    });

                    if (mod.assignment) {
                        contentBlocks.push({
                            id: `module-assignment-${modIdx}`,
                            type: 'heading',
                            content: mod.assignment.title || `Assignment ${modIdx + 1}`,
                            metadata: { level: 2 }
                        });
                        contentBlocks.push({
                            id: `module-assignment-body-${modIdx}`,
                            type: 'text',
                            content: mod.assignment.description || 'Assignment details',
                            metadata: {
                                deliverables: mod.assignment.deliverables || [],
                                rubric: mod.assignment.rubric || []
                            }
                        });
                    }

                    return {
                        title: mod.title,
                        order: modIdx,
                        status: 'draft',
                        content_blocks: contentBlocks
                    };
                });

                await fetch(`${BACKEND_URL}/api/v1/courses/${createdCourse.id}/modules`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(modulesPayload)
                });
            }

            const syllabusPayload = {
                title: `Syllabus: ${courseData.title}`,
                overview: agenda?.tagline || courseData.description,
                learning_outcomes: parsedContent?.learning_objectives || agenda?.program_learning_outcomes || [],
                assessment_strategy: agenda?.assessment_strategy || {
                    quizzes: 20,
                    assignments: 30,
                    project: 30,
                    capstone: 20
                },
                resources: [],
                sections: (agenda?.modules || []).map((mod: any, idx: number) => ({
                    order: idx + 1,
                    title: mod.title,
                    iris_phase: mod.iris_phase || mod.phase || 'immerse',
                    week_number: mod.week || idx + 1,
                    topics: mod.learning_goals || [],
                    activities: (mod.session_schedule || mod.teaching_actions || []).map((a: any) => a.title),
                    assessment: mod.assignment?.title || 'Quiz',
                    duration_hours: mod.duration_hours || 2
                }))
            };

            await fetch(`${BACKEND_URL}/api/v1/courses/${createdCourse.id}/syllabus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(syllabusPayload)
            });

            if (agenda?.modules?.length) {
                const puckData = buildPuckDataFromAgenda(agenda);
                await fetch(`${BACKEND_URL}/api/v1/puck/courses/${createdCourse.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ puck_data: puckData })
                });
            }

            router.push(`/instructor/builder/${createdCourse.id}`);
        } catch (error) {
            console.error('Failed to create AI-generated course:', error);
            alert('Failed to create AI-generated course. Please try again.');
        }
    };

    const handleSmartCourseCreated = (courseData: any) => {
        if (courseData.approval_status === 'draft') {
            // Redirect to Editor for Drafts
            router.push(`/courses/${courseData.id}/editor`);
        } else {
            // Success Message & Redirect to Dashboard for Published
            setShowSuccess(true);
            setTimeout(() => {
                router.push('/instructor');
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/instructor" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <Logo />
                    </div>
                </div>
            </header>

            {showSuccess && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Course Created Successfully!</h3>
                        <p className="text-gray-600">Redirecting to dashboard...</p>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Create New Course</h1>
                    <p className="text-xl text-gray-500">Choose how you'd like to create your course</p>
                </div>

                {/* Mode Selector */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {/* Smart Wizard - NEW! */}
                    <button
                        onClick={() => setMode('smart')}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all relative ${mode === 'smart'
                            ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-lg shadow-purple-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                            }`}
                    >
                        <Wand2 size={20} />
                        Smart Wizard
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
                            NEW
                        </span>
                    </button>

                    {/* AI Generation */}
                    <button
                        onClick={() => setMode('ai')}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${mode === 'ai'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                            }`}
                    >
                        <Sparkles size={20} />
                        AI from Topic
                    </button>

                    {/* Manual Form */}
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${mode === 'manual'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30'
                            }`}
                    >
                        <FileEdit size={20} />
                        Manual Form
                    </button>
                </div>

                {/* Mode Description */}
                <div className="text-center mb-8">
                    {mode === 'smart' && (
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            <span className="font-semibold text-purple-600">Alexandria AI:</span> Upload your slides, PDFs, or images and let AI extract the structure,
                            generate teaching agendas with activities, quizzes, and publish instantly.
                        </p>
                    )}
                    {mode === 'ai' && (
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Enter a topic and AI will generate a complete IRIS-aligned course structure.
                        </p>
                    )}
                    {mode === 'manual' && (
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Fill out the form manually to create a new course with full control.
                        </p>
                    )}
                </div>

                {/* Render Selected Mode */}
                {mode === 'smart' && (
                    <SmartCourseWizard
                        onCourseCreated={handleSmartCourseCreated}
                        onCancel={() => router.push('/instructor')}
                    />
                )}

                {mode === 'manual' && (
                    <CourseCreationForm
                        onSubmit={handleManualSubmit}
                        onCancel={() => router.push('/instructor')}
                    />
                )}

                {mode === 'ai' && (
                    <AICourseGenerator
                        onCourseGenerated={(courseData) => {
                            handleAICourseCreated(courseData);
                        }}
                    />
                )}
            </main>
        </div>
    );
}


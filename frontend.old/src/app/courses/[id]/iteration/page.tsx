'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import CloudIDE from '@/components/CloudIDE';
import { Loader2, Code2, AlertCircle } from 'lucide-react';

export default function IterationPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = parseInt(params.id as string);

    const [projectId, setProjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            if (!user || !courseId) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${user.id}/projects`);
                if (!response.ok) throw new Error('Failed to fetch projects');

                const projects = await response.json();
                const currentProject = projects.find((p: any) => p.course_id === courseId);

                if (currentProject) {
                    setProjectId(currentProject.id.toString());
                } else {
                    // Ideally, enrollment should have created a project.
                    // If not, we might need to handle this edge case (e.g., auto-create or show error).
                    setError('No active project found for this course. Please ensure you are enrolled.');
                }
            } catch (err: any) {
                console.error('Error fetching project:', err);
                setError(err.message || 'Failed to load project context');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProject();
    }, [user, courseId]);

    const handleImplementationSuccess = () => {
        // Handle completion logic, maybe redirect to next phase or show success modal
        alert('Implementation submitted successfully!');
        // Optional: router.push(`/courses/${courseId}/scale`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Access Error</h3>
                <p className="text-gray-600">{error}</p>
                <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Return to Course
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Code2 className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Iteration Phase</h1>
                        <p className="text-gray-500">Build and refine your solution using the Cloud IDE</p>
                    </div>
                </div>
            </div>

            {projectId ? (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 overflow-hidden">
                        <CloudIDE
                            projectId={projectId}
                            onSuccess={handleImplementationSuccess}
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs font-bold">i</span>
                        </div>
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">About this Environment</p>
                            <p>This Cloud IDE is pre-configured for your project. Your code is automatically backed up every 30 seconds. Click "Submit" when you're ready to proceed to the next phase.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Project workspace initialization failed.</p>
                </div>
            )}
        </div>
    );
}

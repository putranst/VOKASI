'use client';

/**
 * @deprecated This page redirects to /iteration as part of NUSA Framework migration.
 * CDIO Implement → IRIS Iteration
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ImplementPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    // NUSA Framework Migration: Redirect to IRIS Iteration phase
    useEffect(() => {
        router.replace(`/courses/${courseId}/iteration`);
    }, [courseId, router]);

    // Show loading while redirecting
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to IRIS Iteration phase...</p>
                <p className="text-sm text-gray-400 mt-2">CDIO Implement → IRIS Iteration</p>
            </div>
        </div>
    );
}

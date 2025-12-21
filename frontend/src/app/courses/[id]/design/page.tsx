'use client';

/**
 * @deprecated This page redirects to /reflection as part of NUSA Framework migration.
 * CDIO Design → IRIS Reflection
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DesignPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    // NUSA Framework Migration: Redirect to IRIS Reflection phase
    useEffect(() => {
        router.replace(`/courses/${courseId}/reflection`);
    }, [courseId, router]);

    // Show loading while redirecting
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to IRIS Reflection phase...</p>
                <p className="text-sm text-gray-400 mt-2">CDIO Design → IRIS Reflection</p>
            </div>
        </div>
    );
}

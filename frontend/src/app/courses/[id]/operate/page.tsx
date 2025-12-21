'use client';

/**
 * @deprecated This page redirects to /scale as part of NUSA Framework migration.
 * CDIO Operate → IRIS Scale
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OperatePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    // NUSA Framework Migration: Redirect to IRIS Scale phase
    useEffect(() => {
        router.replace(`/courses/${courseId}/scale`);
    }, [courseId, router]);

    // Show loading while redirecting
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to IRIS Scale phase...</p>
                <p className="text-sm text-gray-400 mt-2">CDIO Operate → IRIS Scale</p>
            </div>
        </div>
    );
}

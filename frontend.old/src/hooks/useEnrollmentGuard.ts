'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

interface GuardState {
    checking: boolean;
    enrolled: boolean;
}

/**
 * Checks if the current user is enrolled in the given course.
 * Redirects to the course detail page if not enrolled.
 */
export function useEnrollmentGuard(courseId: number): GuardState {
    const { user } = useAuth();
    const router = useRouter();
    const [state, setState] = useState<GuardState>({ checking: true, enrolled: false });

    useEffect(() => {
        if (!user) {
            router.replace(`/login?redirect=/courses/${courseId}/learn`);
            return;
        }

        const check = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/enrollments/check?user_id=${user.id}&course_id=${courseId}`
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data.enrolled) {
                        setState({ checking: false, enrolled: true });
                    } else {
                        router.replace(`/courses/${courseId}`);
                    }
                } else {
                    router.replace(`/courses/${courseId}`);
                }
            } catch {
                router.replace(`/courses/${courseId}`);
            }
        };

        check();
    }, [user, courseId, router]);

    return state;
}

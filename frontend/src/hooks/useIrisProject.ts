'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';

export interface IrisProject {
    id: number;
    course_id: number;
    user_id: number;
    current_phase: string;
    overall_status: string;
    completion_percentage: number;
}

interface State {
    project: IrisProject | null;
    loading: boolean;
    error: string | null;
}

/**
 * Fetches the existing IRIS project for this user+course, or creates one on demand.
 * All IRIS phase pages should use this to get a stable project_id before submitting.
 */
export function useIrisProject(courseId: number): State {
    const { user } = useAuth();
    const [state, setState] = useState<State>({ project: null, loading: true, error: null });

    const resolve = useCallback(async () => {
        if (!user) {
            setState({ project: null, loading: false, error: 'Not authenticated' });
            return;
        }

        try {
            // 1. Try to find an existing project
            const listRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}/projects?user_id=${user.id}`
            );
            if (listRes.ok) {
                const projects: IrisProject[] = await listRes.json();
                if (projects.length > 0) {
                    setState({ project: projects[0], loading: false, error: null });
                    return;
                }
            }

            // 2. None found — create one
            const createRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/projects`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        course_id: courseId,
                        project_title: `IRIS Project — Course ${courseId}`,
                    }),
                }
            );

            if (createRes.ok) {
                const created: IrisProject = await createRes.json();
                setState({ project: created, loading: false, error: null });
            } else {
                const data = await createRes.json().catch(() => ({}));
                setState({ project: null, loading: false, error: data.detail || 'Failed to create project' });
            }
        } catch (err) {
            setState({ project: null, loading: false, error: 'Network error — could not load project' });
        }
    }, [user, courseId]);

    useEffect(() => { resolve(); }, [resolve]);

    return state;
}

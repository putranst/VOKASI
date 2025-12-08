'use client';

import React, { useState } from 'react';
import { Check, Loader2, LogOut } from 'lucide-react';

interface EnrollmentButtonProps {
    courseId: number;
    userId: number;
    isEnrolled: boolean;
    enrollmentId?: number;
    onEnrollmentChange?: (enrolled: boolean) => void;
}

export const EnrollmentButton: React.FC<EnrollmentButtonProps> = ({
    courseId,
    userId,
    isEnrolled: initialEnrolled,
    enrollmentId: initialEnrollmentId,
    onEnrollmentChange
}) => {
    const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
    const [enrollmentId, setEnrollmentId] = useState(initialEnrollmentId);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleEnroll = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    course_id: courseId
                })
            });

            if (response.ok) {
                const enrollment = await response.json();
                setIsEnrolled(true);
                setEnrollmentId(enrollment.id);
                onEnrollmentChange?.(true);
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to enroll');
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            alert('Failed to enroll. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async () => {
        if (!enrollmentId) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/enrollments/${enrollmentId}`, {
                method: 'DELETE'
            });

            if (response.ok || response.status === 204) {
                setIsEnrolled(false);
                setEnrollmentId(undefined);
                setShowConfirm(false);
                onEnrollmentChange?.(false);
            } else {
                alert('Failed to unenroll');
            }
        } catch (error) {
            console.error('Unenrollment error:', error);
            alert('Failed to unenroll. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isEnrolled) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                    <Check size={20} />
                    Enrolled
                </button>

                {showConfirm && (
                    <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-10 min-w-[280px]">
                        <p className="text-sm font-bold text-gray-900 mb-3">
                            Are you sure you want to unenroll?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnenroll}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <LogOut size={16} />
                                )}
                                Unenroll
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    Enrolling...
                </>
            ) : (
                'Enroll Now'
            )}
        </button>
    );
};

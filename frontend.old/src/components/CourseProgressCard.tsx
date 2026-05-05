import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface DashboardCourseProgress {
    course_id: number;
    title: string;
    image: string;
    category?: string;
    progress: number;
    current_phase: string;
    next_deadline?: string;
    remaining_time?: string;
}

interface CourseProgressCardProps {
    course: DashboardCourseProgress;
}

import confetti from 'canvas-confetti';

// ... existing imports

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({ course }) => {
    const handleCelebrate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    return (
        <Link href={`/courses/${course.course_id}/learn`} className="group block bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
            <div className="flex gap-5">
                <div className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    {course.progress === 100 && (
                        <button
                            onClick={handleCelebrate}
                            className="absolute bottom-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-yellow-500 hover:scale-110 transition-transform shadow-sm z-10"
                            title="Celebrate!"
                        >
                            <span className="text-xs">🎉</span>
                        </button>
                    )}
                </div>
                <div className="flex-1 py-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            {course.category && (
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                                    {course.category}
                                </span>
                            )}
                            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowRight size={14} />
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                            <span>{course.progress}% Complete</span>
                            <span>{course.remaining_time || 'Self-paced'}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-purple-600'}`}
                                style={{ width: `${course.progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

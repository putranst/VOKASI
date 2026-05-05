import React from 'react';
import Link from 'next/link';
import { PlayCircle, Star, Clock } from 'lucide-react';

export interface Course {
    id: number;
    title: string;
    instructor?: string;
    org?: string;
    rating?: number;
    students_count?: string;
    image?: string;
    tag?: string;
    level?: string;
    category?: string;
    description?: string;
    duration?: string;
}

interface CourseCardProps {
    course: Course;
}

const StarRating = ({ rating, count }: { rating: number; count: string }) => (
    <div className="flex items-center gap-1 text-xs font-bold">
        <span className="text-primary mr-1">{rating}</span>
        <div className="flex text-gold">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} fill={i < Math.floor(rating) ? "currentColor" : "none"} />
            ))}
        </div>
        <span className="text-gray-400 font-normal ml-1">({count})</span>
    </div>
);

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const isComingSoon = course.tag === 'Coming Soon';

    const card = (
        <div className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full ${isComingSoon ? 'opacity-70 cursor-not-allowed' : 'hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 cursor-pointer hover:-translate-y-1'}`}>
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10" />
                <img
                    src={course.image || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80'}
                    alt={course.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isComingSoon ? 'grayscale' : 'transform group-hover:scale-110'}`}
                />
                {isComingSoon ? (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <span className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                            <Clock size={11} />
                            Coming Soon
                        </span>
                    </div>
                ) : (
                    <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-800 shadow-sm">
                        {course.level || 'Beginner'}
                    </div>
                )}
                <div className="absolute bottom-3 left-3 z-20">
                    <span className="text-[10px] font-bold text-white bg-primary/90 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm">
                        {course.org || 'VOKASI'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-500 font-medium line-clamp-1">{course.instructor}</p>
                    {isComingSoon ? (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Coming Soon</span>
                    ) : course.tag ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">{course.tag}</span>
                    ) : null}
                </div>

                <h3 className={`font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2 ${isComingSoon ? '' : 'group-hover:text-primary transition-colors'}`}>
                    {course.title}
                </h3>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    {isComingSoon ? (
                        <span className="text-xs text-gray-400 italic">Enrollment opening soon</span>
                    ) : (
                        <>
                            <StarRating rating={course.rating ?? 0} count={course.students_count ?? '0'} />
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <PlayCircle size={18} fill="currentColor" className="text-primary" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    if (isComingSoon) return <div className="block h-full">{card}</div>;
    return <Link href={`/courses/${course.id}`} className="block h-full">{card}</Link>;
};

import React from 'react';
import { PlayCircle, Star } from 'lucide-react';

export interface Course {
    id: number;
    title: string;
    instructor: string;
    org: string;
    rating: number;
    students_count: string;
    image: string;
    tag?: string;
    level: string;
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

import Link from 'next/link';

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => (
    <Link href={`/courses/${course.id}`} className="block h-full">
        <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10" />
                <img src={course.image} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-800 shadow-sm">
                    {course.level}
                </div>
                <div className="absolute bottom-3 left-3 z-20">
                    <span className="text-[10px] font-bold text-white bg-primary/90 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm">
                        {course.org}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-500 font-medium line-clamp-1">{course.instructor}</p>
                    {course.tag && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">{course.tag}</span>}
                </div>

                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                </h3>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <StarRating rating={course.rating} count={course.students_count} />
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <PlayCircle size={18} fill="currentColor" className="text-primary" />
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

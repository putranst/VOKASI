'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/AuthContext';
import {
    ArrowLeft, Mail, Award, Calendar, BookOpen, Users,
    Star, Edit2, LogOut
} from 'lucide-react';

export default function InstructorProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const instructorData = {
        name: 'Mats Hanson',
        title: 'Senior Instructor',
        org: 'TSEA-X Institute',
        email: 'mats.hanson@tsea-x.edu',
        joinDate: 'January 2022',
        bio: 'Passionate educator specializing in AI and sustainable technology. Over 10 years of experience in training professionals and students across Southeast Asia.',
        stats: {
            totalStudents: 1248,
            coursesCreated: 8,
            avgRating: 4.8,
            completionRate: 78
        },
        courses: [
            { id: 9, title: 'AI for SMEs: Practical Implementation', students: 450 },
            { id: 11, title: 'Cyber Security Fundamentals', students: 320 },
            { id: 2, title: 'Blue Carbon: Marine Conservation Strategies', students: 180 },
        ],
        achievements: [
            { id: 1, title: 'Top Rated Instructor 2024', icon: '🏆' },
            { id: 2, title: '1000+ Students Trained', icon: '🎓' },
            { id: 3, title: 'Course Innovation Award', icon: '💡' },
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/instructor" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <Logo />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600"></div>
                    <div className="px-8 pb-8">
                        <div className="flex items-end justify-between -mt-16 mb-6">
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-5xl border-4 border-white shadow-xl">
                                MH
                            </div>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                                <Edit2 size={16} />
                                Edit Profile
                            </button>
                        </div>

                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-1">{instructorData.name}</h1>
                            <p className="text-lg text-gray-600 mb-2">{instructorData.title} • {instructorData.org}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <span className="flex items-center gap-2">
                                    <Mail size={16} />
                                    {instructorData.email}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    Joined {instructorData.joinDate}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <p className="text-gray-700">{instructorData.bio}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 w-fit mx-auto mb-3">
                            <Users size={24} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-1">{instructorData.stats.totalStudents}</h3>
                        <p className="text-sm text-gray-500 font-medium">Total Students</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <div className="p-3 rounded-xl bg-purple-50 text-purple-600 w-fit mx-auto mb-3">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-1">{instructorData.stats.coursesCreated}</h3>
                        <p className="text-sm text-gray-500 font-medium">Courses Created</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600 w-fit mx-auto mb-3">
                            <Star size={24} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-1">{instructorData.stats.avgRating}</h3>
                        <p className="text-sm text-gray-500 font-medium">Avg. Rating</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <div className="p-3 rounded-xl bg-green-50 text-green-600 w-fit mx-auto mb-3">
                            <Award size={24} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-1">{instructorData.stats.completionRate}%</h3>
                        <p className="text-sm text-gray-500 font-medium">Completion Rate</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* My Courses */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="text-primary" size={20} />
                            My Courses
                        </h2>
                        <div className="space-y-3">
                            {instructorData.courses.map((course) => (
                                <div key={course.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{course.title}</h3>
                                    <p className="text-xs text-gray-500">{course.students} students enrolled</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Award className="text-primary" size={20} />
                            Achievements
                        </h2>
                        <div className="space-y-3">
                            {instructorData.achievements.map((achievement) => (
                                <div key={achievement.id} className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{achievement.icon}</span>
                                        <p className="font-bold text-gray-900">{achievement.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

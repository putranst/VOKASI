'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { InboxDrawer } from '@/components/ui/InboxDrawer';
import { useAuth } from '@/lib/AuthContext';
import { Users, TrendingUp, BookOpen, LogOut, Search, Filter } from 'lucide-react';

export default function MyStudentsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('students');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Mock student data
    const students = [
        { id: 101, name: 'Alice Chen', email: 'alice@example.com', courses: ['AI for SMEs'], progress: 85, lastActive: '2 hours ago', status: 'Active' },
        { id: 102, name: 'Bob Martinez', email: 'bob@example.com', courses: ['AI for SMEs', 'Cyber Security'], progress: 62, lastActive: '1 day ago', status: 'Active' },
        { id: 103, name: 'Charlie Kim', email: 'charlie@example.com', courses: ['Cyber Security'], progress: 45, lastActive: '3 days ago', status: 'At Risk' },
        { id: 104, name: 'Diana Zhang', email: 'diana@example.com', courses: ['AI for SMEs'], progress: 92, lastActive: '1 hour ago', status: 'Excellent' },
        { id: 105, name: 'Ethan Brown', email: 'ethan@example.com', courses: ['Blue Carbon'], progress: 38, lastActive: '5 days ago', status: 'At Risk' },
    ];

    const filteredStudents = students.filter(s =>
        (filterCourse === 'all' || s.courses.includes(filterCourse)) &&
        (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/">
                            <Logo />
                        </Link>
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            Instructor Mode
                        </div>
                        <nav className="hidden lg:flex items-center gap-8">
                            <NavItem label="Overview" active={activeTab === 'overview'} href="/instructor" />
                            <NavItem label="My Students" active={activeTab === 'students'} href="/instructor/students" />
                            <NavItem label="Grading" active={activeTab === 'grading'} href="/instructor/grading" />
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                            <InboxDrawer />
                            <NotificationPopover />
                        </div>

                        <Link href="/instructor/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                MH
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden md:block">Mats Hanson</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">My Students</h1>
                    <p className="text-gray-600">Track student progress and engagement across all your courses.</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search students by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-gray-400" />
                            <select
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white font-medium"
                            >
                                <option value="all">All Courses</option>
                                <option value="AI for SMEs">AI for SMEs</option>
                                <option value="Cyber Security">Cyber Security</option>
                                <option value="Blue Carbon">Blue Carbon</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="text-primary" size={20} />
                            {filteredStudents.length} Student{filteredStudents.length !== 1 && 's'}
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {filteredStudents.map((student) => (
                            <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                            <div className="flex gap-2 mt-2">
                                                {student.courses.map((course, idx) => (
                                                    <span key={idx} className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                                                        {course}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-gray-900">{student.progress}%</div>
                                            <div className="text-xs text-gray-500">Progress</div>
                                        </div>

                                        <div className="text-center">
                                            <div className={`text-xs font-bold px-3 py-1 rounded-full ${student.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                                                student.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {student.status}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{student.lastActive}</div>
                                        </div>

                                        <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-primary to-blue-600 rounded-full h-2 transition-all duration-500"
                                        style={{ width: `${student.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

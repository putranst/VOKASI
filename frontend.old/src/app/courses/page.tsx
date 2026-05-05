'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CourseCard, type Course } from '@/components/ui/CourseCard';
import { CourseCardSkeleton } from '@/components/ui/CourseCardSkeleton';
import { TABBED_COURSES } from '@/lib/data';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/lib/SearchContext';
import { Footer } from '@/components/Footer';

const STATIC_COURSES: Course[] = Object.values(TABBED_COURSES).flat();

export default function CoursesPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [allCourses, setAllCourses] = useState<Course[]>(STATIC_COURSES);
    const itemsPerPage = 8;
    const { searchTerm, setSearchTerm, clearSearch } = useSearch();

    // Fetch live courses from API; fall back to static data on error
    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/`
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const raw = await res.json();
                // Support both paginated { items: [...] } and legacy flat array shapes
                const data: Course[] = Array.isArray(raw) ? raw : (raw.items ?? []);
                // Merge: API courses take priority; supplement with any static courses not returned by API
                const apiIds = new Set(data.map((c: Course) => c.id));
                const staticOnly = STATIC_COURSES.filter(c => !apiIds.has(c.id));
                const merged = [...data, ...staticOnly];
                // Live/enrollable courses first, Coming Soon last
                merged.sort((a, b) => {
                    const aCs = a.tag === 'Coming Soon' ? 1 : 0;
                    const bCs = b.tag === 'Coming Soon' ? 1 : 0;
                    return aCs - bCs;
                });
                setAllCourses(merged);
            } catch {
                setAllCourses(STATIC_COURSES);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Derive categories from live data
    const categories = Array.from(
        new Set(allCourses.map(c => c.category).filter(Boolean) as string[])
    );

    // Filter by category
    const categoryFiltered = activeCategory === "All"
        ? allCourses
        : allCourses.filter(c => c.category === activeCategory);

    // Filter by search term
    const filteredCourses = searchTerm
        ? categoryFiltered.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.instructor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.org || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        : categoryFiltered;

    // Pagination Logic
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        setCurrentPage(1); // Reset to page 1 on category change
    };

    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            <main className="max-w-[70rem] mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Explore Courses</h1>
                        <p className="text-gray-600">
                            {searchTerm
                                ? `Showing results for "${searchTerm}"`
                                : "Discover world-class education from VOKASI partners."
                            }
                        </p>
                    </div>

                    {/* Search bar */}
                    <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
                        <div className="relative w-full group">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-100 border border-transparent rounded-full py-2.5 pl-10 pr-10 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium"
                                placeholder="Search courses..."
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={18} />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Category filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar max-w-full mb-8">
                    <button
                        onClick={() => handleCategoryChange("All")}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === "All" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                        All Courses
                    </button>
                    {categories.map((cat: string) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {Array.from({ length: itemsPerPage }).map((_, i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <>
                        {displayedCourses.length > 0 ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                {displayedCourses.map((course, i) => (
                                    <CourseCard key={`${course.id}-${i}`} course={course} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm
                                        ? `No courses match your search for "${searchTerm}"`
                                        : "No courses available in this category"
                                    }
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-[#5a4a3b] transition-all"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination Controls */}
                {!isLoading && totalPages > 1 && displayedCourses.length > 0 && (
                    <div className="flex justify-center items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

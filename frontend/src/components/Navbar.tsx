'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Menu, X, ChevronRight, LogOut,
    GraduationCap, BookOpen, Sparkles, Code2,
    Globe, Target, TrendingUp,
    Building2, Briefcase, Landmark,
    FileText, HelpCircle, BookMarked,
    Users, Mail, ShieldCheck, Info,
    MessageSquare, Calendar, Flame
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { NavDropdown } from '@/components/ui/NavDropdown';
import { useAuth } from '@/lib/AuthContext';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { InboxDrawer } from '@/components/ui/InboxDrawer';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Menu structure with dropdowns
    const learnItems = [
        { label: 'Career Pathways', href: '/pathways', icon: <GraduationCap size={18} />, description: 'AI-guided career transitions' },
        { label: 'All Courses', href: '/courses', icon: <BookOpen size={18} />, description: 'Browse our course catalog' },
        { label: 'AI Tutor', href: '/ai-tutor', icon: <Sparkles size={18} />, description: 'Get personalized guidance' },
        { label: 'Cloud IDE', href: '/cloud-ide', icon: <Code2 size={18} />, description: 'Build real projects' },
    ];

    const impactItems = [
        { label: 'Hexahelix Model', href: '/hexahelix', icon: <Globe size={18} />, description: 'Our ecosystem approach' },
        { label: 'SDG Alignment', href: '/sdg', icon: <Target size={18} />, description: 'UN Sustainable Development Goals' },
        { label: 'Success Stories', href: '/success-stories', icon: <TrendingUp size={18} />, description: 'Graduate transformations' },
    ];

    const communityItems = [
        { label: 'Discussions', href: '/community', icon: <MessageSquare size={18} />, description: 'Join the conversation' },
        { label: 'Events', href: '/community', icon: <Calendar size={18} />, description: 'Meetups & Hackathons' },
        { label: 'Ekspedisi AI', href: '/community', icon: <Flame size={18} />, description: 'National Leaderboard' },
    ];

    const partnersItems = [
        { label: 'Universities', href: '/partners', icon: <Building2 size={18} />, description: 'Academic partnerships' },
        { label: 'Enterprise', href: '/enterprise', icon: <Briefcase size={18} />, description: 'Corporate training solutions' },
        { label: 'Government', href: '/government', icon: <Landmark size={18} />, description: 'Public sector programs' },
    ];

    const resourcesItems = [
        { label: 'Documentation', href: '/docs', icon: <FileText size={18} />, description: 'Platform guides' },
        { label: 'FAQs', href: '/faq', icon: <HelpCircle size={18} />, description: 'Common questions' },
        { label: 'Blog', href: '/blog', icon: <BookMarked size={18} />, description: 'Insights & updates' },
    ];

    const aboutItems = [
        { label: 'Our Mission', href: '/about', icon: <Info size={18} />, description: 'Why we exist' },
        { label: 'Team', href: '/team', icon: <Users size={18} />, description: 'Meet the people' },
        { label: 'Contact', href: '/contact', icon: <Mail size={18} />, description: 'Get in touch' },
        { label: 'Verify Credential', href: '/verify-credential', icon: <ShieldCheck size={18} />, description: 'Validate certificates' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
            <div className="max-w-[70rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                {/* Left: Logo */}
                <div className="flex-shrink-0">
                    <Link href="/" className="block">
                        <Logo />
                    </Link>
                </div>

                {/* Center: Navigation */}
                <nav className="hidden lg:flex items-center justify-center gap-6 flex-1 mx-8">
                    <NavDropdown label="Learn" items={learnItems} />
                    <NavDropdown label="Impact" items={impactItems} />
                    <NavDropdown label="Community" items={communityItems} />
                    <NavDropdown label="Partners" items={partnersItems} />
                    <NavDropdown label="Resources" items={resourcesItems} />
                    <NavDropdown label="About" items={aboutItems} />
                </nav>

                {/* Right: Auth Actions */}
                <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <InboxDrawer />
                            <NotificationPopover />

                            <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

                            <Link href="/dashboard" className="flex items-center gap-2 hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors hidden md:block"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="text-gray-600 text-sm font-semibold hover:text-primary transition-colors px-2 sm:px-3 py-2">
                                Log In
                            </Link>
                            <Link
                                href="/pathways"
                                className="bg-primary text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-1.5"
                            >
                                <span className="hidden sm:inline">Start Learning</span>
                                <span className="sm:hidden">Start</span>
                                <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="sm:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg animate-slide-up max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                        {/* Learn Section */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Learn</p>
                            <div className="space-y-1">
                                <Link href="/pathways" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Career Pathways</Link>
                                <Link href="/courses" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>All Courses</Link>
                            </div>
                        </div>

                        {/* Impact Section */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Impact</p>
                            <div className="space-y-1">
                                <Link href="/hexahelix" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Hexahelix Model</Link>
                                <Link href="/success-stories" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Success Stories</Link>
                            </div>
                        </div>

                        {/* Community Section */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Community</p>
                            <div className="space-y-1">
                                <Link href="/community" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Discussions</Link>
                                <Link href="/community" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Events</Link>
                                <Link href="/community" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Ekspedisi AI leaderboard</Link>
                            </div>
                        </div>

                        {/* Partners Section */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Partners</p>
                            <div className="space-y-1">
                                <Link href="/partners" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Universities</Link>
                                <Link href="/enterprise" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Enterprise</Link>
                                <Link href="/government" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Government</Link>
                            </div>
                        </div>

                        {/* About Section */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</p>
                            <div className="space-y-1">
                                <Link href="/verify-credential" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Verify Credential</Link>
                                <Link href="/about" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Our Mission</Link>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Auth Section */}
                        {isAuthenticated ? (
                            <div className="space-y-2">
                                <Link href="/dashboard" className="block py-2 px-3 text-primary font-bold hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    My Dashboard
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="block w-full text-left py-2 px-3 text-red-600 font-medium hover:bg-red-50 rounded-lg"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link href="/login" className="block py-2 px-3 text-gray-700 font-semibold hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    Log In
                                </Link>
                                <Link
                                    href="/pathways"
                                    className="block py-3 px-4 bg-primary text-white text-center font-bold rounded-xl"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Start Learning →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

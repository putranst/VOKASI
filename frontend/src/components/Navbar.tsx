'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ChevronRight, LogOut, User as UserIcon } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { useSearch } from '@/lib/SearchContext';
import { useAuth } from '@/lib/AuthContext';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { InboxDrawer } from '@/components/ui/InboxDrawer';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { searchTerm, setSearchTerm } = useSearch();
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link href="/">
                        <Logo />
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        <NavItem label="Hexahelix Model" href="/hexahelix" />
                        <NavItem label="Career Pathways" href="/pathways" />
                        <NavItem label="Partners" href="/partners" />
                        <NavItem label="Enterprise" href="/enterprise" />
                        <NavItem label="Government" href="/government" />
                        <NavItem label="Verify Credential" href="/verify-credential" />
                    </nav>
                </div>

                <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm mx-8">
                    <div className="relative w-full group">
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium"
                            placeholder="Search courses, skills, or mentors..."
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={18} />
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-4">
                            <InboxDrawer />
                            <NotificationPopover />

                            <div className="h-8 w-px bg-gray-200 mx-2"></div>

                            <Link href="/dashboard" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 p-0.5">
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
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="text-gray-600 text-sm font-bold hover:text-primary px-2">
                                Log In
                            </Link>
                            <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#5a4a3b] transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                                Join T6 <ChevronRight size={16} />
                            </button>
                        </>
                    )}
                </div>

                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-600">
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 space-y-4">
                    <div className="flex flex-col gap-4">
                        <Link href="/hexahelix" className="text-gray-600 font-medium">Hexahelix Model</Link>
                        <Link href="/pathways" className="text-gray-600 font-medium">Career Pathways</Link>
                        <Link href="/partners" className="text-gray-600 font-medium">Partners</Link>
                        <Link href="/enterprise" className="text-gray-600 font-medium">Enterprise</Link>
                        <Link href="/government" className="text-gray-600 font-medium">Government</Link>
                        <Link href="/verify-credential" className="text-gray-600 font-medium">Verify Credential</Link>
                        <hr />
                        <hr />
                        {isAuthenticated ? (
                            <>
                                <Link href="/dashboard" className="text-primary font-bold">My Dashboard</Link>
                                <button onClick={handleLogout} className="text-red-600 font-medium text-left">Sign Out</button>
                            </>
                        ) : (
                            <Link href="/login" className="text-gray-600 font-bold">Log In</Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

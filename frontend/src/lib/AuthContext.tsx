'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<User | null>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const login = async (email: string, password: string): Promise<User | null> => {
        try {
            console.log('Attempting login for:', email);
            // Use relative path '/api/...' which works for both:
            // 1. Production (handled by Nginx proxy)
            // 2. Local Dev (handled by Next.js rewrites)
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
            const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Login response status:', response.status);

            if (response.ok) {
                const userData = await response.json();
                console.log('Login successful:', userData);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
            console.warn('Login failed with status:', response.status);
            return null;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        router.push('/login');
    };

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

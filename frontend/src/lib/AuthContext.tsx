'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
    id: number;
    supabase_id?: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithProvider: (provider: 'google' | 'github') => Promise<void>;
    register: (email: string, password: string, name: string, role: string) => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // Sync user to backend database
    const syncUserToBackend = async (supabaseUser: SupabaseUser, name?: string, role?: string): Promise<User | null> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/auth/sync-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supabase_id: supabaseUser.id,
                    email: supabaseUser.email,
                    full_name: name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
                    role: role || supabaseUser.user_metadata?.role || 'student'
                })
            });

            if (response.ok) {
                const userData = await response.json();
                return {
                    id: userData.id,
                    supabase_id: supabaseUser.id,
                    email: userData.email,
                    name: userData.full_name,
                    role: userData.role
                };
            }
            console.error('Failed to sync user to backend');
            return null;
        } catch (error) {
            console.error('Backend sync error:', error);
            return null;
        }
    };

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Get current session
                const { data: { session: currentSession } } = await supabase.auth.getSession();

                if (currentSession?.user) {
                    setSession(currentSession);
                    const syncedUser = await syncUserToBackend(currentSession.user);
                    if (syncedUser) {
                        setUser(syncedUser);
                        localStorage.setItem('user', JSON.stringify(syncedUser));
                    }
                } else {
                    // Check localStorage for persisted user (fallback for demo mode)
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state changed:', event);
            setSession(newSession);

            if (event === 'SIGNED_IN' && newSession?.user) {
                const syncedUser = await syncUserToBackend(newSession.user);
                if (syncedUser) {
                    setUser(syncedUser);
                    localStorage.setItem('user', JSON.stringify(syncedUser));
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('user');
            } else if (event === 'PASSWORD_RECOVERY') {
                // Redirect to password reset page
                router.push('/reset-password');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Try Supabase Auth first
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                // Fallback to backend demo login if Supabase fails
                console.log('Supabase auth failed, trying backend login...');
                const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const userData = await response.json();
                    const user: User = {
                        id: userData.id,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role
                    };
                    setUser(user);
                    localStorage.setItem('user', JSON.stringify(user));
                    return { success: true };
                }
                return { success: false, error: error.message || 'Invalid email or password' };
            }

            if (data.user) {
                const syncedUser = await syncUserToBackend(data.user);
                if (syncedUser) {
                    setUser(syncedUser);
                    localStorage.setItem('user', JSON.stringify(syncedUser));
                }
                return { success: true };
            }

            return { success: false, error: 'Login failed' };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'An error occurred' };
        }
    };

    const loginWithProvider = async (provider: 'google' | 'github'): Promise<void> => {
        const redirectTo = typeof window !== 'undefined'
            ? `${window.location.origin}/login`
            : 'http://localhost:3000/login';

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo
            }
        });

        if (error) {
            console.error('OAuth error:', error);
            throw error;
        }
    };

    const register = async (
        email: string,
        password: string,
        name: string,
        role: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: role
                    }
                }
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                // Sync to backend
                const syncedUser = await syncUserToBackend(data.user, name, role);
                if (syncedUser) {
                    setUser(syncedUser);
                    localStorage.setItem('user', JSON.stringify(syncedUser));
                }
                return { success: true };
            }

            return { success: false, error: 'Registration failed' };
        } catch (error: any) {
            return { success: false, error: error.message || 'An error occurred' };
        }
    };

    const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const redirectTo = typeof window !== 'undefined'
                ? `${window.location.origin}/reset-password`
                : 'http://localhost:3000/reset-password';

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'An error occurred' };
        }
    };

    const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'An error occurred' };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            login,
            loginWithProvider,
            register,
            resetPassword,
            updatePassword,
            logout,
            isAuthenticated: !!user
        }}>
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

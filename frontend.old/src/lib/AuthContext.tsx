'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// ── AM-002: Auth token helper (Edge middleware reads this for session evidence)
// Note: For production, backend should set HttpOnly cookies. This is a client-side
// fallback for demo mode. Role is NOT stored in cookies - authorization is server-side.
function setAuthToken(token: string): void {
    if (typeof document === 'undefined') return;
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthToken(): void {
    if (typeof document === 'undefined') return;
    document.cookie = 'auth_token=; path=/; max-age=0';
}

interface User {
    id: number;
    supabase_id?: string;
    email: string;
    name: string;
    role: string;
    institution_id?: number;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithProvider: (provider: 'google' | 'github', roleHint?: string) => Promise<void>;
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

    const explicitBackendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        '';
    const BACKEND_URL = explicitBackendUrl.replace(/\/+$/, '');

    const buildApiUrls = (path: string): string[] => {
        const urls = BACKEND_URL
            ? [`${BACKEND_URL}${path}`, path]
            : [path];
        return Array.from(new Set(urls));
    };

    // Sync user to backend database
    const syncUserToBackend = async (supabaseUser: SupabaseUser, name?: string, role?: string): Promise<User | null> => {
        try {
            const payload = {
                supabase_id: supabaseUser.id,
                email: supabaseUser.email,
                full_name: name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
                role: role || supabaseUser.user_metadata?.role || 'student'
            };

            for (const url of buildApiUrls('/api/v1/auth/sync-user')) {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        return {
                            id: userData.id,
                            supabase_id: supabaseUser.id,
                            email: userData.email,
                            name: userData.full_name,
                            role: userData.role,
                            institution_id: userData.institution_id
                        };
                    }
                } catch {
                    continue;
                }
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
                    const pendingRole = localStorage.getItem('pending_oauth_role') || undefined;
                    const syncedUser = await syncUserToBackend(currentSession.user, undefined, pendingRole);
                    if (syncedUser) {
                        setUser(syncedUser);
                        localStorage.setItem('user', JSON.stringify(syncedUser));
                        // Role is not stored in cookies - authorization is server-side
                    }
                    localStorage.removeItem('pending_oauth_role');
                } else {
                    // Check localStorage for persisted user (fallback for demo mode)
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        setUser(user);
                        // Restore auth token if exists
                        const existingToken = localStorage.getItem('token');
                        if (existingToken) {
                            setAuthToken(existingToken);
                        }
                        // Generate fallback devtoken if none exists (for existing sessions)
                        if (!localStorage.getItem('token') && user.id && user.role) {
                            const fallbackToken = `devtoken:${user.id}:${user.role}`;
                            localStorage.setItem('token', fallbackToken);
                            setAuthToken(fallbackToken);
                        }
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
                const pendingRole = localStorage.getItem('pending_oauth_role') || undefined;
                const syncedUser = await syncUserToBackend(newSession.user, undefined, pendingRole);
                if (syncedUser) {
                    setUser(syncedUser);
                    localStorage.setItem('user', JSON.stringify(syncedUser));
                    // Role is not stored in cookies - authorization is server-side
                }
                localStorage.removeItem('pending_oauth_role');
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('user');
                clearAuthToken();
            } else if (event === 'PASSWORD_RECOVERY') {
                // Redirect to password reset page
                router.push('/reset-password');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Check if Supabase is properly configured (not placeholder)
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const supabaseConfigured = supabaseUrl &&
                supabaseUrl.includes('supabase.co') &&
                !supabaseUrl.includes('placeholder') &&
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder');

            let supabaseError = null;

            if (supabaseConfigured) {
                try {
                    // Try Supabase Auth first
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (!error && data.user) {
                        const syncedUser = await syncUserToBackend(data.user);
                        if (syncedUser) {
                            setUser(syncedUser);
                            localStorage.setItem('user', JSON.stringify(syncedUser));
                        }
                        return { success: true };
                    }
                    supabaseError = error;
                } catch (networkError: any) {
                    console.log('Supabase unavailable, using backend auth...', networkError.message);
                    supabaseError = networkError;
                }
            } else {
                console.log('Supabase not configured, using backend auth...');
            }

            // Fallback to backend demo login
            console.log('Using backend authentication...');
            try {
                let backendAuthError = '';

                for (const url of buildApiUrls('/api/v1/auth/login')) {
                    try {
                        const response = await fetch(url, {
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
                                role: userData.role,
                                institution_id: userData.institution_id
                            };
                            setUser(user);
                            localStorage.setItem('user', JSON.stringify(user));
                            // Store backend access token for admin API calls
                            if (userData.access_token) {
                                localStorage.setItem('token', userData.access_token);
                                setAuthToken(userData.access_token);
                            }
                            return { success: true };
                        }

                        const errorData = await response.json().catch(() => ({}));
                        backendAuthError = errorData.detail || errorData.message || backendAuthError;
                    } catch {
                        continue;
                    }
                }

                return {
                    success: false,
                    error: backendAuthError || supabaseError?.message || 'Invalid email or password'
                };
            } catch (backendError: any) {
                console.error('Backend login error:', backendError);
                return {
                    success: false,
                    error: supabaseError?.message || 'Unable to connect to authentication service. Please check your connection.'
                };
            }
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    };

    const loginWithProvider = async (provider: 'google' | 'github', roleHint?: string): Promise<void> => {
        // Check if Supabase is properly configured (not placeholder)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseConfigured = supabaseUrl &&
            supabaseUrl.includes('supabase.co') &&
            !supabaseUrl.includes('placeholder') &&
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
            !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder');

        if (!supabaseConfigured) {
            throw new Error('SSO not configured. Please use email/password registration or set up Supabase credentials in .env.local');
        }

        const redirectTo = typeof window !== 'undefined'
            ? `${window.location.origin}/login`
            : 'http://localhost:3000/login';

        if (roleHint) {
            localStorage.setItem('pending_oauth_role', roleHint);
        }

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
        // Check if Supabase is properly configured (not placeholder)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseConfigured = supabaseUrl &&
            supabaseUrl.includes('supabase.co') &&
            !supabaseUrl.includes('placeholder') &&
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
            !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder');

        if (supabaseConfigured) {
            // Use Supabase Auth
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
        }

        // Fallback: Backend-only registration (demo mode)
        console.log('Supabase not configured, using backend registration...');
        try {
            for (const url of buildApiUrls('/api/v1/auth/register')) {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, name, role })
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        const user: User = {
                            id: userData.id,
                            email: userData.email,
                            name: userData.name,
                            role: userData.role,
                            institution_id: userData.institution_id
                        };
                        setUser(user);
                        localStorage.setItem('user', JSON.stringify(user));
                        if (userData.access_token) {
                            localStorage.setItem('token', userData.access_token);
                            setAuthToken(userData.access_token);
                        }
                        return { success: true };
                    }

                    const errorData = await response.json().catch(() => ({}));
                    if (errorData.detail || errorData.message) {
                        return { success: false, error: errorData.detail || errorData.message };
                    }
                } catch {
                    continue;
                }
            }
            return { success: false, error: 'Registration failed. Please try again.' };
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
        localStorage.removeItem('token');
        clearAuthToken();
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

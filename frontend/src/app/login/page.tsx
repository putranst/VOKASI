'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

// Google Icon Component
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

// GitHub Icon Component
const GitHubIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, loginWithProvider } = useAuth();

    // Check for success messages from redirects
    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage('Account created! Please check your email to verify your account.');
        } else if (searchParams.get('reset') === 'success') {
            setSuccessMessage('Password updated successfully! You can now sign in.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                // Get user from auth context and redirect based on role
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    switch (user.role) {
                        case 'instructor':
                            router.push('/instructor');
                            break;
                        case 'institution':
                            router.push('/partner');
                            break;
                        case 'admin':
                            router.push('/admin');
                            break;
                        case 'student':
                        default:
                            router.push('/dashboard');
                            break;
                    }
                } else {
                    router.push('/dashboard');
                }
            } else {
                setError(result.error || 'Invalid email or password');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during login');
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        try {
            setError('');
            await loginWithProvider(provider);
        } catch (err: any) {
            setError(err.message || `Failed to login with ${provider}`);
        }
    };

    return (
        <div className="min-h-screen w-full overflow-auto relative flex items-center justify-center p-4 pb-safe"
            style={{
                backgroundImage: 'url("https://ekspedisi.tsea.asia/id.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#0c1222',
            }}>

            {/* Gradient Overlay matching Ekspedisi theme */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(12, 18, 34, 0.85) 0%, rgba(15, 23, 42, 0.75) 50%, rgba(30, 20, 40, 0.8) 100%)',
                }}
            />

            {/* Glassmorphism Login Card */}
            <div className="relative z-10 w-full max-w-sm">
                {/* Glass Card with pink/purple edge glow */}
                <div
                    className="backdrop-blur-xl rounded-xl p-4 md:p-5 border border-white/10"
                    style={{
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 28, 50, 0.85) 100%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(168, 85, 247, 0.15), 0 0 100px rgba(236, 72, 153, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                >
                    {/* Header */}
                    <div className="text-center mb-3">
                        <div className="flex justify-center mb-1.5">
                            <Logo dark />
                        </div>
                        <h1 className="text-base md:text-lg font-bold text-white mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Welcome Back
                        </h1>
                        <p className="text-[11px] text-slate-400">
                            Sign in to access your learning dashboard
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-6 backdrop-blur-sm">
                            <CheckCircle size={16} />
                            {successMessage}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-2.5">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                                {error}
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-800/50 border border-slate-600/50 rounded-lg 
                                             focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 focus:bg-slate-800/70
                                             outline-none transition-all text-white placeholder-slate-500
                                             hover:border-slate-500/70 hover:bg-slate-800/60"
                                    placeholder="your.email@example.com"
                                    required
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-11 py-2 text-sm bg-slate-800/50 border border-slate-600/50 rounded-lg 
                                             focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 focus:bg-slate-800/70
                                             outline-none transition-all text-white placeholder-slate-500
                                             hover:border-slate-500/70 hover:bg-slate-800/60"
                                    placeholder="Enter your password"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800/50 text-amber-500 
                                             focus:ring-amber-400/50 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="ml-2 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Sign In Button - Coral/Orange like Ekspedisi */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 rounded-lg font-bold text-sm uppercase tracking-wider
                                     transition-all duration-300 flex items-center justify-center gap-2
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     bg-gradient-to-r from-orange-500 to-rose-500 
                                     hover:from-orange-400 hover:to-rose-400
                                     text-white shadow-lg shadow-orange-500/25
                                     hover:shadow-xl hover:shadow-orange-500/35
                                     hover:-translate-y-0.5 active:translate-y-0"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-2.5">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
                        <span className="px-3 text-[10px] text-slate-500 uppercase tracking-wider">or continue with</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
                    </div>

                    {/* SSO Buttons - White outlined style */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleOAuthLogin('google')}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 
                                     bg-transparent border border-slate-500/50 rounded-lg
                                     hover:bg-white/5 hover:border-slate-400/70 
                                     transition-all duration-200 group"
                        >
                            <GoogleIcon />
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                                Google
                            </span>
                        </button>

                        <button
                            onClick={() => handleOAuthLogin('github')}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 
                                     bg-transparent border border-slate-500/50 rounded-lg
                                     hover:bg-white/5 hover:border-slate-400/70 
                                     transition-all duration-200 group"
                        >
                            <span className="text-slate-300 group-hover:text-white transition-colors">
                                <GitHubIcon />
                            </span>
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                                GitHub
                            </span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 text-center">
                        <p className="text-[11px] text-slate-400">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Badge */}
                <div className="flex justify-center mt-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-gray-400">
                            Protected by blockchain-verified credentials
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Loading fallback for Suspense
function LoginLoading() {
    return (
        <div
            className="min-h-screen w-full overflow-auto flex items-center justify-center py-6 px-4 relative"
            style={{
                backgroundImage: 'url("https://ekspedisi.tsea.asia/id.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#0c1222',
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(12, 18, 34, 0.85) 0%, rgba(15, 23, 42, 0.75) 50%, rgba(30, 20, 40, 0.8) 100%)',
                }}
            />
            <div
                className="relative z-10 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 28, 50, 0.85) 100%)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(168, 85, 247, 0.15), 0 0 100px rgba(236, 72, 153, 0.1)',
                }}
            >
                <div className="flex justify-center mb-4">
                    <Logo dark />
                </div>
                <div className="text-center">
                    <div className="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 mt-4 text-sm">Loading...</p>
                </div>
            </div>
        </div>
    );
}

// Default export with Suspense boundary
export default function LoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginContent />
        </Suspense>
    );
}

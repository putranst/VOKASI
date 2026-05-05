'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/AuthContext';
import { Lock, Eye, EyeOff, Check, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const { updatePassword, session } = useAuth();

    // Check if user came from password reset email
    useEffect(() => {
        // The session should be set by Supabase when user clicks the reset link
        if (!session) {
            // Give it a moment for auth to initialize
            const timeout = setTimeout(() => {
                if (!session) {
                    setError('Invalid or expired reset link. Please request a new one.');
                }
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [session]);

    // Password strength checker
    const getPasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await updatePassword(password);

            if (result.success) {
                setSuccess(true);
                // Redirect to login after a moment
                setTimeout(() => {
                    router.push('/login?reset=success');
                }, 3000);
            } else {
                setError(result.error || 'Failed to update password');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-primary/20 to-accent/20 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-5" />

                <div className="relative w-full max-w-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h2>
                        <p className="text-gray-600 mb-6">
                            Your password has been successfully reset. You can now sign in with your new password.
                        </p>
                        <Link
                            href="/login"
                            className="block w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-[#5a4a3b] transition-colors"
                        >
                            Sign In Now
                        </Link>
                        <p className="text-xs text-gray-500 mt-4">Redirecting automatically...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-primary/20 to-accent/20 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-5" />

            <div className="relative w-full max-w-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <Logo />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-1">Reset Password</h1>
                        <p className="text-sm text-gray-600">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    placeholder="Min. 8 characters"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs ${passwordStrength >= 4 ? 'text-green-600' : passwordStrength >= 3 ? 'text-lime-600' : 'text-gray-500'}`}>
                                        {strengthLabels[passwordStrength - 1] || 'Too weak'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm ${confirmPassword && confirmPassword !== password
                                            ? 'border-red-300 bg-red-50'
                                            : confirmPassword && confirmPassword === password
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-gray-200'
                                        }`}
                                    placeholder="Confirm your new password"
                                    required
                                />
                                {confirmPassword && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {confirmPassword === password ? (
                                            <Check size={16} className="text-green-500" />
                                        ) : (
                                            <AlertCircle size={16} className="text-red-500" />
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password || password !== confirmPassword}
                            className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-[#5a4a3b] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-600">
                            Remember your password?{' '}
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-white/60 text-[10px] mt-4">
                    Protected by blockchain-verified credentials
                </p>
            </div>
        </div>
    );
}

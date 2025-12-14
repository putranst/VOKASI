'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/AuthContext';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);

            if (user) {
                // Role-based redirection
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
                setError('Invalid email or password');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-primary/20 to-accent/20 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-5" />

            <div className="relative w-full max-w-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <Logo />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-1">Welcome Back</h1>
                        <p className="text-sm text-gray-600">Sign in to access your learning dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-2 rounded" />
                                <span className="text-xs text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="text-xs text-primary font-bold hover:underline">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-[#5a4a3b] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-600">
                            Don't have an account?{' '}
                            <a href="#" className="text-primary font-bold hover:underline">
                                Join T6
                            </a>
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

'use client';

import { useState, useEffect } from 'react';
import {
    Users, BookOpen, Award, TrendingUp, Activity,
    Shield, Database, Globe, Settings, AlertCircle,
    CheckCircle, Clock, DollarSign, GraduationCap, Flame, Zap, Trophy,
    BarChart3, FileText, Upload, Download, X, LogOut, UserPlus, KeyRound, Trash2, Palette
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { PageTransition } from '@/components/ui/PageTransition';
import { supabase } from '@/lib/supabase';
import IntegrationsTab from './IntegrationsTab';

interface PlatformStats {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalCredentials: number;
    activeProjects: number;
    completionRate: number;
    revenueThisMonth: number;
    systemHealth: string;
}

interface RecentActivity {
    id: number;
    type: string;
    description: string;
    timestamp: string;
    status: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin' | 'institution_admin';
    status: 'active' | 'suspended' | 'pending';
    joinedDate: string;
    lastActive: string;
    coursesEnrolled: number;
}

// Mock data removed - now fetched from Supabase

interface AdminCourse {
    id: number;
    title: string;
    instructor: string;
    institution: string;
    category: string;
    status: 'published' | 'draft' | 'pending';
    enrollments: number;
    rating: number;
    lastUpdated: string;
}

// Mock data removed - now fetched from Supabase

interface AdminCredential {
    id: string;
    user: string;
    title: string;
    type: 'Professional Certificate' | 'Degree' | 'Badge';
    issuedDate: string;
    status: 'issued' | 'revoked' | 'pending';
    blockchainHash: string;
}

// Mock data removed - now fetched from Supabase

interface SystemLog {
    id: number;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    service: 'api' | 'database' | 'auth' | 'blockchain';
    message: string;
}

const MOCK_LOGS: SystemLog[] = [
    { id: 1, timestamp: "2025-11-28 04:48:12", level: "info", service: "api", message: "GET /api/v1/admin/stats - 200 OK" },
    { id: 2, timestamp: "2025-11-28 04:47:45", level: "success", service: "blockchain", message: "Block #123456 verified successfully" },
    { id: 3, timestamp: "2025-11-28 04:45:22", level: "warning", service: "database", message: "High query latency detected (150ms)" },
    { id: 4, timestamp: "2025-11-28 04:42:10", level: "error", service: "auth", message: "Failed login attempt for user: admin@test.com" },
    { id: 5, timestamp: "2025-11-28 04:40:00", level: "info", service: "api", message: "System backup completed" },
];

// Gamification Stats interface
interface GamificationStats {
    total_xp_distributed: number;
    active_streakers: number;
    average_streak: number;
    seven_day_achievers: number;
    thirty_day_achievers: number;
    total_badges_earned: number;
    top_learners: Array<{
        user_id: number;
        name: string;
        xp: number;
        streak: number;
        level: number;
    }>;
}

// ── BR-003: White-label Branding Tab ──────────────────────────────────────────

const API_BASE_BRANDING = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const PRESET_COLORS = [
    { label: 'VOKASI Emerald', primary: '#064e3b', accent: '#10b981' },
    { label: 'Ocean Blue', primary: '#1e3a5f', accent: '#3b82f6' },
    { label: 'Sunset Orange', primary: '#7c2d12', accent: '#f97316' },
    { label: 'Royal Purple', primary: '#3b0764', accent: '#a855f7' },
    { label: 'Slate Gray', primary: '#0f172a', accent: '#64748b' },
];

function BrandingTab() {
    const [institutionId, setInstitutionId] = useState(1);
    const [primaryColor, setPrimaryColor] = useState('#064e3b');
    const [accentColor, setAccentColor] = useState('#10b981');
    const [faviconUrl, setFaviconUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [platformName, setPlatformName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTheme = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_BRANDING}/api/v1/institution/theme?institution_id=${institutionId}`);
                if (res.ok) {
                    const t = await res.json();
                    if (t.primary_color) setPrimaryColor(t.primary_color);
                    if (t.accent_color) setAccentColor(t.accent_color);
                    if (t.favicon_url) setFaviconUrl(t.favicon_url);
                    if (t.custom_logo_url) setLogoUrl(t.custom_logo_url);
                    if (t.platform_name) setPlatformName(t.platform_name);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchTheme();
    }, [institutionId]);

    const applyPreview = (primary: string, accent: string) => {
        document.documentElement.style.setProperty('--brand-primary', primary);
        document.documentElement.style.setProperty('--brand-accent', accent);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token') || '';
            const res = await fetch(`${API_BASE_BRANDING}/api/v1/institution/theme`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    institution_id: institutionId,
                    primary_color: primaryColor,
                    accent_color: accentColor,
                    favicon_url: faviconUrl || null,
                    custom_logo_url: logoUrl || null,
                    platform_name: platformName || null,
                }),
            });
            if (!res.ok) throw new Error(`Save failed (${res.status})`);
            applyPreview(primaryColor, accentColor);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-400">
                <Activity className="w-5 h-5 animate-spin mr-2" /> Loading theme…
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h2 className="text-xl font-bold text-gray-900">White-label Branding</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Customise colors, logo, favicon, and platform name for your institution. Changes apply instantly across all pages.
                </p>
            </div>

            {/* Color presets */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-violet-500" /> Color Theme
                </h3>
                <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((p) => (
                        <button
                            key={p.label}
                            onClick={() => { setPrimaryColor(p.primary); setAccentColor(p.accent); applyPreview(p.primary, p.accent); }}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium hover:border-violet-300 transition-colors"
                        >
                            <span className="flex gap-1">
                                <span className="h-3 w-3 rounded-full" style={{ background: p.primary }} />
                                <span className="h-3 w-3 rounded-full" style={{ background: p.accent }} />
                            </span>
                            {p.label}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => { setPrimaryColor(e.target.value); applyPreview(e.target.value, accentColor); }}
                                className="h-9 w-9 cursor-pointer rounded-lg border border-gray-200 p-0.5"
                            />
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => { setPrimaryColor(e.target.value); applyPreview(e.target.value, accentColor); }}
                                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono"
                                placeholder="#064e3b"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Accent Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={accentColor}
                                onChange={(e) => { setAccentColor(e.target.value); applyPreview(primaryColor, e.target.value); }}
                                className="h-9 w-9 cursor-pointer rounded-lg border border-gray-200 p-0.5"
                            />
                            <input
                                type="text"
                                value={accentColor}
                                onChange={(e) => { setAccentColor(e.target.value); applyPreview(primaryColor, e.target.value); }}
                                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono"
                                placeholder="#10b981"
                            />
                        </div>
                    </div>
                </div>
                {/* Live swatch preview */}
                <div className="flex gap-3 pt-1">
                    <div className="h-10 flex-1 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ background: primaryColor }}>
                        Primary
                    </div>
                    <div className="h-10 flex-1 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ background: accentColor }}>
                        Accent
                    </div>
                </div>
            </div>

            {/* Logo & favicon */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Logo & Favicon</h3>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Custom Logo URL</label>
                    <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://your-institution.com/logo.png"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                    {logoUrl && (
                        <img src={logoUrl} alt="logo preview" className="mt-2 h-10 rounded object-contain border border-gray-100" />
                    )}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Favicon URL</label>
                    <input
                        type="url"
                        value={faviconUrl}
                        onChange={(e) => setFaviconUrl(e.target.value)}
                        placeholder="https://your-institution.com/favicon.ico"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Platform name */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Platform Name Override</h3>
                <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="Leave blank to use VOKASI"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-400">Replaces "VOKASI" in the browser tab title and nav logo text.</p>
            </div>

            {error && (
                <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</p>
            )}

            <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
                {saving ? <Activity className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Branding'}
            </button>
        </div>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
    const apiUrl = (path: string) => `${backendBase}${path}`;
    const getAuthHeaders = (): Record<string, string> => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : '';
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };
    const [stats, setStats] = useState<PlatformStats>({
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalCredentials: 0,
        activeProjects: 0,
        completionRate: 0,
        revenueThisMonth: 0,
        systemHealth: 'healthy'
    });

    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'credentials' | 'integrations' | 'system' | 'branding'>('overview');
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);

    // User Management State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [users, setUsers] = useState<User[]>([]);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Modal States for Quick Actions
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [reportType, setReportType] = useState<'users' | 'courses' | 'credentials' | 'full'>('full');

    // Logout Handler
    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem('userRole');
            localStorage.removeItem('loggedInUser');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Import Users Handler
    const handleImportUsers = async () => {
        if (!importFile) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').slice(1); // Skip header
            let imported = 0;
            for (const line of lines) {
                const [name, email, role] = line.split(',').map(s => s.trim());
                if (name && email) {
                    try {
                        await fetch(apiUrl('/api/v1/admin/import-user'), {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ name, email, role: role || 'student' })
                        });
                        imported++;
                    } catch (e) { console.error(e); }
                }
            }
            alert(`Imported ${imported} users successfully!`);
            setIsImportModalOpen(false);
            setImportFile(null);
            // Refresh users data
            const usersResponse = await fetch(apiUrl('/api/v1/admin/users'), { headers: getAuthHeaders() });
            if (usersResponse.ok) setUsers(await usersResponse.json());
        };
        reader.readAsText(importFile);
    };

    // Generate Report Handler
    const handleGenerateReport = () => {
        const generateCSV = (data: any[], headers: string[]) => {
            const headerRow = headers.join(',');
            const rows = data.map(item => headers.map(h => `"${item[h] || ''}"`).join(','));
            return [headerRow, ...rows].join('\n');
        };

        let csvContent = '', filename = '';
        const now = new Date().toISOString().split('T')[0];

        if (reportType === 'users' || reportType === 'full') {
            csvContent += '=== USERS REPORT ===\n';
            csvContent += generateCSV(users, ['id', 'name', 'email', 'role', 'status', 'joinedDate']) + '\n\n';
            filename = `vokasi-users-report-${now}.csv`;
        }
        if (reportType === 'courses' || reportType === 'full') {
            csvContent += '=== COURSES REPORT ===\n';
            csvContent += generateCSV(adminCourses, ['id', 'title', 'instructor', 'institution', 'category', 'status', 'enrollments']) + '\n\n';
            filename = reportType === 'full' ? `vokasi-full-report-${now}.csv` : `vokasi-courses-report-${now}.csv`;
        }
        if (reportType === 'credentials' || reportType === 'full') {
            csvContent += '=== CREDENTIALS REPORT ===\n';
            csvContent += generateCSV(adminCredentials, ['id', 'user', 'title', 'type', 'status', 'issuedDate']) + '\n\n';
            filename = reportType === 'full' ? `vokasi-full-report-${now}.csv` : `vokasi-credentials-report-${now}.csv`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        setIsReportModalOpen(false);
    };

    // User Actions
    const handleSuspendUser = async (userId: number) => {
        try {
            const response = await fetch(apiUrl(`/api/v1/admin/users/${userId}/suspend`), {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, status: 'suspended' as const } : user
                ));
            }
        } catch (err) {
            console.error('Failed to suspend user:', err);
        }
    };

    const handleActivateUser = async (userId: number) => {
        try {
            const response = await fetch(apiUrl(`/api/v1/admin/users/${userId}/activate`), {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, status: 'active' as const } : user
                ));
            }
        } catch (err) {
            console.error('Failed to activate user:', err);
        }
    };

    const handleExportUsers = () => {
        const headers = "ID,Name,Email,Role,Status,Joined Date\n";
        const csvContent = users.map(u => `${u.id},${u.name},${u.email},${u.role},${u.status},${u.joinedDate}`).join("\n");
        const blob = new Blob([headers + csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vokasi-users.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleInviteUser = async () => {
        const name = window.prompt('Enter full name for invited user:');
        if (!name) return;
        const email = window.prompt('Enter email for invited user:');
        if (!email) return;
        const role = window.prompt('Enter role (admin, instructor, student, institution_admin):', 'admin') || 'admin';

        try {
            const response = await fetch(apiUrl('/api/v1/admin/users/invite'), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name, email, role })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Failed to invite user');
            }

            if (data.user) {
                setUsers(prev => [data.user, ...prev]);
            }

            alert(`User invited successfully. Temporary password: ${data.temporary_password || '(not provided)'}`);
        } catch (err: any) {
            alert(err?.message || 'Failed to invite user');
        }
    };

    const handleResetUserPassword = async (userId: number, email: string) => {
        const newPasswordInput = window.prompt('Enter new password (min 8 chars) or leave blank to auto-generate:', '');
        if (newPasswordInput === null) return;

        const payload = newPasswordInput.trim()
            ? { new_password: newPasswordInput.trim() }
            : {};

        try {
            const response = await fetch(apiUrl(`/api/v1/admin/users/${userId}/reset-password`), {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Failed to reset password');
            }

            alert(`Password reset for ${email}. New temporary password: ${data.temporary_password || '(not provided)'}`);
        } catch (err: any) {
            alert(err?.message || 'Failed to reset password');
        }
    };

    const handleDeleteUser = async (userId: number, email: string) => {
        const confirmed = window.confirm(`Delete user ${email}? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            const response = await fetch(apiUrl(`/api/v1/admin/users/${userId}`), {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Failed to delete user');
            }

            setUsers(prev => prev.filter(user => user.id !== userId));
        } catch (err: any) {
            alert(err?.message || 'Failed to delete user');
        }
    };

    const openEditUserModal = (user: User) => {
        setSelectedUser(user);
        setIsEditUserModalOpen(true);
    };

    const handleSaveUser = async (updatedUser: User) => {
        try {
            const response = await fetch(apiUrl(`/api/v1/admin/users/${updatedUser.id}`), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    status: updatedUser.status,
                })
            });
            if (response.ok) {
                const saved = await response.json();
                setUsers(users.map(user => user.id === updatedUser.id ? saved : user));
            }
        } catch (err) {
            console.error('Failed to save user:', err);
        }
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
    };

    // Course Management State
    const [courseSearch, setCourseSearch] = useState('');
    const [courseStatusFilter, setCourseStatusFilter] = useState<string>('all');
    const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);

    // Course Actions
    const handleApproveCourse = async (courseId: number) => {
        try {
            const { error } = await supabase
                .from('courses')
                .update({ status: 'published' })
                .eq('id', courseId);
            if (!error) {
                setAdminCourses(adminCourses.map(course =>
                    course.id === courseId ? { ...course, status: 'published' as const } : course
                ));
            }
        } catch (err) {
            console.error('Failed to approve course:', err);
        }
    };

    const handleRejectCourse = async (courseId: number) => {
        try {
            const { error } = await supabase
                .from('courses')
                .update({ status: 'draft' })
                .eq('id', courseId);
            if (!error) {
                setAdminCourses(adminCourses.map(course =>
                    course.id === courseId ? { ...course, status: 'draft' as const } : course
                ));
            }
        } catch (err) {
            console.error('Failed to reject course:', err);
        }
    };

    // Credential & System State
    const [credSearch, setCredSearch] = useState('');
    const [adminCredentials, setAdminCredentials] = useState<AdminCredential[]>([]);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
        { id: 1, timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19), level: "info", service: "api", message: "Admin dashboard loaded" },
    ]);

    // Credential Actions
    const handleApproveCredential = async (credId: string) => {
        const numericId = parseInt(credId.replace('CRT-', ''));
        const blockchainHash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
        try {
            const { error } = await supabase
                .from('credentials')
                .update({ status: 'issued', blockchain_tx_hash: blockchainHash })
                .eq('id', numericId);
            if (!error) {
                setAdminCredentials(adminCredentials.map(cred =>
                    cred.id === credId ? {
                        ...cred,
                        status: 'issued' as const,
                        blockchainHash
                    } : cred
                ));
            }
        } catch (err) {
            console.error('Failed to approve credential:', err);
        }
    };

    const handleRevokeCredential = async (credId: string) => {
        const numericId = parseInt(credId.replace('CRT-', ''));
        try {
            const { error } = await supabase
                .from('credentials')
                .update({ status: 'revoked' })
                .eq('id', numericId);
            if (!error) {
                setAdminCredentials(adminCredentials.map(cred =>
                    cred.id === credId ? { ...cred, status: 'revoked' as const } : cred
                ));
            }
        } catch (err) {
            console.error('Failed to revoke credential:', err);
        }
    };

    // System Actions
    const handleDownloadLogs = () => {
        const logsContent = systemLogs.map(log =>
            `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.service.toUpperCase()}] ${log.message}`
        ).join('\n');
        const blob = new Blob([logsContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vokasi-system-logs-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const headers = getAuthHeaders();

            // Fetch platform stats from backend API
            const statsResponse = await fetch(apiUrl('/api/v1/admin/stats'), { headers });
            if (statsResponse.ok) {
                const data = await statsResponse.json();
                setStats(data);
            }

            const activityResponse = await fetch(apiUrl('/api/v1/admin/recent-activity'), { headers });
            if (activityResponse.ok) {
                const data = await activityResponse.json();
                setRecentActivity(data);
            }

            // Fetch users from backend API
            const usersResponse = await fetch(apiUrl('/api/v1/admin/users'), { headers });
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData);
            }

            // Fetch courses from backend API
            const coursesResponse = await fetch(apiUrl('/api/v1/admin/courses'), { headers });
            if (coursesResponse.ok) {
                const coursesData = await coursesResponse.json();
                setAdminCourses(coursesData);
            }

            // Fetch credentials from backend API
            const credentialsResponse = await fetch(apiUrl('/api/v1/admin/credentials'), { headers });
            if (credentialsResponse.ok) {
                const credentialsData = await credentialsResponse.json();
                setAdminCredentials(credentialsData);
            }

            // Fetch gamification stats
            const gamificationResponse = await fetch(apiUrl('/api/v1/admin/gamification-stats'), { headers });
            if (gamificationResponse.ok) {
                const gamificationData = await gamificationResponse.json();
                setGamificationStats(gamificationData);
            }

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format time ago
    const formatTimeAgo = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</h3>
                    {change && (
                        <p className={`text-xs mt-2 flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className="w-3 h-3" />
                            {change >= 0 ? '+' : ''}{change}% from last month
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <RoleRouteGuard allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">VOKASI Admin Control Center</h1>
                                    <p className="text-sm text-gray-600">Platform Management Dashboard</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${stats.systemHealth === 'healthy'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    <Activity className="w-3 h-3 inline mr-1" />
                                    System {stats.systemHealth}
                                </div>
                                <button
                                    onClick={() => setIsConfigModalOpen(true)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="System Settings"
                                >
                                    <Settings className="w-5 h-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                                </button>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-2 mt-6 border-b border-gray-200">
                            {[
                                { id: 'overview', label: 'Overview', icon: BarChart3 },
                                { id: 'users', label: 'Users', icon: Users },
                                { id: 'courses', label: 'Courses', icon: BookOpen },
                                { id: 'credentials', label: 'Credentials', icon: Award },
                                { id: 'integrations', label: 'Integrations', icon: Globe },
                                { id: 'system', label: 'System', icon: Database },
                                { id: 'branding', label: 'Branding', icon: Palette }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 py-8 w-full max-w-[100vw] overflow-x-hidden">
                    <PageTransition>
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        icon={Users}
                                        title="Total Users"
                                        value={stats.totalUsers}
                                        change={12.5}
                                        color="bg-gradient-to-br from-blue-500 to-cyan-600"
                                    />
                                    <StatCard
                                        icon={BookOpen}
                                        title="Active Courses"
                                        value={stats.totalCourses}
                                        change={8.3}
                                        color="bg-gradient-to-br from-green-500 to-emerald-600"
                                    />
                                    <StatCard
                                        icon={GraduationCap}
                                        title="Enrollments"
                                        value={stats.totalEnrollments}
                                        change={15.2}
                                        color="bg-gradient-to-br from-purple-500 to-pink-600"
                                    />
                                    <StatCard
                                        icon={Award}
                                        title="Credentials Issued"
                                        value={stats.totalCredentials}
                                        change={22.1}
                                        color="bg-gradient-to-br from-orange-500 to-red-600"
                                    />
                                </div>

                                {/* Additional Metrics */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <Activity className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900">Active Projects</h3>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
                                        <p className="text-sm text-gray-600 mt-1">Currently in progress</p>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900">Completion Rate</h3>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${stats.completionRate}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <DollarSign className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900">Revenue (MTD)</h3>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900">
                                            ${(stats.revenueThisMonth / 1000).toFixed(1)}K
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">This month</p>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-gray-900 text-lg">Recent Platform Activity</h3>
                                        <button className="text-sm text-primary hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        {recentActivity.length > 0 ? (
                                            recentActivity.map(activity => (
                                                <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                                                    <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-green-100' :
                                                        activity.status === 'pending' ? 'bg-yellow-100' :
                                                            'bg-gray-100'
                                                        }`}>
                                                        {activity.status === 'success' ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        ) : activity.status === 'pending' ? (
                                                            <Clock className="w-4 h-4 text-yellow-600" />
                                                        ) : (
                                                            <AlertCircle className="w-4 h-4 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${activity.type === 'user' ? 'bg-blue-100 text-blue-700' :
                                                        activity.type === 'course' ? 'bg-green-100 text-green-700' :
                                                            activity.type === 'credential' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {activity.type}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 py-8">No recent activity</p>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-8 text-white">
                                    <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { icon: Upload, label: 'Import Users', action: () => setIsImportModalOpen(true) },
                                            { icon: Download, label: 'Export Data', action: handleExportUsers },
                                            { icon: FileText, label: 'Generate Report', action: () => setIsReportModalOpen(true) },
                                            { icon: Settings, label: 'System Config', action: () => setIsConfigModalOpen(true) }
                                        ].map((action, i) => (
                                            <button
                                                key={i}
                                                onClick={action.action}
                                                className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                                            >
                                                <action.icon className="w-6 h-6" />
                                                <span className="text-sm font-medium">{action.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Toolbar */}
                                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search users..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-64"
                                            />
                                            <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                        </div>
                                        <select
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                        >
                                            <option value="all">All Roles</option>
                                            <option value="student">Students</option>
                                            <option value="instructor">Instructors</option>
                                            <option value="institution">Institutions</option>
                                            <option value="admin">Admins</option>
                                        </select>
                                        <button
                                            onClick={handleExportUsers}
                                            className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Export
                                        </button>
                                        <button
                                            onClick={handleInviteUser}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Invite User
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users
                                                .filter(user =>
                                                    (roleFilter === 'all' || user.role === roleFilter) &&
                                                    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
                                                )
                                                .map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                                    {user.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                                user.role === 'instructor' ? 'bg-blue-100 text-blue-700' :
                                                                user.role === 'institution_admin' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`flex items-center gap-1.5 text-sm ${user.status === 'active' ? 'text-green-600' :
                                                                user.status === 'suspended' ? 'text-red-600' :
                                                                    'text-yellow-600'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-600' :
                                                                    user.status === 'suspended' ? 'bg-red-600' :
                                                                        'bg-yellow-600'
                                                                    }`}></span>
                                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {user.joinedDate}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {user.lastActive}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => openEditUserModal(user)}
                                                                className="text-primary hover:text-primary/80 mr-3"
                                                            >
                                                                Edit
                                                            </button>
                                                            {user.status === 'suspended' ? (
                                                                <button
                                                                    onClick={() => handleActivateUser(user.id)}
                                                                    className="text-green-600 hover:text-green-800"
                                                                >
                                                                    Activate
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleSuspendUser(user.id)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    Suspend
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleResetUserPassword(user.id, user.email)}
                                                                className="text-amber-600 hover:text-amber-800 ml-3"
                                                                title="Reset password"
                                                            >
                                                                <KeyRound className="w-4 h-4 inline" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id, user.email)}
                                                                className="text-red-700 hover:text-red-900 ml-3"
                                                                title="Delete user"
                                                            >
                                                                <Trash2 className="w-4 h-4 inline" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                    <div>Showing 1 to {users.length} of {users.length} results</div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Edit User Modal */}
                        {isEditUserModalOpen && selectedUser && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                                        <button onClick={() => setIsEditUserModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={selectedUser.name}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={selectedUser.email}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <select
                                                value={selectedUser.role}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                            >
                                                <option value="student">Student</option>
                                                <option value="instructor">Instructor</option>
                                                <option value="institution">Institution</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                onClick={() => setIsEditUserModalOpen(false)}
                                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSaveUser(selectedUser)}
                                                className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Toolbar */}
                                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h2 className="text-xl font-bold text-gray-900">Course Management</h2>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search courses..."
                                                value={courseSearch}
                                                onChange={(e) => setCourseSearch(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-64"
                                            />
                                            <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                        </div>
                                        <select
                                            value={courseStatusFilter}
                                            onChange={(e) => setCourseStatusFilter(e.target.value)}
                                            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="published">Published</option>
                                            <option value="pending">Pending Review</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                        <button className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            Add Course
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructor / Institution</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {adminCourses
                                                .filter(course =>
                                                    (courseStatusFilter === 'all' || course.status === courseStatusFilter) &&
                                                    (course.title.toLowerCase().includes(courseSearch.toLowerCase()) || course.instructor.toLowerCase().includes(courseSearch.toLowerCase()))
                                                )
                                                .map((course) => (
                                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{course.title}</div>
                                                                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                                                        {course.category}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{course.instructor}</div>
                                                            <div className="text-xs text-gray-500">{course.institution}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${course.status === 'published' ? 'bg-green-100 text-green-700' :
                                                                course.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {course.status === 'pending' ? 'Pending Review' :
                                                                    course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{course.enrollments.toLocaleString()} students</div>
                                                            {course.rating > 0 && (
                                                                <div className="text-xs text-yellow-600 flex items-center gap-1">
                                                                    ★ {course.rating}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {course.lastUpdated}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            {course.status === 'pending' ? (
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleApproveCourse(course.id)}
                                                                        className="text-green-600 hover:text-green-800 bg-green-50 px-3 py-1 rounded-lg"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectCourse(course.id)}
                                                                        className="text-red-600 hover:text-red-800 bg-red-50 px-3 py-1 rounded-lg"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button className="text-primary hover:text-primary/80">Edit</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                    <div>Showing 1 to {adminCourses.length} of {adminCourses.length} results</div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'credentials' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Toolbar */}
                                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h2 className="text-xl font-bold text-gray-900">Credential Oversight</h2>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search credentials..."
                                                value={credSearch}
                                                onChange={(e) => setCredSearch(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-64"
                                            />
                                            <Award className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                        </div>
                                        <button className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            Verify Hash
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Credential ID</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title / Type</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Blockchain Hash</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {adminCredentials
                                                .filter(cred =>
                                                    cred.user.toLowerCase().includes(credSearch.toLowerCase()) ||
                                                    cred.title.toLowerCase().includes(credSearch.toLowerCase()) ||
                                                    cred.id.toLowerCase().includes(credSearch.toLowerCase())
                                                )
                                                .map((cred) => (
                                                    <tr key={cred.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                                                            {cred.id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-gray-900">{cred.user}</div>
                                                            <div className="text-xs text-gray-500">Issued: {cred.issuedDate}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{cred.title}</div>
                                                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                                                {cred.type}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${cred.status === 'issued' ? 'bg-green-100 text-green-700' :
                                                                cred.status === 'revoked' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {cred.status.charAt(0).toUpperCase() + cred.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                                                            {cred.blockchainHash}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            {cred.status === 'pending' ? (
                                                                <button
                                                                    onClick={() => handleApproveCredential(cred.id)}
                                                                    className="text-green-600 hover:text-green-800 bg-green-50 px-3 py-1 rounded-lg"
                                                                >
                                                                    Approve Issue
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRevokeCredential(cred.id)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    Revoke
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                        }

                        {activeTab === 'integrations' && (
                            <IntegrationsTab backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL || ''} />
                        )}

                        {activeTab === 'branding' && (
                            <BrandingTab />
                        )}

                        {
                            activeTab === 'system' && (
                                <div className="space-y-6">
                                    {/* System Metrics */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="text-sm text-gray-500 mb-2">CPU Usage</div>
                                            <div className="text-2xl font-bold text-gray-900">24%</div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="text-sm text-gray-500 mb-2">Memory Usage</div>
                                            <div className="text-2xl font-bold text-gray-900">1.2 GB</div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="text-sm text-gray-500 mb-2">API Latency</div>
                                            <div className="text-2xl font-bold text-gray-900">45ms</div>
                                            <div className="text-xs text-green-600 mt-1">↓ 12% vs avg</div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="text-sm text-gray-500 mb-2">Error Rate</div>
                                            <div className="text-2xl font-bold text-gray-900">0.02%</div>
                                            <div className="text-xs text-green-600 mt-1">Stable</div>
                                        </div>
                                    </div>

                                    {/* System Logs */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                            <h2 className="text-xl font-bold text-gray-900">System Logs</h2>
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Filter</button>
                                                <button
                                                    onClick={handleDownloadLogs}
                                                    className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
                                                >
                                                    Download Logs
                                                </button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {systemLogs.map((log) => (
                                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                                {log.timestamp}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${log.level === 'info' ? 'bg-blue-100 text-blue-700' :
                                                                    log.level === 'success' ? 'bg-green-100 text-green-700' :
                                                                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {log.level.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {log.service.toUpperCase()}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {log.message}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </PageTransition>
                </main>
            </div >

            {/* Import Users Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Import Users</h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Upload a CSV file with columns: name, email, role</p>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label htmlFor="csv-upload" className="cursor-pointer">
                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">{importFile ? importFile.name : 'Click to select CSV file'}</p>
                                </label>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                                <strong>CSV Format:</strong><br />
                                name,email,role<br />
                                John Doe,john@example.com,student
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                                <button onClick={handleImportUsers} disabled={!importFile} className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50">Import</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Generate Report</h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Select the type of report to generate</p>
                            <div className="space-y-2">
                                {[
                                    { value: 'full', label: 'Full Platform Report', desc: 'Users, Courses, Credentials' },
                                    { value: 'users', label: 'Users Report', desc: 'All user data' },
                                    { value: 'courses', label: 'Courses Report', desc: 'All course data' },
                                    { value: 'credentials', label: 'Credentials Report', desc: 'All credential data' }
                                ].map((opt) => (
                                    <label key={opt.value} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-colors ${reportType === opt.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="reportType" value={opt.value} checked={reportType === opt.value} onChange={(e) => setReportType(e.target.value as any)} className="mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900">{opt.label}</p>
                                            <p className="text-xs text-gray-500">{opt.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                                <button onClick={handleGenerateReport} className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90">Download Report</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* System Config Modal */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">System Configuration</h3>
                            <button onClick={() => setIsConfigModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 rounded-xl">
                                    <p className="text-sm font-medium text-green-800">API Status</p>
                                    <p className="text-2xl font-bold text-green-600">Online</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <p className="text-sm font-medium text-blue-800">Database</p>
                                    <p className="text-2xl font-bold text-blue-600">Connected</p>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Quick Settings</h4>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Enable new user registrations</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Require email verification</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Enable AI features</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button onClick={() => setIsConfigModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Close</button>
                                <button onClick={() => { alert('Settings saved!'); setIsConfigModalOpen(false); }} className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </RoleRouteGuard >
    );
}

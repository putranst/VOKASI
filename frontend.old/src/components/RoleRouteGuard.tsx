'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

interface RoleRouteGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('[RoleRouteGuard] Checking access:', {
            path: window.location.pathname,
            isAuthenticated,
            userRole: user?.role,
            allowedRoles
        });

        if (!isAuthenticated) {
            console.log('[RoleRouteGuard] Not authenticated, redirecting to login');
            router.push('/login');
            return;
        }

        if (user && !allowedRoles.includes(user.role)) {
            console.log(`[RoleRouteGuard] Role mismatch. User: ${user.role}, Allowed: ${allowedRoles.join(', ')}`);
            // Redirect to their appropriate dashboard if they try to access a restricted page
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
        }
    }, [isAuthenticated, user, router, allowedRoles]);

    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
};

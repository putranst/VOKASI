'use client';

import { ReactNode } from 'react';
import { AuthProvider } from "@/lib/AuthContext";
import { SearchProvider } from "@/lib/SearchContext";
import { ToastProvider } from "@/lib/ToastContext";
import { ToastContainer } from "@/components/ui/Toast";
import { SocraticProvider } from "@/contexts/SocraticContext";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            <SearchProvider>
                <AuthProvider>
                    <SocraticProvider>
                        {children}
                        <ToastContainer />
                    </SocraticProvider>
                </AuthProvider>
            </SearchProvider>
        </ToastProvider>
    );
}

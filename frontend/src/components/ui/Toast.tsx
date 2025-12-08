'use client';

import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useToast, Toast as ToastType } from '@/lib/ToastContext';

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
    const typeStyles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const icons = {
        success: <CheckCircle className="text-green-600" size={20} />,
        error: <XCircle className="text-red-600" size={20} />,
        warning: <AlertCircle className="text-yellow-600" size={20} />,
        info: <Info className="text-blue-600" size={20} />
    };

    return (
        <div
            className={`
        ${typeStyles[toast.type]}
        pointer-events-auto
        min-w-[320px] max-w-md
        px-4 py-3 rounded-lg border shadow-lg
        flex items-start gap-3
        animate-slide-in-right
      `}
        >
            <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type]}
            </div>
            <p className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
            </p>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Close notification"
            >
                <X size={18} />
            </button>
        </div>
    );
}

'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface SuccessStatsCardProps {
    value: string;
    label: string;
    icon?: React.ReactNode;
    trend?: string;
}

export function SuccessStatsCard({ value, label, icon, trend }: SuccessStatsCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                    {icon || <TrendingUp className="text-primary" size={24} />}
                </div>
                {trend && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
            <div className="text-sm font-medium text-gray-600">{label}</div>
        </div>
    );
}

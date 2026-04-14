'use client';

import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Users, Award, MapPin, ChevronRight, Flame } from 'lucide-react';

interface ProvinceRanking {
    rank: number;
    province: string;
    provinceCode: string;
    totalXP: number;
    progressPercent: number;
    isUserProvince: boolean;
}

interface EkspedisiProps {
    userProvince: string;
    provinceRank: number;
    rankChange: 'up' | 'down' | 'same';
    changeAmount: number;
    totalXP: number;
    totalLearners: number;
    badgesEarned: number;
    topProvinces: ProvinceRanking[];
    onViewLeaderboard?: () => void;
    onContribute?: () => void;
}

// Default mock data for 38 Indonesian provinces
const DEFAULT_TOP_PROVINCES: ProvinceRanking[] = [
    { rank: 1, province: 'DKI Jakarta', provinceCode: 'JK', totalXP: 18200, progressPercent: 100, isUserProvince: false },
    { rank: 2, province: 'Jawa Barat', provinceCode: 'JB', totalXP: 16800, progressPercent: 92, isUserProvince: false },
    { rank: 3, province: 'Jawa Tengah', provinceCode: 'JT', totalXP: 15400, progressPercent: 85, isUserProvince: false },
    { rank: 4, province: 'Bali', provinceCode: 'BA', totalXP: 14200, progressPercent: 78, isUserProvince: false },
    { rank: 5, province: 'Jawa Timur', provinceCode: 'JI', totalXP: 12450, progressPercent: 68, isUserProvince: true },
];

const MEDAL_ICONS: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
};

export function EkspedisiAINusantara({
    userProvince = 'Jawa Timur',
    provinceRank = 5,
    rankChange = 'up',
    changeAmount = 2,
    totalXP = 12450,
    totalLearners = 847,
    badgesEarned = 3,
    topProvinces = DEFAULT_TOP_PROVINCES,
    onViewLeaderboard,
    onContribute,
}: Partial<EkspedisiProps>) {
    const RankChangeIcon = rankChange === 'up' ? TrendingUp : rankChange === 'down' ? TrendingDown : Minus;
    const rankChangeColor = rankChange === 'up' ? 'text-emerald-600' : rankChange === 'down' ? 'text-red-500' : 'text-gray-400';
    const rankChangeBg = rankChange === 'up' ? 'bg-emerald-50' : rankChange === 'down' ? 'bg-red-50' : 'bg-gray-50';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header with Indonesian flag gradient */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-700/20"></div>
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-xl">🇮🇩</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Ekspedisi AI Nusantara</h3>
                            <p className="text-red-100 text-sm">National AI Competition · 38 Provinces</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Flame className="text-amber-300" size={16} />
                        <span className="text-white text-sm font-medium">Season 2026</span>
                    </div>
                </div>
            </div>

            {/* User Province Stats */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="text-gray-400" size={16} />
                    <span className="text-sm font-medium text-gray-600">Your Province</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-gray-900">{userProvince}</h4>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${rankChangeBg}`}>
                        <RankChangeIcon size={14} className={rankChangeColor} />
                        <span className={`text-xs font-bold ${rankChangeColor}`}>
                            {rankChange !== 'same' && `${changeAmount}`}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 text-center border border-amber-100">
                        <Trophy className="text-amber-600 mx-auto mb-1" size={18} />
                        <p className="text-lg font-black text-gray-900">#{provinceRank}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Rank</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 text-center border border-purple-100">
                        <Flame className="text-purple-600 mx-auto mb-1" size={18} />
                        <p className="text-lg font-black text-gray-900">{totalXP.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 font-medium">XP</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center border border-blue-100">
                        <Users className="text-blue-600 mx-auto mb-1" size={18} />
                        <p className="text-lg font-black text-gray-900">{totalLearners}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Learners</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 text-center border border-emerald-100">
                        <Award className="text-emerald-600 mx-auto mb-1" size={18} />
                        <p className="text-lg font-black text-gray-900">{badgesEarned}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Badges</p>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="p-6">
                <h5 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Trophy size={14} className="text-amber-500" />
                    TOP PROVINCES
                </h5>

                <div className="space-y-3">
                    {topProvinces.map((province) => (
                        <div
                            key={province.provinceCode}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${province.isUserProvince
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            {/* Rank */}
                            <div className="w-8 text-center">
                                {province.rank <= 3 ? (
                                    <span className="text-lg">{MEDAL_ICONS[province.rank]}</span>
                                ) : (
                                    <span className="text-sm font-bold text-gray-500">{province.rank}.</span>
                                )}
                            </div>

                            {/* Province Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`font-semibold truncate ${province.isUserProvince ? 'text-blue-700' : 'text-gray-900'}`}>
                                        {province.province}
                                    </span>
                                    {province.isUserProvince && (
                                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded uppercase">
                                            You
                                        </span>
                                    )}
                                </div>
                                {/* Progress Bar */}
                                <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${province.rank === 1 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                                                province.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                                    province.rank === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                                                        province.isUserProvince ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                                            'bg-gray-400'
                                            }`}
                                        style={{ width: `${province.progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* XP */}
                            <div className="text-right">
                                <span className={`text-sm font-bold ${province.isUserProvince ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {province.totalXP.toLocaleString()}
                                </span>
                                <span className="text-gray-400 text-xs ml-1">XP</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onViewLeaderboard}
                        className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        View Full Leaderboard
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={onContribute}
                        className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        Contribute
                        <Flame size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EkspedisiAINusantara;

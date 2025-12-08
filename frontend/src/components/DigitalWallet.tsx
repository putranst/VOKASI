"use client";

import React, { useEffect, useState } from 'react';
import { Shield, Award, ExternalLink, Download, Share2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Credential {
    id: number;
    user_id: number;
    course_id?: number;
    project_id?: number;
    credential_type: string;
    title: string;
    description: string;
    issuer_name: string;
    issuer_id: number;
    token_id?: string;
    transaction_hash?: string;
    blockchain_network: string;
    contract_address?: string;
    wallet_address?: string;
    metadata_uri?: string;
    metadata_json?: any;
    status: 'pending' | 'minting' | 'issued' | 'revoked';
    verification_url?: string;
    qr_code_url?: string;
    issued_at?: string;
    expires_at?: string;
    created_at: string;
    updated_at: string;
}

export default function DigitalWallet({ userId }: { userId: number }) {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchCredentials();
    }, [userId, filter]);

    const fetchCredentials = async () => {
        try {
            setLoading(true);
            const statusParam = filter !== 'all' ? `?status=${filter}` : '';
            const response = await fetch(`http://localhost:8000/api/v1/users/${userId}/credentials${statusParam}`);
            const data = await response.json();
            setCredentials(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching credentials:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            issued: { icon: CheckCircle, text: 'Verified', color: 'bg-green-100 text-green-800 border-green-200' },
            minting: { icon: Clock, text: 'Minting', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            pending: { icon: Clock, text: 'Pending', color: 'bg-gray-100 text-gray-800 border-gray-200' },
            revoked: { icon: XCircle, text: 'Revoked', color: 'bg-red-100 text-red-800 border-red-200' },
        };

        const badge = badges[status as keyof typeof badges] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {badge.text}
            </span>
        );
    };

    const getCredentialIcon = (type: string) => {
        const icons = {
            course_completion: '🎓',
            specialization: '⭐',
            degree: '🏆',
            skill_badge: '🎯',
            project_verification: '✅',
        };
        return icons[type as keyof typeof icons] || '📜';
    };

    const downloadCredential = (credential: Credential) => {
        // In production, this would generate a PDF certificate
        const data = JSON.stringify(credential, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credential-${credential.token_id || credential.id}.json`;
        a.click();
    };

    const shareCredential = async (credential: Credential) => {
        if (navigator.share && credential.verification_url) {
            try {
                await navigator.share({
                    title: credential.title,
                    text: `Check out my verified credential: ${credential.title}`,
                    url: credential.verification_url,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            if (credential.verification_url) {
                navigator.clipboard.writeText(credential.verification_url);
                alert('Verification link copied to clipboard!');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#663399]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-7 h-7 text-[#663399]" />
                        Digital Wallet
                    </h2>
                    <p className="text-gray-600 mt-1">Your blockchain-verified credentials</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Filter:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#663399] focus:border-transparent"
                    >
                        <option value="all">All Credentials</option>
                        <option value="issued">Verified Only</option>
                        <option value="minting">Minting</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Credentials Grid */}
            {credentials.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No credentials yet</h3>
                    <p className="text-gray-600">Complete courses and projects to earn blockchain-verified credentials</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {credentials.map((credential) => (
                        <div
                            key={credential.id}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Credential Header */}
                            <div className="bg-gradient-to-r from-[#663399] to-purple-600 p-6 text-white">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-4xl">{getCredentialIcon(credential.credential_type)}</div>
                                    {getStatusBadge(credential.status)}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{credential.title}</h3>
                                <p className="text-purple-100 text-sm">{credential.description}</p>
                            </div>

                            {/* Credential Body */}
                            <div className="p-6 space-y-4">
                                {/* Issuer */}
                                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Award className="w-6 h-6 text-[#663399]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Issued by</p>
                                        <p className="font-semibold text-gray-900">{credential.issuer_name}</p>
                                    </div>
                                </div>

                                {/* Blockchain Details */}
                                {credential.status === 'issued' && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Token ID:</span>
                                            <span className="font-mono text-gray-900">{credential.token_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Network:</span>
                                            <span className="text-gray-900">{credential.blockchain_network}</span>
                                        </div>
                                        {credential.issued_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Issued:</span>
                                                <span className="text-gray-900">
                                                    {new Date(credential.issued_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        {credential.expires_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Expires:</span>
                                                <span className="text-gray-900">
                                                    {new Date(credential.expires_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4">
                                    {credential.verification_url && (
                                        <a
                                            href={credential.verification_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#663399] text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Verify
                                        </a>
                                    )}
                                    <button
                                        onClick={() => downloadCredential(credential)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => shareCredential(credential)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        title="Share"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* QR Code */}
                                {credential.qr_code_url && credential.status === 'issued' && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2 text-center">Scan to verify</p>
                                        <img
                                            src={credential.qr_code_url}
                                            alt="QR Code"
                                            className="w-32 h-32 mx-auto"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Blockchain Info Footer */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-[#663399] flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Blockchain-Verified Credentials</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            All credentials are minted as Soulbound Tokens (SBTs) on the Polygon blockchain, making them
                            immutable, verifiable, and permanently tied to your identity. These credentials cannot be
                            transferred or forged, ensuring authentic proof of your skills and achievements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

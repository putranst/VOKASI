"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, CheckCircle, XCircle, Search, ExternalLink, Award } from 'lucide-react';

interface CredentialVerification {
    is_valid: boolean;
    credential: any;
    verification_message: string;
    verified_at: string;
}

export default function VerifyCredentialPage() {
    const [tokenId, setTokenId] = useState('');
    const [verification, setVerification] = useState<CredentialVerification | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tokenId.trim()) return;

        setLoading(true);
        setSearched(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/credentials/verify/${tokenId.trim()}`);
            const data = await response.json();
            setVerification(data);
        } catch (error) {
            console.error('Error verifying credential:', error);
            setVerification({
                is_valid: false,
                credential: null,
                verification_message: 'Error connecting to verification service. Please try again.',
                verified_at: new Date().toISOString(),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                            <Search className="w-8 h-8 text-[#663399]" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify a Credential</h2>
                        <p className="text-gray-600">
                            Enter the Token ID to verify the authenticity of a VOKASI credential
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="max-w-2xl mx-auto">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={tokenId}
                                onChange={(e) => setTokenId(e.target.value)}
                                placeholder="Enter Token ID (e.g., VOK-000001)"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#663399] focus:border-transparent text-lg"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !tokenId.trim()}
                                className="px-8 py-3 bg-[#663399] text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            Token IDs are found on the credential certificate or QR code
                        </p>
                    </form>
                </div>

                {/* Verification Result */}
                {searched && verification && (
                    <div
                        className={`rounded-2xl shadow-xl border-2 p-8 ${verification.is_valid
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                            }`}
                    >
                        {/* Status Header */}
                        <div className="flex items-center gap-4 mb-6">
                            {verification.is_valid ? (
                                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                                    <XCircle className="w-10 h-10 text-red-600" />
                                </div>
                            )}
                            <div>
                                <h3
                                    className={`text-2xl font-bold ${verification.is_valid ? 'text-green-900' : 'text-red-900'
                                        }`}
                                >
                                    {verification.is_valid ? 'Credential Verified' : 'Verification Failed'}
                                </h3>
                                <p
                                    className={`text-sm ${verification.is_valid ? 'text-green-700' : 'text-red-700'
                                        }`}
                                >
                                    {verification.verification_message}
                                </p>
                            </div>
                        </div>

                        {/* Credential Details */}
                        {verification.credential && (
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="text-4xl">
                                        {verification.credential.credential_type === 'course_completion' && '🎓'}
                                        {verification.credential.credential_type === 'project_verification' && '✅'}
                                        {verification.credential.credential_type === 'specialization' && '⭐'}
                                        {verification.credential.credential_type === 'degree' && '🏆'}
                                        {verification.credential.credential_type === 'skill_badge' && '🎯'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                                            {verification.credential.title}
                                        </h4>
                                        <p className="text-gray-700">{verification.credential.description}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-1">Issued By</p>
                                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-[#663399]" />
                                            {verification.credential.issuer_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Token ID</p>
                                        <p className="font-mono font-semibold text-gray-900">
                                            {verification.credential.token_id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Blockchain Network</p>
                                        <p className="font-semibold text-gray-900">
                                            {verification.credential.blockchain_network}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Issue Date</p>
                                        <p className="font-semibold text-gray-900">
                                            {verification.credential.issued_at
                                                ? new Date(verification.credential.issued_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    {verification.credential.expires_at && (
                                        <div>
                                            <p className="text-gray-500 mb-1">Expiration Date</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(verification.credential.expires_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {verification.credential.transaction_hash && (
                                        <div className="md:col-span-2">
                                            <p className="text-gray-500 mb-1">Transaction Hash</p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono text-xs text-gray-900 truncate">
                                                    {verification.credential.transaction_hash}
                                                </p>
                                                <a
                                                    href={`https://mumbai.polygonscan.com/tx/${verification.credential.transaction_hash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#663399] hover:text-purple-700 flex-shrink-0"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Verification Timestamp */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        Verified on {new Date(verification.verified_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#663399]" />
                        About VOKASI Credentials
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                        <p>
                            VOKASI credentials are issued as <strong>Soulbound Tokens (SBTs)</strong> on the Polygon
                            blockchain. These are non-transferable, blockchain-verified certificates that provide
                            immutable proof of skill acquisition and course completion.
                        </p>
                        <p>
                            Each credential contains a unique Token ID and transaction hash that can be independently
                            verified on the blockchain, ensuring authenticity and preventing fraud.
                        </p>
                        <p>
                            Employers, institutions, and other third parties can use this portal to instantly verify
                            the legitimacy of any VOKASI credential.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ApiKeySlot {
    key_name: string;
    configured: boolean;
    preview: string | null;
    updated_at: string | null;
    updated_by: string | null;
}

interface AiProvider {
    id: number;
    name: string;
    display_name: string;
    base_url: string | null;
    api_key_name: string;
    model: string;
    provider_type: string;
    priority: number;
    is_active: boolean;
    vision_capable: boolean;
    created_at: string | null;
    updated_at: string | null;
}

interface ProviderStatus {
    active: boolean;
    message: string;
}

interface ProviderForm {
    name: string;
    display_name: string;
    base_url: string;
    api_key_name: string;
    model: string;  // Optional: leave empty for OpenRouter dashboard default
    provider_type: string;
    priority: number;
    is_active: boolean;
    vision_capable: boolean;
}

interface EmailIntegrationConfig {
    provider: string;
    sender_name: string;
    sender_email: string;
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_use_tls: boolean;
}

const OPENROUTER_DEFAULT_PROVIDER: ProviderForm = {
    name: 'openrouter',
    display_name: 'OpenRouter',
    base_url: 'https://openrouter.ai/api/v1',
    api_key_name: 'OPENROUTER_API_KEY',
    model: 'google/gemma-4-31b-it:free',  // User's OpenRouter dashboard default
    provider_type: 'openai_compatible',
    priority: 0,
    is_active: true,
    vision_capable: false,
};

export default function IntegrationsTab({ backendUrl }: { backendUrl: string }) {
    const [apiKeySlots, setApiKeySlots] = useState<ApiKeySlot[]>([]);
    const [keyValues, setKeyValues] = useState<Record<string, string>>({});
    const [providerStatus, setProviderStatus] = useState<Record<string, ProviderStatus>>({});
    const [integrationsLoading, setIntegrationsLoading] = useState(false);
    const [aiProviders, setAiProviders] = useState<AiProvider[]>([]);
    const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
    const [providerForm, setProviderForm] = useState<ProviderForm>({ ...OPENROUTER_DEFAULT_PROVIDER });
    const [editingProviderId, setEditingProviderId] = useState<number | null>(null);
    const [emailConfig, setEmailConfig] = useState<EmailIntegrationConfig>({
        provider: 'noop',
        sender_name: 'VOKASI',
        sender_email: 'noreply@localhost',
        smtp_host: '',
        smtp_port: 587,
        smtp_username: '',
        smtp_use_tls: true,
    });
    const [emailTestTarget, setEmailTestTarget] = useState('');

    const resetProviderForm = () => {
        setProviderForm({ ...OPENROUTER_DEFAULT_PROVIDER });
    };

    const getAuthToken = () => {
        return localStorage.getItem('sb-access-token') || localStorage.getItem('token') || '';
    };

    const fetchApiKeys = async () => {
        setIntegrationsLoading(true);
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/api-keys`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) setApiKeySlots(await res.json());
        } catch (e) {
            console.error('Failed to fetch API keys:', e);
        } finally {
            setIntegrationsLoading(false);
        }
    };

    const fetchProviderStatus = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/provider-status`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) setProviderStatus((await res.json()).providers || {});
        } catch (e) {
            console.error('Failed to fetch provider status:', e);
        }
    };

    const fetchAiProviders = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/ai-providers`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) setAiProviders(await res.json());
        } catch (e) {
            console.error('Failed to fetch AI providers:', e);
        }
    };

    const fetchEmailIntegration = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/email-integration`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmailConfig({
                    provider: data.provider || 'noop',
                    sender_name: data.sender_name || 'VOKASI',
                    sender_email: data.sender_email || 'noreply@localhost',
                    smtp_host: data.smtp_host || '',
                    smtp_port: Number(data.smtp_port || 587),
                    smtp_username: data.smtp_username || '',
                    smtp_use_tls: !!data.smtp_use_tls,
                });
            }
        } catch (e) {
            console.error('Failed to fetch email integration:', e);
        }
    };

    const handleSaveKey = async (keyName: string) => {
        const value = keyValues[keyName];
        if (!value || !value.trim()) return;
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/api-keys/${encodeURIComponent(keyName)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify({ key_name: keyName, value: value.trim() })
            });
            if (res.ok) {
                setKeyValues(prev => ({ ...prev, [keyName]: '' }));
                await fetchApiKeys();
                alert(`${keyName} saved successfully`);
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.detail || 'Failed to save key');
            }
        } catch (e) {
            console.error(e);
            alert('Network error saving key');
        }
    };

    const handleReloadKeys = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/api-keys/reload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                alert(`Reloaded providers: ${data.active_providers?.join(', ') || 'none'}`);
                await fetchProviderStatus();
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.detail || 'Reload failed');
            }
        } catch (e) {
            console.error(e);
            alert('Network error during reload');
        }
    };

    const handleDeleteKey = async (keyName: string) => {
        if (!confirm(`Delete ${keyName}? This will clear it from the database.`)) return;
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/api-keys/${keyName}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                await fetchApiKeys();
                await fetchProviderStatus();
                alert(`${keyName} deleted`);
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.detail || 'Failed to delete key');
            }
        } catch (e) {
            console.error(e);
            alert('Network error deleting key');
        }
    };

    const handleCreateProvider = async () => {
        if (!providerForm.name || !providerForm.display_name || !providerForm.api_key_name) {
            alert('Name, Display Name, and API Key Name are required');
            return;
        }
        try {
            const url = editingProviderId
                ? `${backendUrl}/api/v1/admin/settings/ai-providers/${editingProviderId}`
                : `${backendUrl}/api/v1/admin/settings/ai-providers`;
            const method = editingProviderId ? 'PUT' : 'POST';
            // Send null for empty model to let OpenRouter use dashboard default
            const body: Record<string, unknown> = {
                ...providerForm,
                model: providerForm.model?.trim() || null
            };
            if (editingProviderId) {
                delete body.id; delete body.created_at; delete body.updated_at;
            }
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setIsAddProviderOpen(false);
                resetProviderForm();
                setEditingProviderId(null);
                await fetchAiProviders();
                await handleReloadKeys();
                alert(editingProviderId ? 'Provider updated' : 'Provider created');
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.detail || 'Failed to save provider');
            }
        } catch (e) {
            console.error(e);
            alert('Network error saving provider');
        }
    };

    const handleDeleteProvider = async (id: number) => {
        if (!confirm('Delete this provider?')) return;
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/ai-providers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (res.ok) {
                await fetchAiProviders();
                await handleReloadKeys();
                alert('Provider deleted');
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.detail || 'Failed to delete provider');
            }
        } catch (e) {
            console.error(e);
            alert('Network error deleting provider');
        }
    };

    const handleTestProvider = async (id: number) => {
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/ai-providers/${id}/test`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                alert(`Connection OK (${data.latency_ms}ms): ${data.message}`);
            } else {
                alert(`Connection failed: ${data.message}`);
            }
            await fetchProviderStatus();
        } catch (e) {
            console.error(e);
            alert('Network error testing provider');
        }
    };

    const handleSaveEmailIntegration = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/email-integration`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify(emailConfig)
            });
            if (res.ok) {
                await fetchEmailIntegration();
                alert('Email integration saved');
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.detail || 'Failed to save email integration');
            }
        } catch (e) {
            console.error(e);
            alert('Network error saving email integration');
        }
    };

    const handleTestEmailIntegration = async () => {
        if (!emailTestTarget.trim()) {
            alert('Enter a recipient email');
            return;
        }
        try {
            const res = await fetch(`${backendUrl}/api/v1/admin/settings/email-integration/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify({ to_email: emailTestTarget.trim() })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                alert(data.message || 'Test email sent');
            } else {
                alert(data.detail || 'Failed to test email integration');
            }
        } catch (e) {
            console.error(e);
            alert('Network error testing email integration');
        }
    };

    const openEditProvider = (provider: AiProvider) => {
        setProviderForm({
            name: provider.name,
            display_name: provider.display_name,
            base_url: provider.base_url || '',
            api_key_name: provider.api_key_name,
            model: provider.model,
            provider_type: provider.provider_type,
            priority: provider.priority,
            is_active: provider.is_active,
            vision_capable: provider.vision_capable,
        });
        setEditingProviderId(provider.id);
        setIsAddProviderOpen(true);
    };

    useEffect(() => {
        fetchApiKeys();
        fetchProviderStatus();
        fetchAiProviders();
        fetchEmailIntegration();
    }, []);

    return (
        <div className="space-y-6">
            {/* Email Integration */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Transactional Email</h2>
                    <p className="text-sm text-gray-500 mt-1">Provider-agnostic email setup for registration, payment, and onboarding lifecycle messages.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                value={emailConfig.provider}
                                onChange={(e) => setEmailConfig((p) => ({ ...p, provider: e.target.value }))}
                            >
                                <option value="noop">Noop (log only)</option>
                                <option value="smtp">SMTP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                            <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={emailConfig.sender_name} onChange={(e) => setEmailConfig((p) => ({ ...p, sender_name: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
                            <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={emailConfig.sender_email} onChange={(e) => setEmailConfig((p) => ({ ...p, sender_email: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                            <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={emailConfig.smtp_host} onChange={(e) => setEmailConfig((p) => ({ ...p, smtp_host: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                            <input type="number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={emailConfig.smtp_port} onChange={(e) => setEmailConfig((p) => ({ ...p, smtp_port: parseInt(e.target.value) || 587 }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                            <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={emailConfig.smtp_username} onChange={(e) => setEmailConfig((p) => ({ ...p, smtp_username: e.target.value }))} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={emailConfig.smtp_use_tls} onChange={(e) => setEmailConfig((p) => ({ ...p, smtp_use_tls: e.target.checked }))} />
                        Use TLS
                    </label>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <button onClick={handleSaveEmailIntegration} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">Save Email Config</button>
                        <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="test@email.com" value={emailTestTarget} onChange={(e) => setEmailTestTarget(e.target.value)} />
                        <button onClick={handleTestEmailIntegration} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Send Test Email</button>
                    </div>
                </div>
            </div>

            {/* AI Providers Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">AI Providers</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure and manage AI provider endpoints</p>
                    </div>
                    <button
                        onClick={() => { setEditingProviderId(null); resetProviderForm(); setIsAddProviderOpen(true); }}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                    >
                        Add Provider
                    </button>
                </div>
                <div className="p-6">
                    {aiProviders.length === 0 ? (
                        <div className="text-sm text-gray-500">No providers configured yet. Add one to get started.</div>
                    ) : (
                        <div className="space-y-4">
                            {aiProviders.map((provider) => (
                                <div key={provider.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{provider.display_name}</span>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{provider.provider_type}</span>
                                            {provider.is_active ? (
                                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Inactive</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Name: {provider.name} | Model: {provider.model} | Priority: {provider.priority}
                                            {provider.base_url && ` | Base URL: ${provider.base_url}`}
                                            {provider.vision_capable && ' | Vision'}
                                        </div>
                                        <div className="text-xs text-gray-400">API Key: {provider.api_key_name}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleTestProvider(provider.id)} className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">Test</button>
                                        <button onClick={() => openEditProvider(provider)} className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">Edit</button>
                                        <button onClick={() => handleDeleteProvider(provider.id)} className="px-3 py-1.5 border border-red-300 text-red-600 rounded text-xs font-medium hover:bg-red-50">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Provider Status Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Provider Status</h2>
                        <p className="text-sm text-gray-500 mt-1">Real-time health of configured AI providers</p>
                    </div>
                    <button
                        onClick={fetchProviderStatus}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                    >
                        Refresh
                    </button>
                </div>
                <div className="p-6">
                    {Object.keys(providerStatus).length === 0 ? (
                        <div className="text-sm text-gray-500">No provider status available yet. Save keys and check status.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(providerStatus).map(([name, status]) => (
                                <div key={name} className={`rounded-lg border p-4 ${status.active ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">{name}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${status.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {status.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{status.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* API Keys Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage encrypted API keys for AI providers. Keys are stored securely with Fernet encryption.</p>
                </div>
                <div className="p-6 space-y-6">
                    {integrationsLoading && (
                        <div className="text-sm text-gray-500">Loading keys...</div>
                    )}
                    {apiKeySlots.map((slot) => (
                        <div key={slot.key_name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">{slot.key_name}</label>
                                {slot.configured && (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Configured</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder={slot.configured ? (slot.preview || '•••••••• (configured)') : 'Enter API key'}
                                    value={keyValues[slot.key_name] || ''}
                                    onChange={(e) => setKeyValues(prev => ({ ...prev, [slot.key_name]: e.target.value }))}
                                />
                                <button
                                    onClick={() => handleSaveKey(slot.key_name)}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                                >
                                    Save
                                </button>
                                {slot.configured && (
                                    <button
                                        onClick={() => handleDeleteKey(slot.key_name)}
                                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={handleReloadKeys}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                        >
                            Reload Clients
                        </button>
                        <button
                            onClick={fetchApiKeys}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            Refresh Keys
                        </button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Provider Modal */}
            {isAddProviderOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{editingProviderId ? 'Edit Provider' : 'Add AI Provider'}</h3>
                            <button onClick={() => setIsAddProviderOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name (internal ID)</label>
                                <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={providerForm.name} onChange={(e) => setProviderForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. openai" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={providerForm.display_name} onChange={(e) => setProviderForm(p => ({ ...p, display_name: e.target.value }))} placeholder="e.g. OpenAI" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    value={providerForm.provider_type}
                                    onChange={(e) => {
                                        const nextType = e.target.value;
                                        setProviderForm(p => ({
                                            ...p,
                                            provider_type: nextType,
                                            base_url: nextType === 'gemini' ? '' : (p.base_url || 'https://openrouter.ai/api/v1'),
                                            api_key_name: nextType === 'gemini' ? (p.api_key_name || 'GEMINI_API_KEY') : (p.api_key_name || 'OPENROUTER_API_KEY'),
                                        }));
                                    }}
                                >
                                    <option value="openai_compatible">OpenAI Compatible</option>
                                    <option value="gemini">Google Gemini</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Model <span className="text-gray-400 font-normal">(optional)</span></label>
                                <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={providerForm.model} onChange={(e) => setProviderForm(p => ({ ...p, model: e.target.value }))} placeholder="e.g. gpt-4o (leave empty for OpenRouter default)" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL (optional)</label>
                                <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={providerForm.base_url} onChange={(e) => setProviderForm(p => ({ ...p, base_url: e.target.value }))} placeholder="e.g. https://api.openai.com/v1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Key Name</label>
                                <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={providerForm.api_key_name} onChange={(e) => setProviderForm(p => ({ ...p, api_key_name: e.target.value }))} placeholder="e.g. OPENAI_API_KEY" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <input type="number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={providerForm.priority} onChange={(e) => setProviderForm(p => ({ ...p, priority: parseInt(e.target.value) || 0 }))} />
                                </div>
                                <div className="flex items-center gap-4 pt-6">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={providerForm.is_active} onChange={(e) => setProviderForm(p => ({ ...p, is_active: e.target.checked }))} />
                                        Active
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={providerForm.vision_capable} onChange={(e) => setProviderForm(p => ({ ...p, vision_capable: e.target.checked }))} />
                                        Vision
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsAddProviderOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button onClick={handleCreateProvider} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">{editingProviderId ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

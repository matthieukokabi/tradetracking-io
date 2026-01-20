"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStyle } from '@/contexts/StyleContext';
import {
    Plus, X, Check, AlertCircle, Loader2, RefreshCw, Trash2,
    Wallet, TrendingUp, Shield, ChevronRight, ExternalLink
} from 'lucide-react';

interface Exchange {
    id: string;
    name: string;
    has_futures: boolean;
    requires_passphrase: boolean;
}

interface Connection {
    id: string;
    exchange: string;
    label: string;
    connected_at: string;
    last_sync: string | null;
    status: string;
}

interface ExchangeConnectionProps {
    apiUrl: string;
    token: string;
    onConnectionChange?: () => void;
}

const EXCHANGE_LOGOS: Record<string, string> = {
    binance: '🟡',
    bybit: '🟠',
    okx: '⚫',
    coinbase: '🔵',
    kraken: '🟣',
    kucoin: '🟢',
    bitget: '🔷',
    gate: '🔴',
    mexc: '🔶'
};

export default function ExchangeConnection({ apiUrl, token, onConnectionChange }: ExchangeConnectionProps) {
    const { isDark, accents } = useStyle();
    const [exchanges, setExchanges] = useState<Exchange[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
    const [formData, setFormData] = useState({ api_key: '', api_secret: '', passphrase: '', label: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [error, setError] = useState('');
    const [testResult, setTestResult] = useState<{ success: boolean; total_balance_usd?: number; error?: string } | null>(null);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    const colors = isDark ? {
        bgPrimary: '#0A0A0B',
        bgSecondary: '#111113',
        bgCard: 'rgba(255,255,255,0.03)',
        textPrimary: '#FFFFFF',
        textSecondary: '#A1A1AA',
        textMuted: '#71717A',
        border: 'rgba(255,255,255,0.06)',
    } : {
        bgPrimary: '#FAFAFA',
        bgSecondary: '#FFFFFF',
        bgCard: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#4B5563',
        textMuted: '#6B7280',
        border: 'rgba(0,0,0,0.06)',
    };

    useEffect(() => {
        fetchExchanges();
        fetchConnections();
    }, []);

    const fetchExchanges = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/v1/exchanges/supported`);
            const data = await res.json();
            setExchanges(data.exchanges || []);
        } catch (err) {
            console.error('Failed to fetch exchanges:', err);
        }
    };

    const fetchConnections = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/v1/exchanges`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setConnections(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch connections:', err);
        }
    };

    const handleTest = async () => {
        if (!selectedExchange) return;
        setIsTesting(true);
        setError('');
        setTestResult(null);

        try {
            const res = await fetch(`${apiUrl}/api/v1/exchanges/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    exchange: selectedExchange.id,
                    api_key: formData.api_key,
                    api_secret: formData.api_secret,
                    passphrase: formData.passphrase || null
                })
            });
            const data = await res.json();
            setTestResult(data);
            if (!data.success) {
                setError(data.error || 'Connection test failed');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to test connection');
        } finally {
            setIsTesting(false);
        }
    };

    const handleConnect = async () => {
        if (!selectedExchange) return;
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`${apiUrl}/api/v1/exchanges/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    exchange: selectedExchange.id,
                    api_key: formData.api_key,
                    api_secret: formData.api_secret,
                    passphrase: formData.passphrase || null,
                    label: formData.label || null
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Failed to connect');
            }

            await fetchConnections();
            setIsModalOpen(false);
            setSelectedExchange(null);
            setFormData({ api_key: '', api_secret: '', passphrase: '', label: '' });
            setTestResult(null);
            onConnectionChange?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to connect exchange');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async (connectionId: string) => {
        setSyncingId(connectionId);
        try {
            const res = await fetch(`${apiUrl}/api/v1/exchanges/${connectionId}/sync`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                await fetchConnections();
                onConnectionChange?.();
            }
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setSyncingId(null);
        }
    };

    const handleDelete = async (connectionId: string) => {
        if (!confirm('Are you sure you want to disconnect this exchange?')) return;

        try {
            await fetch(`${apiUrl}/api/v1/exchanges/${connectionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchConnections();
            onConnectionChange?.();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                        Connected Exchanges
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: colors.textMuted, margin: '0.25rem 0 0' }}>
                        {connections.length} exchange{connections.length !== 1 ? 's' : ''} connected
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        background: accents.green,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Add Exchange
                </button>
            </div>

            {/* Connections List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {connections.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        background: colors.bgSecondary,
                        borderRadius: '16px',
                        border: `1px solid ${colors.border}`,
                        textAlign: 'center'
                    }}>
                        <Wallet size={48} style={{ color: colors.textMuted, marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, margin: '0 0 0.5rem' }}>
                            No exchanges connected
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: colors.textMuted, margin: 0 }}>
                            Connect your first exchange to start syncing trades automatically.
                        </p>
                    </div>
                ) : (
                    connections.map((conn) => (
                        <motion.div
                            key={conn.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '1rem 1.25rem',
                                background: colors.bgSecondary,
                                borderRadius: '12px',
                                border: `1px solid ${colors.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{EXCHANGE_LOGOS[conn.exchange] || '📊'}</span>
                                <div>
                                    <div style={{ fontWeight: 600, color: colors.textPrimary }}>{conn.label}</div>
                                    <div style={{ fontSize: '0.8125rem', color: colors.textMuted }}>
                                        {conn.last_sync
                                            ? `Last synced: ${new Date(conn.last_sync).toLocaleString()}`
                                            : 'Never synced'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleSync(conn.id)}
                                    disabled={syncingId === conn.id}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Sync trades"
                                >
                                    <RefreshCw
                                        size={16}
                                        style={{
                                            color: accents.blue,
                                            animation: syncingId === conn.id ? 'spin 1s linear infinite' : 'none'
                                        }}
                                    />
                                </button>
                                <button
                                    onClick={() => handleDelete(conn.id)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Disconnect"
                                >
                                    <Trash2 size={16} style={{ color: '#EF4444' }} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Exchange Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '1rem'
                        }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '480px',
                                background: colors.bgSecondary,
                                borderRadius: '20px',
                                overflow: 'hidden',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                borderBottom: `1px solid ${colors.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                                    {selectedExchange ? `Connect ${selectedExchange.name}` : 'Add Exchange'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedExchange(null);
                                        setFormData({ api_key: '', api_secret: '', passphrase: '', label: '' });
                                        setTestResult(null);
                                        setError('');
                                    }}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={18} style={{ color: colors.textMuted }} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div style={{ padding: '1.5rem' }}>
                                {!selectedExchange ? (
                                    // Exchange Selection
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                        {exchanges.map((ex) => (
                                            <button
                                                key={ex.id}
                                                onClick={() => setSelectedExchange(ex)}
                                                style={{
                                                    padding: '1rem',
                                                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.5rem' }}>{EXCHANGE_LOGOS[ex.id] || '📊'}</span>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: colors.textPrimary }}>{ex.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                                                        {ex.has_futures ? 'Spot + Futures' : 'Spot only'}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    // API Key Form
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Security Notice */}
                                        <div style={{
                                            padding: '0.875rem',
                                            background: isDark ? 'rgba(88, 204, 2, 0.1)' : 'rgba(88, 204, 2, 0.08)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem'
                                        }}>
                                            <Shield size={18} style={{ color: accents.green, flexShrink: 0, marginTop: '2px' }} />
                                            <div style={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                                                Your API keys are encrypted with AES-256 before storage. We only need <strong>read-only</strong> permissions.
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: colors.textSecondary, marginBottom: '0.5rem' }}>
                                                API Key
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.api_key}
                                                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                                placeholder="Enter your API key"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem 1rem',
                                                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '10px',
                                                    color: colors.textPrimary,
                                                    fontSize: '0.9375rem',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: colors.textSecondary, marginBottom: '0.5rem' }}>
                                                API Secret
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.api_secret}
                                                onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                                                placeholder="Enter your API secret"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem 1rem',
                                                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '10px',
                                                    color: colors.textPrimary,
                                                    fontSize: '0.9375rem',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        {selectedExchange.requires_passphrase && (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: colors.textSecondary, marginBottom: '0.5rem' }}>
                                                    Passphrase
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.passphrase}
                                                    onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                                                    placeholder="Enter your passphrase"
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem 1rem',
                                                        background: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '10px',
                                                        color: colors.textPrimary,
                                                        fontSize: '0.9375rem',
                                                        outline: 'none'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: colors.textSecondary, marginBottom: '0.5rem' }}>
                                                Label (optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.label}
                                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                                placeholder={`e.g., "Main ${selectedExchange.name} Account"`}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem 1rem',
                                                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '10px',
                                                    color: colors.textPrimary,
                                                    fontSize: '0.9375rem',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        {error && (
                                            <div style={{
                                                padding: '0.75rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: '#EF4444',
                                                fontSize: '0.875rem'
                                            }}>
                                                <AlertCircle size={16} /> {error}
                                            </div>
                                        )}

                                        {testResult?.success && (
                                            <div style={{
                                                padding: '0.75rem',
                                                background: 'rgba(88, 204, 2, 0.1)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: accents.green,
                                                fontSize: '0.875rem'
                                            }}>
                                                <Check size={16} /> Connection successful! Balance: ${testResult.total_balance_usd?.toFixed(2) || '0.00'}
                                            </div>
                                        )}

                                        {/* Buttons */}
                                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedExchange(null);
                                                    setFormData({ api_key: '', api_secret: '', passphrase: '', label: '' });
                                                    setTestResult(null);
                                                    setError('');
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    color: colors.textPrimary,
                                                    fontWeight: 600,
                                                    fontSize: '0.9375rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleTest}
                                                disabled={!formData.api_key || !formData.api_secret || isTesting}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: accents.blue,
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    fontSize: '0.9375rem',
                                                    cursor: 'pointer',
                                                    opacity: (!formData.api_key || !formData.api_secret || isTesting) ? 0.5 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                {isTesting ? <><Loader2 size={16} className="animate-spin" /> Testing...</> : 'Test Connection'}
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleConnect}
                                            disabled={!testResult?.success || isLoading}
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem',
                                                background: accents.green,
                                                border: 'none',
                                                borderRadius: '10px',
                                                color: '#fff',
                                                fontWeight: 600,
                                                fontSize: '0.9375rem',
                                                cursor: 'pointer',
                                                opacity: (!testResult?.success || isLoading) ? 0.5 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Connecting...</> : 'Connect Exchange'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}

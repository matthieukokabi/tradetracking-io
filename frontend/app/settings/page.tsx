"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useStyle } from '@/contexts/StyleContext';
import ExchangeConnection from '@/components/ExchangeConnection';
import { Settings, CreditCard, Bell, Shield, User, Sun, Moon, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { isDark, toggleDarkMode, accents } = useStyle();

    const colors = isDark ? {
        bgPrimary: '#0A0A0B',
        bgSecondary: '#111113',
        bgCard: 'rgba(255,255,255,0.03)',
        textPrimary: '#FFFFFF',
        textSecondary: '#A1A1AA',
        textMuted: '#71717A',
        border: 'rgba(255,255,255,0.06)',
        navBg: 'rgba(10, 10, 11, 0.9)',
    } : {
        bgPrimary: '#FAFAFA',
        bgSecondary: '#FFFFFF',
        bgCard: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#4B5563',
        textMuted: '#6B7280',
        border: 'rgba(0,0,0,0.06)',
        navBg: 'rgba(250, 250, 250, 0.9)',
    };

    if (status === 'loading') {
        return (
            <div style={{
                minHeight: '100vh',
                background: colors.bgPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: colors.textMuted }}>Loading...</div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/auth/login');
        return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = (session as any)?.accessToken || '';

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bgPrimary,
            color: colors.textPrimary
        }}>
            {/* Navigation */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                padding: '1rem 1.5rem',
                background: colors.navBg,
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${colors.border}`,
            }}>
                <div style={{
                    maxWidth: '1120px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: colors.textPrimary }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: accents.gradient,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <TrendingUp size={18} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Trade Tracking</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button onClick={toggleDarkMode} style={{
                            width: '40px', height: '40px',
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            {isDark ? <Sun size={18} style={{ color: accents.orange }} /> : <Moon size={18} style={{ color: colors.textMuted }} />}
                        </button>
                        <Link href="/dashboard" style={{
                            padding: '0.625rem 1.25rem',
                            background: accents.green,
                            color: '#fff',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textDecoration: 'none'
                        }}>
                            Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>
                    Settings
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {[
                            { icon: User, label: 'Profile', active: false },
                            { icon: Settings, label: 'Exchanges', active: true },
                            { icon: CreditCard, label: 'Subscription', active: false },
                            { icon: Bell, label: 'Notifications', active: false },
                            { icon: Shield, label: 'Security', active: false },
                        ].map((item, i) => (
                            <button
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    background: item.active ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : 'transparent',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: item.active ? colors.textPrimary : colors.textMuted,
                                    fontWeight: item.active ? 600 : 400,
                                    fontSize: '0.9375rem',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{
                        background: colors.bgSecondary,
                        borderRadius: '20px',
                        border: `1px solid ${colors.border}`,
                        padding: '1.5rem'
                    }}>
                        <ExchangeConnection
                            apiUrl={apiUrl}
                            token={token}
                            onConnectionChange={() => {
                                // Refresh data when connection changes
                                console.log('Exchange connection changed');
                            }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

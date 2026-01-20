"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStyle } from '@/contexts/StyleContext';
import {
    Zap, Shield, LineChart, TrendingUp, Brain, BarChart3,
    RefreshCw, Globe, Users, Bell, Calendar, Target, Lock,
    Cpu, Sun, Moon, ArrowRight
} from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'Instant Exchange Sync',
        description: 'Connect Binance, Bybit, OKX, Coinbase, Kraken, and 10+ more exchanges. Trades sync automatically in real-time.',
        color: '#1CB0F6'
    },
    {
        icon: Brain,
        title: '5 AI Agents',
        description: 'Neural analysis, risk management, psychology tracking, strategy optimization, and mentorship - all working 24/7.',
        color: '#8B5CF6'
    },
    {
        icon: Shield,
        title: 'Bank-Grade Security',
        description: 'AES-256 encryption for API keys. Read-only permissions only. Your funds stay in your control, always.',
        color: '#58CC02'
    },
    {
        icon: LineChart,
        title: 'Deep Analytics',
        description: 'Win rate, profit factor, expectancy, drawdown analysis, and more. Institutional-grade insights.',
        color: '#FF9600'
    },
    {
        icon: Calendar,
        title: 'Trade Calendar',
        description: 'Visual calendar view of all your trades. See patterns in your trading behavior over time.',
        color: '#1CB0F6'
    },
    {
        icon: Target,
        title: 'TiltMeter',
        description: 'Track your emotional state before and after trades. Identify when emotions hurt your performance.',
        color: '#EF4444'
    },
    {
        icon: RefreshCw,
        title: 'Trade Replay',
        description: 'Replay your trades step-by-step. Understand what happened and learn from every entry and exit.',
        color: '#8B5CF6'
    },
    {
        icon: Users,
        title: 'Leaderboard',
        description: 'Compare your performance with other traders. Learn from the best and climb the ranks.',
        color: '#58CC02'
    },
    {
        icon: Bell,
        title: 'Smart Alerts',
        description: 'Get notified about unusual patterns, risk thresholds, and market conditions that affect your trades.',
        color: '#FF9600'
    },
    {
        icon: Globe,
        title: 'News Intelligence',
        description: 'AI-curated market news and sentiment analysis. Stay informed without the noise.',
        color: '#1CB0F6'
    },
    {
        icon: BarChart3,
        title: 'Performance Reports',
        description: 'Weekly and monthly performance reports. Track your progress and identify areas to improve.',
        color: '#8B5CF6'
    },
    {
        icon: Lock,
        title: '2FA Security',
        description: 'Two-factor authentication with backup codes. Keep your trading data secure.',
        color: '#58CC02'
    }
];

export default function FeaturesPage() {
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

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bgPrimary,
            color: colors.textPrimary,
            transition: 'all 0.3s ease'
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
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: colors.textPrimary }}>
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
                        <Link href="/pricing" style={{ padding: '0.625rem 1.25rem', color: colors.textSecondary, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                            Pricing
                        </Link>
                        <Link href="/auth/register" style={{
                            padding: '0.625rem 1.25rem',
                            background: accents.green,
                            color: '#fff',
                            borderRadius: '10px',
                            fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            Start Free <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <section style={{ padding: '4rem 1.5rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: colors.bgSecondary,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '100px',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: colors.textSecondary,
                        marginBottom: '1.5rem'
                    }}
                >
                    <Cpu size={14} style={{ color: accents.purple }} />
                    12+ Premium Features
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}
                >
                    Everything You Need to{' '}
                    <span style={{ background: accents.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Trade Better
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: '1.125rem', color: colors.textMuted }}
                >
                    Powerful tools built by traders, for traders. All designed to give you an edge.
                </motion.p>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '2rem 1.5rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem'
                }}>
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4 }}
                            style={{
                                padding: '1.5rem',
                                background: colors.bgSecondary,
                                borderRadius: '16px',
                                border: `1px solid ${colors.border}`,
                                cursor: 'default',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '44px',
                                height: '44px',
                                background: isDark ? `${feature.color}20` : `${feature.color}15`,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <feature.icon size={22} style={{ color: feature.color }} />
                            </div>
                            <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>
                                {feature.title}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: colors.textMuted, lineHeight: 1.6 }}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '3rem 1.5rem',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        padding: '2.5rem',
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(88, 204, 2, 0.1), rgba(28, 176, 246, 0.1))'
                            : 'linear-gradient(135deg, rgba(88, 204, 2, 0.08), rgba(28, 176, 246, 0.08))',
                        borderRadius: '24px',
                        border: `1px solid ${colors.border}`
                    }}
                >
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        Ready to level up your trading?
                    </h2>
                    <p style={{ color: colors.textMuted, marginBottom: '1.5rem' }}>
                        Start free and upgrade anytime. No credit card required.
                    </p>
                    <Link href="/auth/register" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.875rem 1.75rem',
                        background: accents.green,
                        color: '#fff',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        textDecoration: 'none',
                        boxShadow: isDark ? '0 0 30px rgba(88, 204, 2, 0.4)' : '0 4px 14px rgba(88, 204, 2, 0.35)'
                    }}>
                        Start Free Trial <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '2rem 1.5rem', textAlign: 'center', borderTop: `1px solid ${colors.border}`, fontSize: '0.8125rem', color: colors.textMuted }}>
                © 2026 Trade Tracking. Crafted for traders, by traders.
            </footer>
        </div>
    );
}

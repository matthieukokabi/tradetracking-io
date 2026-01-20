"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStyle } from '@/contexts/StyleContext';
import { Check, Zap, Crown, Rocket, TrendingUp, Sun, Moon } from 'lucide-react';

const plans = [
    {
        id: 'starter',
        name: 'Free',
        price: '$0',
        monthlyPrice: 0,
        yearlyPrice: 0,
        description: 'Perfect for getting started',
        features: [
            '1 Exchange Connection',
            'Live Portfolio Sync',
            'Basic Trade Analytics',
            'Intelligence Hub Access',
            'Public Leaderboard'
        ],
        buttonText: 'Get Started Free',
        highlight: false,
        icon: Rocket
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$19',
        monthlyPrice: 19,
        yearlyPrice: 149,
        description: 'For serious traders',
        features: [
            '5 Exchange Connections',
            'AI Market Sentiment PRO',
            'Detailed Performance Analytics',
            'Trade Replay (Alpha)',
            'Custom Journaling Labels',
            'Priority Email Support'
        ],
        buttonText: 'Upgrade to Pro',
        highlight: true,
        badge: 'Most Popular',
        icon: Zap
    },
    {
        id: 'elite',
        name: 'Elite',
        price: '$29',
        monthlyPrice: 29,
        yearlyPrice: 229,
        description: 'For professional traders',
        features: [
            'Unlimited Connections',
            'Multi-Agent Suite Access',
            'Advanced Risk Manager',
            'Institutional Backtesting',
            'Private Community Access',
            'API Access (Beta)',
            '24/7 Priority Support'
        ],
        buttonText: 'Join Elite',
        highlight: false,
        icon: Crown
    }
];

export default function PricingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { isDark, toggleDarkMode, accents } = useStyle();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

    const handleSubscribe = (planId: string) => {
        if (!session) {
            router.push('/auth/register');
            return;
        }
        // TODO: Implement Stripe checkout
        router.push('/dashboard');
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
                        <Link href="/auth/login" style={{ padding: '0.625rem 1.25rem', color: colors.textSecondary, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                            Login
                        </Link>
                        <Link href="/auth/register" style={{
                            padding: '0.625rem 1.25rem',
                            background: isDark ? '#fff' : colors.textPrimary,
                            color: isDark ? '#000' : '#fff',
                            borderRadius: '10px',
                            fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none'
                        }}>
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <section style={{ padding: '4rem 1.5rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}
                >
                    Simple, Transparent Pricing
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ fontSize: '1.125rem', color: colors.textMuted, marginBottom: '2rem' }}
                >
                    Start free, upgrade when you need more. No hidden fees.
                </motion.p>

                {/* Billing Toggle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: 'inline-flex',
                        background: colors.bgSecondary,
                        borderRadius: '12px',
                        padding: '4px',
                        border: `1px solid ${colors.border}`
                    }}
                >
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            background: billingCycle === 'monthly' ? accents.green : 'transparent',
                            color: billingCycle === 'monthly' ? '#fff' : colors.textMuted,
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            background: billingCycle === 'yearly' ? accents.green : 'transparent',
                            color: billingCycle === 'yearly' ? '#fff' : colors.textMuted,
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}
                    >
                        Yearly <span style={{ color: billingCycle === 'yearly' ? '#fff' : accents.green }}>(-35%)</span>
                    </button>
                </motion.div>
            </section>

            {/* Pricing Cards */}
            <section style={{ padding: '2rem 1.5rem 4rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            style={{
                                padding: '2rem',
                                background: plan.highlight
                                    ? (isDark ? 'linear-gradient(135deg, rgba(88, 204, 2, 0.1), rgba(28, 176, 246, 0.1))' : 'linear-gradient(135deg, rgba(88, 204, 2, 0.08), rgba(28, 176, 246, 0.08))')
                                    : colors.bgSecondary,
                                borderRadius: '20px',
                                border: plan.highlight ? `2px solid ${accents.green}` : `1px solid ${colors.border}`,
                                position: 'relative',
                                boxShadow: plan.highlight ? (isDark ? '0 0 40px rgba(88, 204, 2, 0.15)' : '0 8px 30px rgba(88, 204, 2, 0.15)') : 'none'
                            }}
                        >
                            {plan.badge && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: accents.green,
                                    color: '#fff',
                                    padding: '0.25rem 1rem',
                                    borderRadius: '100px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    {plan.badge}
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: plan.highlight ? accents.green : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <plan.icon size={20} color={plan.highlight ? '#fff' : colors.textMuted} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>{plan.name}</h3>
                                    <p style={{ fontSize: '0.8125rem', color: colors.textMuted, margin: 0 }}>{plan.description}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                                    ${billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                                </span>
                                <span style={{ color: colors.textMuted, fontSize: '0.875rem' }}>/month</span>
                                {billingCycle === 'yearly' && plan.yearlyPrice > 0 && (
                                    <div style={{ fontSize: '0.8125rem', color: colors.textMuted }}>
                                        Billed ${plan.yearlyPrice}/year
                                    </div>
                                )}
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0' }}>
                                {plan.features.map((feature, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                                        <Check size={16} style={{ color: accents.green, flexShrink: 0 }} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: plan.highlight ? accents.green : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                                    color: plan.highlight ? '#fff' : colors.textPrimary,
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '0.9375rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '2rem 1.5rem', textAlign: 'center', borderTop: `1px solid ${colors.border}`, fontSize: '0.8125rem', color: colors.textMuted }}>
                © 2026 Trade Tracking. All plans include a 7-day money-back guarantee.
            </footer>
        </div>
    );
}

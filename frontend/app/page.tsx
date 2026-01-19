"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStyle } from '@/contexts/StyleContext';
import {
    Zap, Shield, LineChart, TrendingUp, ArrowRight,
    Bell, Brain, Play, Users, Cpu, Database, Timer,
    CheckCircle2, Rocket, Sun, Moon
} from 'lucide-react';

// Vibe Landing Page - "Notion-clean meets Duolingo-friendly"

export default function VibeLanding() {
    const router = useRouter();
    const { isDark, toggleDarkMode, accents } = useStyle();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Vibe Coding Color Palette - Light & Dark
    const lightColors = {
        bgPrimary: '#FAFAFA',
        bgSecondary: '#FFFFFF',
        bgSoft: '#F3F4F6',
        bgCard: '#FFFFFF',
        bgHover: '#F9FAFB',
        textPrimary: '#111827',
        textSecondary: '#4B5563',
        textMuted: '#6B7280',
        textSubtle: '#9CA3AF',
        border: 'rgba(0,0,0,0.06)',
        borderHover: 'rgba(0,0,0,0.12)',
        navBg: 'rgba(250, 250, 250, 0.9)',
        gridDot: 'rgba(0,0,0,0.02)',
        cardShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cardShadowHover: '0 4px 20px rgba(0,0,0,0.08)'
    };

    const darkColors = {
        bgPrimary: '#0A0A0B',
        bgSecondary: '#111113',
        bgSoft: '#1A1A1D',
        bgCard: 'rgba(255,255,255,0.03)',
        bgHover: 'rgba(255,255,255,0.05)',
        textPrimary: '#FFFFFF',
        textSecondary: '#A1A1AA',
        textMuted: '#71717A',
        textSubtle: '#52525B',
        border: 'rgba(255,255,255,0.06)',
        borderHover: 'rgba(255,255,255,0.12)',
        navBg: 'rgba(10, 10, 11, 0.9)',
        gridDot: 'rgba(255,255,255,0.02)',
        cardShadow: 'none',
        cardShadowHover: '0 0 30px rgba(88, 204, 2, 0.1)'
    };

    const colors = isDark ? darkColors : lightColors;

    const features = [
        {
            icon: Zap,
            title: 'Instant Sync',
            description: 'Connect Binance, Bybit, OKX and 10+ exchanges in seconds. Your trades sync automatically.',
            color: accents.blue,
            bgColor: isDark ? 'rgba(28, 176, 246, 0.12)' : 'rgba(28, 176, 246, 0.1)'
        },
        {
            icon: Brain,
            title: '5 AI Agents',
            description: 'Neural, risk, psychology, strategy and mentor agents work 24/7 to optimize your edge.',
            color: accents.purple,
            bgColor: isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.1)'
        },
        {
            icon: Shield,
            title: 'Bank-Grade Security',
            description: 'Read-only API keys. AES-256 encryption. Your capital stays in your control, always.',
            color: accents.green,
            bgColor: isDark ? 'rgba(88, 204, 2, 0.12)' : 'rgba(88, 204, 2, 0.1)'
        },
        {
            icon: LineChart,
            title: 'Deep Analytics',
            description: 'Visualize your performance with institutional-grade charts and insights.',
            color: accents.orange,
            bgColor: isDark ? 'rgba(255, 150, 0, 0.12)' : 'rgba(255, 150, 0, 0.1)'
        }
    ];

    const stats = [
        { value: '10K+', label: 'Active Traders', icon: Users },
        { value: '10+', label: 'Exchanges', icon: Database },
        { value: '5', label: 'AI Agents', icon: Cpu },
        { value: '99.9%', label: 'Uptime', icon: Timer }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubmitted(true);
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bgPrimary,
            color: colors.textPrimary,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            overflowX: 'hidden',
            transition: 'background 0.3s ease, color 0.3s ease'
        }}>

            {/* Background Pattern */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: `radial-gradient(circle at 1px 1px, ${colors.gridDot} 1px, transparent 0)`,
                backgroundSize: '20px 20px',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Background Glow (Dark mode) */}
            {isDark && (
                <div style={{
                    position: 'fixed',
                    top: '-50%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(ellipse at center, rgba(88, 204, 2, 0.08) 0%, transparent 60%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
            )}

            {/* Navigation */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                padding: '1rem 1.5rem',
                background: colors.navBg,
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${colors.border}`,
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    maxWidth: '1120px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: accents.gradient,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isDark ? '0 0 20px rgba(88, 204, 2, 0.3)' : '0 2px 8px rgba(88, 204, 2, 0.3)'
                        }}>
                            <TrendingUp size={18} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Trade Tracking</span>
                    </div>

                    {/* Right Side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            style={{
                                width: '40px',
                                height: '40px',
                                background: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            aria-label="Toggle dark mode"
                        >
                            {isDark ? (
                                <Sun size={18} style={{ color: accents.orange }} />
                            ) : (
                                <Moon size={18} style={{ color: colors.textMuted }} />
                            )}
                        </button>

                        {/* Login Button */}
                        <Link
                            href="/auth/login"
                            style={{
                                padding: '0.625rem 1.25rem',
                                background: 'transparent',
                                color: colors.textSecondary,
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Login
                        </Link>
                        {/* CTA Button */}
                        <Link
                            href="/auth/register"
                            style={{
                                padding: '0.625rem 1.25rem',
                                background: isDark ? '#fff' : colors.textPrimary,
                                color: isDark ? '#000' : '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                position: 'relative',
                zIndex: 10,
                padding: '4rem 1.5rem 3rem',
                textAlign: 'center',
                maxWidth: '720px',
                margin: '0 auto'
            }}>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                >
                    {/* Badge */}
                    <motion.div variants={fadeInUp}>
                        <span style={{
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
                            boxShadow: colors.cardShadow
                        }}>
                            <Rocket size={14} style={{ color: accents.blue }} />
                            Built for serious traders
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeInUp}
                        style={{
                            fontSize: 'clamp(2rem, 6vw, 3.25rem)',
                            fontWeight: 800,
                            lineHeight: 1.15,
                            letterSpacing: '-0.03em',
                            marginTop: '1.5rem',
                            marginBottom: '1rem'
                        }}
                    >
                        Master Your Trading{' '}
                        <span style={{
                            background: accents.gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Edge
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={fadeInUp}
                        style={{
                            fontSize: '1.0625rem',
                            color: colors.textMuted,
                            lineHeight: 1.7,
                            marginBottom: '2rem'
                        }}
                    >
                        The automated journal for serious traders. Connect your exchanges,
                        get AI-powered insights, and level up your performance.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={fadeInUp}
                        style={{
                            display: 'flex',
                            gap: '0.75rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}
                    >
                        <button
                            onClick={() => router.push('/auth/register')}
                            style={{
                                padding: '0.875rem 1.75rem',
                                background: accents.green,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: isDark ? '0 0 30px rgba(88, 204, 2, 0.4)' : '0 4px 14px rgba(88, 204, 2, 0.35)'
                            }}
                        >
                            Start Free Trial
                            <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => router.push('/features')}
                            style={{
                                padding: '0.875rem 1.75rem',
                                background: colors.bgSecondary,
                                color: colors.textPrimary,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Play size={16} />
                            Watch Demo
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats Row */}
            <section style={{
                padding: '2rem 1.5rem',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem'
                }} className="stats-grid">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                textAlign: 'center',
                                padding: '1.25rem',
                                background: colors.bgSecondary,
                                borderRadius: '16px',
                                border: `1px solid ${colors.border}`,
                                boxShadow: colors.cardShadow,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <stat.icon size={20} style={{ color: accents.blue, marginBottom: '0.5rem' }} />
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: colors.textPrimary
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: colors.textSubtle,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section style={{
                padding: '3rem 1.5rem',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: colors.textSubtle,
                        marginBottom: '2rem'
                    }}
                >
                    Everything You Need
                </motion.h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem'
                }}>
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -4 }}
                            style={{
                                padding: '1.5rem',
                                background: colors.bgSecondary,
                                borderRadius: '20px',
                                border: `1px solid ${colors.border}`,
                                boxShadow: colors.cardShadow,
                                cursor: 'default',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: feature.bgColor,
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <feature.icon size={24} style={{ color: feature.color }} />
                            </div>
                            <h3 style={{
                                fontWeight: 600,
                                fontSize: '1rem',
                                marginBottom: '0.5rem',
                                color: colors.textPrimary
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{
                                fontSize: '0.875rem',
                                color: colors.textMuted,
                                lineHeight: 1.6
                            }}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Email Signup Section */}
            <section style={{
                padding: '3rem 1.5rem 4rem',
                maxWidth: '480px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        padding: '2rem',
                        background: colors.bgSecondary,
                        borderRadius: '24px',
                        border: `1px solid ${colors.border}`,
                        boxShadow: isDark ? '0 0 40px rgba(88, 204, 2, 0.08)' : '0 4px 20px rgba(0,0,0,0.06)'
                    }}
                >
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(88, 204, 2, 0.2), rgba(28, 176, 246, 0.2))'
                            : 'linear-gradient(135deg, rgba(88, 204, 2, 0.15), rgba(28, 176, 246, 0.15))',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <Bell size={26} style={{ color: accents.green }} />
                    </div>

                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: colors.textPrimary
                    }}>
                        Get Early Access
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: colors.textMuted,
                        marginBottom: '1.5rem'
                    }}>
                        Be the first to know when we launch. Join 10K+ traders on the waitlist.
                    </p>

                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '1rem',
                                    background: isDark ? 'rgba(88, 204, 2, 0.15)' : 'rgba(88, 204, 2, 0.1)',
                                    borderRadius: '12px',
                                    color: accents.green,
                                    fontWeight: 500
                                }}
                            >
                                <CheckCircle2 size={20} />
                                You&apos;re on the list!
                            </motion.div>
                        ) : (
                            <motion.form key="form" onSubmit={handleSubmit}>
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            background: colors.bgSoft,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '10px',
                                            fontSize: '0.9375rem',
                                            color: colors.textPrimary,
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.25rem',
                                            background: isDark ? '#fff' : colors.textPrimary,
                                            color: isDark ? '#000' : '#fff',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Join
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                borderTop: `1px solid ${colors.border}`,
                fontSize: '0.8125rem',
                color: colors.textSubtle
            }}>
                © 2026 Trade Tracking. Crafted for traders, by traders.
            </footer>

            {/* Responsive Styles */}
            <style jsx global>{`
                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
            `}</style>
        </div>
    );
}

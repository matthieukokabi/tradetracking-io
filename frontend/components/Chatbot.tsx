"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, HelpCircle } from 'lucide-react';

// FAQ Knowledge Base
const FAQ_DATA: Record<string, { answer: string; keywords: string[] }> = {
    "what is tradetracking": {
        answer: "Trade Tracking is an AI-powered trading journal that helps you track, analyze, and improve your trading performance. We automatically sync trades from 10+ exchanges and provide advanced analytics, emotional tracking, and AI-driven insights.",
        keywords: ["tradetracking", "what", "about", "platform", "app", "trading journal"]
    },
    "how do i get started": {
        answer: "Getting started is easy! 1️⃣ Create a free account. 2️⃣ Connect your exchange with API keys. 3️⃣ Your trades sync automatically! You'll see your dashboard with all your trading data within minutes.",
        keywords: ["start", "begin", "signup", "register", "create account", "get started", "how to"]
    },
    "is it free": {
        answer: "Yes! We offer a generous Free Starter plan that includes 1 exchange connection, basic analytics, and trade tracking. For unlimited connections and advanced AI features, check out our Pro ($19/mo) and Elite ($29/mo) plans.",
        keywords: ["free", "cost", "price", "pay", "money", "subscription"]
    },
    "pricing plans": {
        answer: "We have 3 plans:\n\n🆓 Starter (Free): 1 exchange, basic analytics\n💎 Pro ($19/mo): 5 exchanges, advanced analytics, priority support\n👑 Elite ($29/mo): Unlimited exchanges, all AI agents, trade replay\n\nAll paid plans have a 7-day money-back guarantee!",
        keywords: ["price", "pricing", "plans", "cost", "subscription", "tier", "pro", "elite"]
    },
    "supported exchanges": {
        answer: "We support 10+ major exchanges:\n• CEX: Binance, Bybit, OKX, Coinbase, Kraken, KuCoin, Bitget\n• DEX: Hyperliquid, dYdX\n\nMore coming soon!",
        keywords: ["exchange", "binance", "bybit", "okx", "coinbase", "supported", "connect"]
    },
    "is my api key safe": {
        answer: "Yes, your API keys are 100% secure! 🔐\n\n• Keys are encrypted with AES-256 before storage\n• We only need read-only permissions (no withdrawals!)\n• Keys are never logged or visible in plain text\n• You can delete your keys anytime",
        keywords: ["api", "key", "safe", "secure", "security", "encryption"]
    },
    "what is tiltmeter": {
        answer: "TiltMeter is our unique psychology tracking tool! 🧠\n\nIt helps you:\n• Rate your emotional state before trades\n• Track discipline and rule-following\n• Identify patterns in emotional trading\n\nBetter emotions = better trading!",
        keywords: ["tiltmeter", "tilt", "emotion", "psychology", "mental", "feeling"]
    },
    "what are ai agents": {
        answer: "Our 5 AI Agents work 24/7 to help you trade better:\n\n🔍 Analysis Agent: Finds patterns in your trades\n📊 Risk Agent: Monitors risk exposure\n📈 Performance Agent: Tracks your progress\n🧠 Psychology Agent: Detects emotional patterns\n📰 News Agent: Curates market news",
        keywords: ["ai", "agent", "agents", "artificial", "intelligence", "bot"]
    },
    "contact support": {
        answer: "Need help? Here's how to reach us:\n\n📧 Email: support@tradetracking.io\n💬 In-app chat (you're using it!)\n🐦 Twitter: @TradeTrackingIO\n\nWe typically respond within 24 hours!",
        keywords: ["contact", "support", "help", "email", "reach", "talk"]
    }
};

const SUGGESTED_QUESTIONS = [
    "What is Trade Tracking?",
    "How do I get started?",
    "Which exchanges are supported?",
    "Is my API key safe?",
    "What are AI agents?"
];

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: '1',
                text: "Hi! 👋 I'm your Trade Tracking assistant. How can I help you today?",
                isBot: true,
                timestamp: new Date()
            }]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const findBestMatch = (query: string): string => {
        const lowerQuery = query.toLowerCase();
        let bestMatch = { key: '', score: 0 };

        for (const [key, data] of Object.entries(FAQ_DATA)) {
            let score = 0;
            for (const keyword of data.keywords) {
                if (lowerQuery.includes(keyword.toLowerCase())) {
                    score += keyword.length;
                }
            }
            if (score > bestMatch.score) {
                bestMatch = { key, score };
            }
        }

        if (bestMatch.score > 0) {
            return FAQ_DATA[bestMatch.key].answer;
        }
        return "I'm not sure about that. Try asking about pricing, exchanges, features, or security. You can also email support@tradetracking.io for help!";
    };

    const handleSend = (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            isBot: false,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: findBestMatch(messageText),
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 500 + Math.random() * 500);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #58CC02 0%, #1CB0F6 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(88, 204, 2, 0.4)',
                    zIndex: 1000,
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <MessageCircle size={24} color="#fff" />
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '520px',
            maxHeight: 'calc(100vh - 100px)',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #58CC02 0%, #1CB0F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Bot size={20} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9375rem' }}>Trade Assistant</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Always here to help</div>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={18} color="#fff" />
                </button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                background: '#f9fafb'
            }}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            flexDirection: msg.isBot ? 'row' : 'row-reverse'
                        }}
                    >
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: msg.isBot ? '#58CC02' : '#1CB0F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {msg.isBot ? <Bot size={14} color="#fff" /> : <User size={14} color="#fff" />}
                        </div>
                        <div style={{
                            maxWidth: '75%',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            background: msg.isBot ? '#fff' : '#1CB0F6',
                            color: msg.isBot ? '#111827' : '#fff',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            boxShadow: msg.isBot ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#58CC02',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Bot size={14} color="#fff" />
                        </div>
                        <div style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            background: '#fff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            <span style={{ display: 'inline-flex', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF', animation: 'pulse 1s infinite' }} />
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF', animation: 'pulse 1s infinite 0.2s' }} />
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF', animation: 'pulse 1s infinite 0.4s' }} />
                            </span>
                        </div>
                    </div>
                )}

                {messages.length === 1 && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <HelpCircle size={12} /> Quick questions:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: '#fff',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '0.8125rem',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '1rem',
                borderTop: '1px solid #E5E7EB',
                background: '#fff'
            }}>
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    style={{ display: 'flex', gap: '0.5rem' }}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: '1px solid #E5E7EB',
                            borderRadius: '10px',
                            fontSize: '0.9375rem',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            background: input.trim() ? '#58CC02' : '#E5E7EB',
                            border: 'none',
                            cursor: input.trim() ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Send size={18} color={input.trim() ? '#fff' : '#9CA3AF'} />
                    </button>
                </form>
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

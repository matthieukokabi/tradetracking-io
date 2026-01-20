"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Mail, Bell, Lock } from "lucide-react";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown to launch (set your launch date here)
  useEffect(() => {
    const launchDate = new Date("2026-02-15T00:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to backend/email service
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[length:24px_24px]" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">TradeTracking.io</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Something Amazing
          <br />
          <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Is Coming
          </span>
        </h1>

        <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
          We&apos;re building the ultimate trading journal with AI-powered analytics.
          Be the first to know when we launch.
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-4 mb-10 max-w-md mx-auto">
          {[
            { label: "Days", value: countdown.days },
            { label: "Hours", value: countdown.hours },
            { label: "Minutes", value: countdown.minutes },
            { label: "Seconds", value: countdown.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-4"
            >
              <div className="text-3xl md:text-4xl font-bold text-white">
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Email signup */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Notify Me
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-green-400 font-medium">
              Thanks! We&apos;ll notify you when we launch.
            </p>
          </div>
        )}

        {/* Features preview */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
          {[
            { label: "10+ Exchanges", icon: "🔗" },
            { label: "AI Analytics", icon: "🤖" },
            { label: "Real-time Sync", icon: "⚡" },
          ].map((feature) => (
            <div key={feature.label} className="text-zinc-400 text-sm">
              <div className="text-2xl mb-1">{feature.icon}</div>
              {feature.label}
            </div>
          ))}
        </div>

        {/* Admin access link */}
        <div className="mt-16 pt-8 border-t border-zinc-800">
          <a
            href="/admin-access"
            className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-500 transition-colors"
          >
            <Lock className="w-3 h-3" />
            Admin Access
          </a>
        </div>
      </div>
    </div>
  );
}

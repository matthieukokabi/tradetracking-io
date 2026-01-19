"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function ServerStatus() {
  const [status, setStatus] = useState<string>("checking...");
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await api.healthCheck();
        setStatus(`${data.status} (v${data.service})`);
        setIsOnline(true);
      } catch (error) {
        console.error("Health check failed:", error);
        setStatus("Offline");
        setIsOnline(false);
      }
    };

    checkHealth();
    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 border ${
      isOnline
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900"
        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900"
    }`}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
      <span>{status}</span>
    </div>
  );
}

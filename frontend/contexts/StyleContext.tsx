"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StyleContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
  accents: {
    green: string;
    blue: string;
    purple: string;
    orange: string;
    gradient: string;
  };
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export function StyleProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference
    const stored = localStorage.getItem('vibeThemeDark');
    if (stored !== null) {
      setIsDark(stored === 'true');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    // Update document class for Tailwind dark mode
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem('vibeThemeDark', String(newValue));
  };

  const accents = {
    green: '#58CC02',       // Duo green
    blue: '#1CB0F6',        // Duo blue
    purple: '#8B5CF6',      // Friendly purple
    orange: '#FF9600',      // Warm orange
    gradient: 'linear-gradient(135deg, #58CC02 0%, #1CB0F6 100%)'
  };

  return (
    <StyleContext.Provider value={{ isDark, toggleDarkMode, accents }}>
      {children}
    </StyleContext.Provider>
  );
}

export function useStyle() {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
}

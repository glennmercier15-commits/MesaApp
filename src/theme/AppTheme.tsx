import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export const lightTheme = {
  mode: 'light',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F6',
  cardGlass: 'rgba(255, 255, 255, 0.8)',
  cardGlassStrong: '#FFFFFF',
  primary: '#00BCD4',
  primaryDark: '#00838F',
  secondary: '#EEF1F6',
  accent: '#00BCD4',
  text: '#1A2340',
  textMuted: '#6B7A9A',
  border: 'rgba(0, 0, 0, 0.08)',
  shadow: 'rgba(0, 188, 212, 0.15)',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  tabIdle: '#A0ABBE',
  overlay: 'rgba(0, 0, 0, 0.12)',
};

export const darkTheme = {
  mode: 'dark',
  background: '#0D1B3E',
  surface: '#162044',
  surfaceAlt: '#1E2D5A',
  cardGlass: 'rgba(22, 32, 68, 0.8)',
  cardGlassStrong: '#162044',
  primary: '#00D4E8',
  primaryDark: '#00BCD4',
  secondary: '#1E2D5A',
  accent: '#00D4E8',
  text: '#E8EEFF',
  textMuted: '#7B8DB0',
  border: 'rgba(255, 255, 255, 0.08)',
  shadow: 'rgba(0, 212, 232, 0.1)',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  tabIdle: '#7B8DB0',
  overlay: 'rgba(0, 0, 0, 0.28)',
};

const ThemeContext = createContext(null);

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    colors: mode === 'dark' ? darkTheme : lightTheme,
    isDark: mode === 'dark',
    setMode,
    toggleTheme: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return ctx;
}

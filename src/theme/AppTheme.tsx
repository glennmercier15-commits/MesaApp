import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export const lightTheme = {
  mode: 'light',
  background: '#F7F5F2', // Warm off-white
  surface: '#FFFFFF',
  surfaceAlt: '#F0EFEA', // Light earth tone
  cardGlass: 'rgba(255, 255, 255, 0.8)',
  cardGlassStrong: '#FFFFFF',
  primary: '#3D8B7A', // Safety, Calm
  primaryDark: '#2C6A5C',
  secondary: '#7B9E87', // Growth
  accent: '#C47B5A', // Warmth, Humanity
  text: '#2D3748', // Darker text for readability
  textMuted: '#6B7A8A',
  border: 'rgba(61, 139, 122, 0.1)',
  shadow: 'rgba(61, 139, 122, 0.1)',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#C47B5A',
  tabIdle: '#7B9E87',
  overlay: 'rgba(0, 0, 0, 0.12)',
};

export const darkTheme = {
  mode: 'dark',
  background: '#1A2A26', // Deep earth/teal
  surface: '#243A34',
  surfaceAlt: '#2D453E',
  cardGlass: 'rgba(36, 58, 52, 0.8)',
  cardGlassStrong: '#243A34',
  primary: '#7B9E87', // Lighter for dark mode
  primaryDark: '#3D8B7A',
  secondary: '#3D8B7A',
  accent: '#C47B5A',
  text: '#F7F5F2',
  textMuted: '#A3B4AD',
  border: 'rgba(255, 255, 255, 0.05)',
  shadow: 'rgba(61, 139, 122, 0.1)',
  success: '#66BB6A',
  warning: '#FFB74D',
  danger: '#E57373',
  tabIdle: '#A3B4AD',
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

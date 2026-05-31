import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export const lightTheme = {
  mode: 'light',
  background: '#FAF9F6', // Extremely soft warm alabaster cream (eye-friendly)
  surface: '#FFFFFF',
  surfaceAlt: '#F1EFEA', // Light comforting beige-gray
  cardGlass: 'rgba(255, 255, 255, 0.85)',
  cardGlassStrong: '#FFFFFF',
  primary: '#2D6F61', // Safety, Calm (deepened for optimal >4.5:1 WCAG contrast)
  primaryDark: '#1E4E44',
  secondary: '#4D6D58', // Growth forest green
  accent: '#A65E3C', // Friendly pottery terracotta (very human and accessible)
  text: '#1F2937', // High-contrast coal charcoal (extremely clear/readable)
  textMuted: '#52606D', // Muted slate-gray with healthy 5:1 contrast ratio
  border: 'rgba(45, 111, 97, 0.12)',
  shadow: 'rgba(45, 111, 97, 0.08)',
  success: '#2E7D32', // Deep friendly forest success green
  warning: '#D84315', // Vibrant accessible dark orange/warning
  danger: '#C62828', // Soft high-contrast classic friendly red
  tabIdle: '#7B9E87',
  overlay: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  mode: 'dark',
  background: '#13221E', // Calming deep dark forest spruce
  surface: '#1C2E2A',
  surfaceAlt: '#263D38',
  cardGlass: 'rgba(28, 46, 42, 0.85)',
  cardGlassStrong: '#1C2E2A',
  primary: '#9CD1C5', // Glowing soft mint sage (contrast ~6.5:1 against deep dark)
  primaryDark: '#2D6F61',
  secondary: '#92B7A0',
  accent: '#E09370', // Calming sunset clay
  text: '#F4FAF8', // Cream-white text (gorgeous high-contrast read)
  textMuted: '#9BB0AB', // Sage-tinted muted text with AA compliant readability
  border: 'rgba(156, 209, 197, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.2)',
  success: '#81C784',
  warning: '#FFB74D',
  danger: '#E57373',
  tabIdle: '#9BB0AB',
  overlay: 'rgba(0, 0, 0, 0.3)',
};

const getThemeColors = (mode: 'light' | 'dark', themeName: string) => {
  const base = mode === 'dark' ? darkTheme : lightTheme;
  const colors = { ...base };
  switch (themeName) {
    case 'ocean':
      colors.primary = mode === 'dark' ? '#9CD0F5' : '#1B5E87';
      colors.primaryDark = mode === 'dark' ? '#1B5E87' : '#103C58';
      colors.secondary = mode === 'dark' ? '#8CBBD4' : '#3D687A';
      colors.accent = mode === 'dark' ? '#ED9F77' : '#BD5F32';
      colors.background = mode === 'dark' ? '#11202C' : '#F4F8FA';
      colors.surface = mode === 'dark' ? '#1A2F40' : '#FFFFFF';
      colors.surfaceAlt = mode === 'dark' ? '#233F54' : '#EBF2F5';
      break;
    case 'sunset':
      colors.primary = mode === 'dark' ? '#F8A67B' : '#AE501E';
      colors.primaryDark = mode === 'dark' ? '#AE501E' : '#7F3A15';
      colors.secondary = mode === 'dark' ? '#88B298' : '#2D6F61';
      colors.accent = mode === 'dark' ? '#8BB7CC' : '#336B82';
      colors.background = mode === 'dark' ? '#2A1B14' : '#FAF7F2';
      colors.surface = mode === 'dark' ? '#37251C' : '#FFFFFF';
      colors.surfaceAlt = mode === 'dark' ? '#473226' : '#EFF2EF';
      break;
  }
  return colors;
};

const ThemeContext = createContext(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('themeName') || 'default';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    localStorage.setItem('theme', mode);
    localStorage.setItem('themeName', themeName);

    // Apply exact accessible colors to CSS variables for dynamic Tailwind support!
    const activeColors = getThemeColors(mode, themeName);
    root.style.setProperty('--background', activeColors.background);
    root.style.setProperty('--foreground', activeColors.text);
    root.style.setProperty('--card', activeColors.surface);
    root.style.setProperty('--card-foreground', activeColors.text);
    root.style.setProperty('--popover', activeColors.surface);
    root.style.setProperty('--popover-foreground', activeColors.text);
    root.style.setProperty('--primary', activeColors.primary);
    root.style.setProperty('--primary-foreground', mode === 'dark' ? '#13221E' : '#FFFFFF');
    root.style.setProperty('--secondary', activeColors.surfaceAlt);
    root.style.setProperty('--secondary-foreground', activeColors.text);
    root.style.setProperty('--muted-foreground', activeColors.textMuted);
    root.style.setProperty('--accent', activeColors.accent);
    root.style.setProperty('--accent-foreground', '#FFFFFF');
    root.style.setProperty('--destructive', activeColors.danger);
    root.style.setProperty('--ring', activeColors.primary);

    // Glow and gradient accessories mapping beautifully with selected theme colors
    root.style.setProperty('--primary-dark', activeColors.primaryDark);
    root.style.setProperty('--primary-glow', activeColors.primary + '1A'); // Hex with Hex opacity
    root.style.setProperty('--primary-glow-secondary', activeColors.secondary + '0D');
    root.style.setProperty('--primary-shadow', activeColors.primary + '40');
  }, [mode, themeName]);

  const value = useMemo(() => ({
    mode,
    themeName,
    colors: getThemeColors(mode, themeName),
    isDark: mode === 'dark',
    setMode,
    setThemeName,
    toggleTheme: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
  }), [mode, themeName]);

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

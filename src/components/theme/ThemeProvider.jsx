import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  accentColor: 'purple',
  setTheme: () => {},
  setAccentColor: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const accentColors = {
  purple: {
    primary: 'rgb(147, 51, 234)',
    gradient: 'from-purple-500 to-pink-500',
    light: 'purple-100',
    dark: 'purple-600',
  },
  blue: {
    primary: 'rgb(59, 130, 246)',
    gradient: 'from-blue-500 to-cyan-500',
    light: 'blue-100',
    dark: 'blue-600',
  },
  green: {
    primary: 'rgb(34, 197, 94)',
    gradient: 'from-green-500 to-emerald-500',
    light: 'green-100',
    dark: 'green-600',
  },
  orange: {
    primary: 'rgb(249, 115, 22)',
    gradient: 'from-orange-500 to-amber-500',
    light: 'orange-100',
    dark: 'orange-600',
  },
  pink: {
    primary: 'rgb(236, 72, 153)',
    gradient: 'from-pink-500 to-rose-500',
    light: 'pink-100',
    dark: 'pink-600',
  },
};

export function ThemeProvider({ children, initialTheme = 'light', initialAccent = 'purple' }) {
  const [theme, setTheme] = useState(initialTheme);
  const [accentColor, setAccentColor] = useState(initialAccent);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--background', '222.2 84% 4.9%');
      root.style.setProperty('--foreground', '210 40% 98%');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '222.2 84% 4.9%');
    }

    // Set accent color CSS variable
    const accent = accentColors[accentColor] || accentColors.purple;
    root.style.setProperty('--accent-primary', accent.primary);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      setTheme(systemTheme);
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme, accentColor]);

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor, accentColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { accentColors };
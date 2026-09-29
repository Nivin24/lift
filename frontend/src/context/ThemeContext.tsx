import React, { createContext, useContext, useState, useEffect } from 'react';
import logoDark from '../assets/logo-dark.png';
import logoLight from '../assets/logo-light.png';

type Theme = 'light' | 'dark';
export type LogoTheme = 'auto' | 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  logoTheme: LogoTheme;
  setLogoTheme: (mode: LogoTheme) => void;
  activeLogo: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  logoTheme: 'auto',
  setLogoTheme: () => {},
  activeLogo: logoDark,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('lift_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'light'; // Default to warm light theme
  });

  const [logoTheme, setLogoThemeState] = useState<LogoTheme>(() => {
    const saved = localStorage.getItem('lift_logo_theme');
    if (saved === 'auto' || saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'auto';
  });

  const activeLogo =
    logoTheme === 'dark'
      ? logoDark
      : logoTheme === 'light'
      ? logoLight
      : theme === 'dark'
      ? logoDark
      : logoLight;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('lift_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lift_logo_theme', logoTheme);
    // Dynamically update browser favicon to chosen icon
    const faviconUrl =
      logoTheme === 'dark'
        ? '/logo-dark.png'
        : logoTheme === 'light'
        ? '/logo-light.png'
        : theme === 'dark'
        ? '/logo-dark.png'
        : '/logo-light.png';

    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = faviconUrl;
    }
  }, [logoTheme, theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLogoTheme = (mode: LogoTheme) => {
    setLogoThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, logoTheme, setLogoTheme, activeLogo }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEME_COLORS } from '../config/theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('cardio-theme-preference');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('cardio-theme-preference', theme);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Dynamically set CSS variables from theme.js
    const colors = THEME_COLORS[theme];
    root.style.setProperty('--bg-color', colors.background);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--ui-bg', colors.uiBackground);
    root.style.setProperty('--ui-border', colors.uiBorder);
    root.style.setProperty('--shadow-color', colors.shadow);
    
    // Border Gradients
    root.style.setProperty('--border-start', colors.borderStart);
    root.style.setProperty('--border-mid', colors.borderMid);
    root.style.setProperty('--border-end', colors.borderEnd);
    root.style.setProperty('--border-hover', colors.borderHover);

    // Button Colors
    root.style.setProperty('--btn-primary-bg', colors.btnPrimaryBg);
    root.style.setProperty('--btn-primary-text', colors.btnPrimaryText);
    root.style.setProperty('--btn-secondary-bg', colors.btnSecondaryBg);
    root.style.setProperty('--btn-secondary-text', colors.btnSecondaryText);
    
    // For components that need RGB values (like RotatingBorder)
    if (colors.textPrimary.startsWith('#')) {
      const hex = colors.textPrimary.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      root.style.setProperty('--text-primary-rgb', `${r}, ${g}, ${b}`);
    }
    
    // Set aurora mode
    root.style.setProperty('--aurora-blend-mode', theme === 'dark' ? 'lighten' : 'multiply');
    
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const colors = THEME_COLORS[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};


import { THEME_COLORS } from '../../config/landing/theme';

export interface PreloadedTheme {
  theme: 'light' | 'dark';
  colors: any;
  cssVariables: Record<string, string>;
}

const themeCache = new Map<'light' | 'dark', PreloadedTheme>();

export const preloadThemes = async (onProgress?: (progress: number) => void) => {
  const themes: ('light' | 'dark')[] = ['light', 'dark'];
  let completed = 0;

  for (const theme of themes) {
    const colors = THEME_COLORS[theme];
    
    const cssVariables = {
      '--bg-color': colors.background,
      '--text-primary': colors.textPrimary,
      '--text-secondary': colors.textSecondary,
      '--ui-bg': colors.uiBackground,
      '--ui-border': colors.uiBorder,
      '--shadow-color': colors.shadow,
      '--border-start': colors.borderStart,
      '--border-mid': colors.borderMid,
      '--border-end': colors.borderEnd,
      '--border-hover': colors.borderHover,
      '--btn-primary-bg': colors.btnPrimaryBg,
      '--btn-primary-text': colors.btnPrimaryText,
      '--btn-secondary-bg': colors.btnSecondaryBg,
      '--btn-secondary-text': colors.btnSecondaryText,
    };

    themeCache.set(theme, {
      theme,
      colors,
      cssVariables,
    });

    completed++;
    if (onProgress) {
      onProgress((completed / themes.length) * 100);
    }
  }

  return Array.from(themeCache.values());
};

export const getPreloadedTheme = (theme: 'light' | 'dark') => {
  return themeCache.get(theme);
};

export const applyThemeVariables = (theme: 'light' | 'dark', element: HTMLElement = document.documentElement) => {
  let preloaded = getPreloadedTheme(theme);
  
  if (!preloaded) {
    // Generate on the fly if not cached yet
    const colors = THEME_COLORS[theme];
    if (!colors) return;
    
    const cssVariables = {
      '--bg-color': colors.background,
      '--text-primary': colors.textPrimary,
      '--text-secondary': colors.textSecondary,
      '--ui-bg': colors.uiBackground,
      '--ui-border': colors.uiBorder,
      '--shadow-color': colors.shadow,
      '--border-start': colors.borderStart,
      '--border-mid': colors.borderMid,
      '--border-end': colors.borderEnd,
      '--border-hover': colors.borderHover,
      '--btn-primary-bg': colors.btnPrimaryBg,
      '--btn-primary-text': colors.btnPrimaryText,
      '--btn-secondary-bg': colors.btnSecondaryBg,
      '--btn-secondary-text': colors.btnSecondaryText,
    };
    
    preloaded = { theme, colors, cssVariables };
  }

  Object.entries(preloaded.cssVariables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
};


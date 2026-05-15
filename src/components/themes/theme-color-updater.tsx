'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const META_THEME_COLORS: Record<string, string> = {
  light: '#ffffff',
  dark: '#09090b'
};

export function ThemeColorUpdater() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = META_THEME_COLORS[resolvedTheme ?? 'light'] ?? META_THEME_COLORS.light;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [resolvedTheme]);

  return null;
}

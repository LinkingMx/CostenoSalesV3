import * as React from 'react';
import { getDefaultMonthlyChartTheme } from '../utils';
import type { MonthlyChartTheme } from '../types';

/**
 * Hook for memoizing theme calculations to prevent unnecessary recalculations.
 * Monitors for dark mode changes and only recalculates theme when needed.
 */
export function useMonthlyChartTheme(): MonthlyChartTheme {
  // Track dark mode state to trigger theme recalculation
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  // Monitor for dark mode changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const newIsDarkMode = document.documentElement.classList.contains('dark');
          if (newIsDarkMode !== isDarkMode) {
            setIsDarkMode(newIsDarkMode);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [isDarkMode]);

  // Memoize theme calculation - getDefaultMonthlyChartTheme handles dark mode internally
  const theme = React.useMemo(() => {
    return getDefaultMonthlyChartTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode]); // Include isDarkMode to trigger recalculation

  return theme;
}
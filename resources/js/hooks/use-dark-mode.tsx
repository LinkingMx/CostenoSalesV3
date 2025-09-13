import { useEffect, useState } from 'react';

/**
 * Hook to detect if the current theme is dark mode
 * Uses the 'dark' class on document.documentElement to determine theme
 * 
 * @returns boolean - true if dark mode is active, false otherwise
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial state
    const checkDarkMode = () => {
      return document.documentElement.classList.contains('dark');
    };

    setIsDark(checkDarkMode());

    // Create a MutationObserver to watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(checkDarkMode());
    });

    // Observe changes to the class attribute of documentElement
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  return isDark;
}
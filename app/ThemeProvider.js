'use client';

import { useEffect } from 'react';
import { storage } from '@/lib/storage';

export default function ThemeProvider({ children }) {
  useEffect(() => {
    const theme = storage.getTheme();
    document.documentElement.classList.remove('theme-green', 'theme-purple');
    document.documentElement.classList.add(theme === 'purple' ? 'theme-purple' : 'theme-green');
  }, []);

  return children;
}

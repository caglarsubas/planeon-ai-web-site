'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { applyTheme, readTheme, subscribeTheme } from '@/lib/theme';

export function ThemeToggle({ labeled = false }: { labeled?: boolean }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => 'light');
  return (
    <Toggle
      className={`theme-toggle${labeled ? ' theme-toggle-labeled' : ''}`}
      pressed={theme === 'dark'}
      onPressedChange={(pressed) => applyTheme(pressed ? 'dark' : 'light')}
      aria-label="Dark mode"
      title="Toggle dark mode"
    >
      <Moon className="theme-moon" size={18} aria-hidden="true" />
      <Sun className="theme-sun" size={18} aria-hidden="true" />
      {labeled && <span>Dark mode</span>}
    </Toggle>
  );
}

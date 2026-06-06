'use client';

import { Switch } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-8 w-14" aria-hidden />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Switch
      isSelected={isDark}
      onChange={(selected) => setTheme(selected ? 'dark' : 'light')}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <Switch.Control>
        <Switch.Thumb>
          {isDark ? (
            <Moon className="size-3 text-accent" aria-hidden />
          ) : (
            <Sun className="size-3 text-accent" aria-hidden />
          )}
        </Switch.Thumb>
      </Switch.Control>
    </Switch>
  );
}

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
      size="lg"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {({ isSelected }) => (
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb>
              <Switch.Icon>
                {isSelected ? (
                  <Moon className="size-3 text-inherit opacity-100" />
                ) : (
                  <Sun className="size-3 text-inherit opacity-70" />
                )}
              </Switch.Icon>
            </Switch.Thumb>
          </Switch.Control>
        </Switch.Content>
      )}
    </Switch>
  );
}

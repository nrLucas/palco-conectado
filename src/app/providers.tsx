'use client';

import { SessionProvider } from 'next-auth/react';
import { OnboardingWizard } from '@/components/onboarding';
import { AuthModal, AuthProvider } from '@/lib/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider, Toast } from '@heroui/react';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider locale="pt-BR">
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Toast.Provider placement="bottom end" />
              <AuthModal />
              <OnboardingWizard />
              {children}
            </AuthProvider>
          </QueryClientProvider>
        </SessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

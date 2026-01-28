'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Guitar, Loader2, Lock, Mail, Music2, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from './AuthContext';

// =============================================================================
// SCHEMAS
// =============================================================================

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Informe seu nome'),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

// =============================================================================
// COMPONENT
// =============================================================================

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    login,
    signup,
  } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>(authModalMode);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const handleLogin = async (data: LoginValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      loginForm.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: SignupValues) => {
    setIsSubmitting(true);
    try {
      await signup(data.email, data.password, data.name);
      signupForm.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {/* Gradient Top Border */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
        
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Music2 className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Acesse o PalcoMatch</DialogTitle>
          <DialogDescription>
            Conecte-se com bandas, músicos e estabelecimentos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'signup')} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="gap-2">
              <Lock className="h-4 w-4" />
              Entrar
            </TabsTrigger>
            <TabsTrigger value="signup" className="gap-2">
              <User className="h-4 w-4" />
              Criar conta
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4 mt-0">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  E-mail
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="voce@email.com"
                  disabled={isSubmitting}
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-destructive text-sm">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Senha
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••"
                  disabled={isSubmitting}
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-destructive text-sm">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                variant="hero"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Demo account hint */}
            <div className="text-center text-sm text-muted-foreground pt-2 border-t">
              <p>Para testar, use:</p>
              <p className="font-mono text-xs mt-1">demo@palcomatch.com</p>
            </div>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup" className="space-y-4 mt-0">
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nome completo
                </Label>
                <Input
                  id="signup-name"
                  placeholder="Seu nome"
                  disabled={isSubmitting}
                  {...signupForm.register('name')}
                />
                {signupForm.formState.errors.name && (
                  <p className="text-destructive text-sm">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  E-mail
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="voce@email.com"
                  disabled={isSubmitting}
                  {...signupForm.register('email')}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-destructive text-sm">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Senha
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting}
                  {...signupForm.register('password')}
                />
                {signupForm.formState.errors.password && (
                  <p className="text-destructive text-sm">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                variant="hero"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>

            {/* Role preview */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Após criar sua conta, escolha seu perfil:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-2 bg-gradient-to-b from-violet-500/10 to-transparent">
                  <Guitar className="h-5 w-5 mx-auto mb-1 text-violet-500" />
                  <span className="text-xs text-muted-foreground">Artista</span>
                </div>
                <div className="rounded-lg border p-2 bg-gradient-to-b from-amber-500/10 to-transparent">
                  <Music2 className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Banda</span>
                </div>
                <div className="rounded-lg border p-2 bg-gradient-to-b from-emerald-500/10 to-transparent">
                  <Building2 className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Contratante</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

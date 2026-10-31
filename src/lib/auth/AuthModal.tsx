'use client';

import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  Tabs,
  TextField,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Eye,
  EyeOff,
  Guitar,
  Loader2,
  Lock,
  Mail,
  Music2,
  User,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { requestPasswordReset } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';
import { forgotPasswordSchema } from '@/lib/schemas';
import { useAuth } from './AuthContext';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Informe seu nome'),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;
type ForgotValues = z.infer<typeof forgotPasswordSchema>;

function PasswordInput({
  id,
  placeholder,
  disabled,
  showPassword,
  onToggle,
  ...registerProps
}: {
  id: string;
  placeholder: string;
  disabled?: boolean;
  showPassword: boolean;
  onToggle: () => void;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative w-full">
      <Input
        id={id}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        disabled={disabled}
        fullWidth
        className="pr-11"
        {...registerProps}
      />
      <button
        type="button"
        disabled={disabled}
        className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted transition-colors hover:text-foreground disabled:opacity-50"
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        onClick={onToggle}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, login, signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>(authModalMode);
  const [view, setView] = useState<'auth' | 'forgot'>('auth');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  useEffect(() => {
    if (!authModalOpen) {
      setLoginError(null);
      setSignupError(null);
      setForgotError(null);
      setForgotSuccess(null);
      setView('auth');
    }
  }, [authModalOpen]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleLogin = async (data: LoginValues) => {
    setLoginError(null);
    setIsSubmitting(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        loginForm.reset();
      } else {
        setLoginError(result.error ?? 'Erro ao entrar');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: SignupValues) => {
    setSignupError(null);
    setIsSubmitting(true);
    try {
      const result = await signup(data.email, data.password, data.name);
      if (result.success) {
        signupForm.reset();
      } else {
        setSignupError(result.error ?? 'Erro ao criar conta');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const handleForgot = async (data: ForgotValues) => {
    setForgotError(null);
    setForgotSuccess(null);
    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(data.email);
      setForgotSuccess(result.message);
    } catch (error) {
      setForgotError(
        error instanceof ApiClientError
          ? error.message
          : 'Não foi possível enviar o link',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openForgotView = () => {
    const email = loginForm.getValues('email');
    if (email) {
      forgotForm.setValue('email', email);
    }
    setForgotError(null);
    setForgotSuccess(null);
    setView('forgot');
  };

  return (
    <Modal.Backdrop isOpen={authModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />

          <Modal.Header className="flex flex-col items-center text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
              <Music2 className="h-7 w-7 text-accent" />
            </div>
            <Modal.Heading className="font-display text-lg font-semibold tracking-tight">Acesse o Palco Conectado</Modal.Heading>
            <p className="text-sm text-muted mt-1">
              Conecte-se com bandas, músicos e estabelecimentos
            </p>
          </Modal.Header>

          <Modal.Body className="gap-4">
            {view === 'forgot' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-display text-lg font-semibold">Esqueci a senha</h3>
                  <p className="text-muted mt-1 text-sm">
                    Enviaremos um link para redefinir sua senha.
                  </p>
                </div>

                <form onSubmit={forgotForm.handleSubmit(handleForgot)} className="space-y-4">
                  {forgotError && (
                    <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                      {forgotError}
                    </p>
                  )}
                  {forgotSuccess && (
                    <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                      {forgotSuccess}
                    </p>
                  )}

                  <TextField isInvalid={!!forgotForm.formState.errors.email} className="w-full">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted" />
                      E-mail
                    </Label>
                    <Input
                      type="email"
                      placeholder="voce@email.com"
                      disabled={isSubmitting}
                      fullWidth
                      {...forgotForm.register('email')}
                    />
                    {forgotForm.formState.errors.email && (
                      <FieldError>{forgotForm.formState.errors.email.message}</FieldError>
                    )}
                  </TextField>

                  <Button
                    type="submit"
                    className="button--hero w-full"
                    isDisabled={isSubmitting || !!forgotSuccess}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar link'
                    )}
                  </Button>
                </form>

                <button
                  type="button"
                  className="text-accent hover:underline w-full text-center text-sm"
                  onClick={() => setView('auth')}
                >
                  Voltar ao login
                </button>
              </div>
            ) : (
              <>
            <Button variant="secondary" className="w-full" onPress={handleGoogleSignIn}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Entrar com Google
            </Button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-overlay px-2 text-muted">ou</span>
              </div>
            </div>

            <Tabs
              selectedKey={mode}
              onSelectionChange={(key) => {
                setMode(String(key) as 'login' | 'signup');
                setLoginError(null);
                setSignupError(null);
              }}
              className="w-full"
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Autenticação" className="w-full">
                  <Tabs.Tab id="login" className="flex-1 gap-2">
                    <Lock className="h-4 w-4" />
                    Entrar
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="signup" className="flex-1 gap-2">
                    <User className="h-4 w-4" />
                    Criar conta
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              <Tabs.Panel id="login" className="space-y-4 pt-4">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  {loginError && (
                    <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                      {loginError}
                    </p>
                  )}

                  <TextField isInvalid={!!loginForm.formState.errors.email}>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted" />
                      E-mail
                    </Label>
                    <Input
                      type="email"
                      placeholder="voce@email.com"
                      disabled={isSubmitting}
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <FieldError>{loginForm.formState.errors.email.message}</FieldError>
                    )}
                  </TextField>

                  <TextField isInvalid={!!loginForm.formState.errors.password} className="w-full">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted" />
                      Senha
                    </Label>
                    <PasswordInput
                      id="login-password"
                      placeholder="••••••"
                      disabled={isSubmitting}
                      showPassword={showLoginPassword}
                      onToggle={() => setShowLoginPassword((v) => !v)}
                      {...loginForm.register('password')}
                    />
                    {loginForm.formState.errors.password && (
                      <FieldError>{loginForm.formState.errors.password.message}</FieldError>
                    )}
                  </TextField>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-accent hover:underline text-sm"
                      onClick={openForgotView}
                    >
                      Esqueci a senha
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="button--hero w-full"
                    isDisabled={isSubmitting}
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

                <div className="text-center text-sm text-muted pt-2 border-t border-border">
                  <p>Conta demo:</p>
                  <p className="font-mono text-xs mt-1">demo@palco.com / demo123</p>
                </div>
              </Tabs.Panel>

              <Tabs.Panel id="signup" className="space-y-4 pt-4">
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  {signupError && (
                    <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                      {signupError}
                    </p>
                  )}

                  <TextField isInvalid={!!signupForm.formState.errors.name}>
                    <Label>Nome completo</Label>
                    <Input
                      placeholder="Seu nome"
                      disabled={isSubmitting}
                      {...signupForm.register('name')}
                    />
                    {signupForm.formState.errors.name && (
                      <FieldError>{signupForm.formState.errors.name.message}</FieldError>
                    )}
                  </TextField>

                  <TextField isInvalid={!!signupForm.formState.errors.email}>
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      placeholder="voce@email.com"
                      disabled={isSubmitting}
                      {...signupForm.register('email')}
                    />
                    {signupForm.formState.errors.email && (
                      <FieldError>{signupForm.formState.errors.email.message}</FieldError>
                    )}
                  </TextField>

                  <TextField isInvalid={!!signupForm.formState.errors.password} className="w-full">
                    <Label>Senha</Label>
                    <PasswordInput
                      id="signup-password"
                      placeholder="Mínimo 6 caracteres"
                      disabled={isSubmitting}
                      showPassword={showSignupPassword}
                      onToggle={() => setShowSignupPassword((v) => !v)}
                      {...signupForm.register('password')}
                    />
                    {signupForm.formState.errors.password && (
                      <FieldError>{signupForm.formState.errors.password.message}</FieldError>
                    )}
                  </TextField>

                  <Button
                    type="submit"
                    className="button--hero w-full"
                    isDisabled={isSubmitting}
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

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted text-center mb-3">
                    Após criar sua conta, escolha seu perfil:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg border border-border p-2">
                      <Guitar className="h-5 w-5 mx-auto mb-1 text-[oklch(0.55_0.2_285)]" />
                      <span className="text-xs text-muted">Artista</span>
                    </div>
                    <div className="rounded-lg border border-border p-2">
                      <Music2 className="h-5 w-5 mx-auto mb-1 text-accent" />
                      <span className="text-xs text-muted">Banda</span>
                    </div>
                    <div className="rounded-lg border border-border p-2">
                      <Building2 className="h-5 w-5 mx-auto mb-1 text-success" />
                      <span className="text-xs text-muted">Contratante</span>
                    </div>
                  </div>
                </div>
              </Tabs.Panel>
            </Tabs>
              </>
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

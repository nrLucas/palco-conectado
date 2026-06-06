'use client';

import { Button, FieldError, Input, Label, TextField } from '@heroui/react';
import { resetPassword } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Music2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type ResetValues = z.infer<typeof resetPasswordSchema>;

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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openAuthModal } = useAuth();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const missingParams = !token || !email;

  const onSubmit = async (data: ResetValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await resetPassword({
        email: data.email,
        token: data.token,
        password: data.password,
      });
      setSuccess(true);
    } catch (error) {
      setFormError(
        error instanceof ApiClientError
          ? error.message
          : 'Não foi possível redefinir a senha',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (missingParams) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="text-muted">Link inválido ou incompleto.</p>
        <Button
          className="button--hero"
          onPress={() => {
            openAuthModal('login');
            router.push('/');
          }}
        >
          Solicitar novo link
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="text-lg font-medium">Senha redefinida com sucesso!</p>
        <p className="text-muted text-sm">Você já pode entrar com a nova senha.</p>
        <Button
          className="button--hero w-full"
          onPress={() => {
            openAuthModal('login');
            router.push('/');
          }}
        >
          Ir para login
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto max-w-md space-y-4"
    >
      {formError && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      )}

      <input type="hidden" {...form.register('email')} />
      <input type="hidden" {...form.register('token')} />

      <TextField isInvalid={!!form.formState.errors.password} className="w-full">
        <Label className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted" />
          Nova senha
        </Label>
        <PasswordInput
          id="new-password"
          placeholder="Mínimo 6 caracteres"
          showPassword={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <FieldError>{form.formState.errors.password.message}</FieldError>
        )}
      </TextField>

      <TextField isInvalid={!!form.formState.errors.confirmPassword} className="w-full">
        <Label>Confirmar senha</Label>
        <PasswordInput
          id="confirm-password"
          placeholder="Repita a senha"
          showPassword={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword && (
          <FieldError>{form.formState.errors.confirmPassword.message}</FieldError>
        )}
      </TextField>

      <Button type="submit" className="button--hero w-full" isDisabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redefinindo...
          </>
        ) : (
          'Redefinir senha'
        )}
      </Button>

      <p className="text-center text-sm text-muted">
        <Link href="/" className="text-accent hover:underline">
          Voltar ao início
        </Link>
      </p>
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto mb-8 max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
          <Music2 className="h-7 w-7 text-accent" />
        </div>
        <h1 className="font-display text-2xl font-bold">Redefinir senha</h1>
        <p className="text-muted mt-2 text-sm">Escolha uma nova senha para sua conta.</p>
      </div>

      <Suspense fallback={<p className="text-center text-muted">Carregando...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

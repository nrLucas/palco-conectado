import { toast as herouiToast } from '@heroui/react';

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function toast({ title, description, variant = 'default' }: ToastOptions) {
  const message = title ?? description ?? '';
  const desc = title && description ? description : undefined;

  if (variant === 'destructive') {
    herouiToast.danger(message, { description: desc });
    return;
  }

  herouiToast(message, { description: desc });
}

export { herouiToast as toastRaw };

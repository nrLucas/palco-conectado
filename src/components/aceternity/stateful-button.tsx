"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

type ButtonState = "idle" | "loading" | "success";

export interface StatefulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export function StatefulButton({
  className,
  children,
  onClick,
  disabled,
  type = "button",
  ...props
}: StatefulButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state !== "idle" || disabled) return;

    setState("loading");
    try {
      await onClick?.(e);
      setState("success");
      window.setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || state === "loading"}
      onClick={handleClick}
      className={cn(
        "button--hero relative inline-flex h-10 w-full items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-semibold text-neutral-950 transition-opacity disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="inline-flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </motion.span>
        )}
        {state === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="inline-flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Enviado!
          </motion.span>
        )}
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

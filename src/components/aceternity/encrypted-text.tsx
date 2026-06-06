"use client";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function randomChar(charset: string) {
  return charset[Math.floor(Math.random() * charset.length)];
}

export interface EncryptedTextProps {
  text: string;
  className?: string;
  revealDelayMs?: number;
  flipDelayMs?: number;
  charset?: string;
  encryptedClassName?: string;
  revealedClassName?: string;
}

export function EncryptedText({
  text,
  className,
  revealDelayMs = 50,
  flipDelayMs = 50,
  charset = DEFAULT_CHARSET,
  encryptedClassName,
  revealedClassName,
}: EncryptedTextProps) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState<string[]>(() =>
    text.split("").map((ch) => (ch === " " ? " " : randomChar(charset))),
  );
  const revealedRef = useRef(0);
  const [revealedCount, setRevealedCount] = useState(reducedMotion ? text.length : 0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(text.split(""));
      setRevealedCount(text.length);
      return;
    }

    revealedRef.current = 0;
    setRevealedCount(0);
    setDisplay(text.split("").map((ch) => (ch === " " ? " " : randomChar(charset))));

    const revealInterval = window.setInterval(() => {
      if (revealedRef.current >= text.length) {
        window.clearInterval(revealInterval);
        return;
      }

      const idx = revealedRef.current;
      setDisplay((prev) => {
        const next = [...prev];
        next[idx] = text[idx];
        return next;
      });
      revealedRef.current += 1;
      setRevealedCount(revealedRef.current);
    }, revealDelayMs);

    const flipInterval = window.setInterval(() => {
      setDisplay((prev) =>
        prev.map((ch, i) => {
          if (i < revealedRef.current || text[i] === " ") return ch;
          return randomChar(charset);
        }),
      );
    }, flipDelayMs);

    return () => {
      window.clearInterval(revealInterval);
      window.clearInterval(flipInterval);
    };
  }, [text, revealDelayMs, flipDelayMs, charset, reducedMotion]);

  return (
    <span className={cn("inline-flex flex-wrap", className)} aria-label={text}>
      {display.map((char, i) => (
        <span
          key={`${i}-${char}`}
          className={cn(
            i < revealedCount ? revealedClassName : encryptedClassName,
          )}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

"use client";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate } from "framer-motion";
import { useEffect } from "react";

export interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
  filter?: boolean;
}

export function TextGenerateEffect({
  words,
  className,
  duration = 0.5,
  filter = true,
}: TextGenerateEffectProps) {
  const reducedMotion = useReducedMotion();
  const [scope, animate] = useAnimate();
  const wordArray = words.split(" ");

  useEffect(() => {
    if (reducedMotion) return;

    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration,
        delay: stagger(0.12),
      },
    );
  }, [animate, duration, filter, reducedMotion]);

  if (reducedMotion) {
    return <span className={cn("font-display", className)}>{words}</span>;
  }

  return (
    <motion.span ref={scope} className={cn("font-display", className)}>
      {wordArray.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          className="opacity-0"
          style={filter ? { filter: "blur(10px)" } : undefined}
        >
          {word}{" "}
        </motion.span>
      ))}
    </motion.span>
  );
}

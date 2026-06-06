"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface BentoGridItemProps {
  className?: string;
  title: string | ReactNode;
  description: string | ReactNode;
  header?: ReactNode;
  icon?: ReactNode;
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: BentoGridItemProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group/bento relative row-span-1 flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-surface transition-shadow hover:shadow-overlay",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-0.5">
        {icon && (
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            {icon}
          </div>
        )}
        <div className="font-display mb-1 text-lg font-semibold">{title}</div>
        <div className="text-muted text-sm leading-relaxed">{description}</div>
      </div>
    </motion.div>
  );
}

export interface BentoGridProps {
  className?: string;
  children: ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

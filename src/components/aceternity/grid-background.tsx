"use client";

import { cn } from "@/lib/utils";

export interface GridBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function GridBackground({ className, children }: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center bg-background",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)]",
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {children}
    </div>
  );
}

export function DotBackground({ className, children }: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center bg-background",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(var(--border)_1px,transparent_1px)]",
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {children}
    </div>
  );
}

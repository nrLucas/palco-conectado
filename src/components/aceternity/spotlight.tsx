"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty("--spotlight-x", `${x}px`);
      container.style.setProperty("--spotlight-y", `${y}px`);
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={
        {
          "--spotlight-x": "50%",
          "--spotlight-y": "50%",
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 opacity-40 md:opacity-60"
        style={{
          background: `radial-gradient(600px circle at var(--spotlight-x) var(--spotlight-y), ${fill}, transparent 40%)`,
        }}
      />
    </div>
  );
}

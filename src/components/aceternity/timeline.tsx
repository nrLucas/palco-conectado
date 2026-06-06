"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { ReactNode } from "react";

export interface TimelineEntry {
  title: string;
  content: ReactNode;
}

export interface TimelineProps {
  data: TimelineEntry[];
  className?: string;
}

export function Timeline({ data, className }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="absolute left-4 top-0 h-full w-[2px] overflow-hidden bg-border md:left-8">
        <motion.div
          style={{
            height: heightTransform,
            opacity: opacityTransform,
          }}
          className="absolute inset-x-0 top-0 w-full origin-top bg-gradient-to-b from-accent via-accent/60 to-transparent"
        />
      </div>

      <div className="space-y-12">
        {data.map((item, index) => (
          <div key={index} className="relative flex gap-6 md:gap-10">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-background md:h-10 md:w-10">
              <div className="h-2.5 w-2.5 rounded-full bg-accent" />
            </div>
            <div className="flex-1 pb-4">
              <h3 className="font-display sticky top-24 z-10 mb-3 text-xl font-bold md:text-2xl">
                {item.title}
              </h3>
              <div className="text-muted leading-relaxed">{item.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

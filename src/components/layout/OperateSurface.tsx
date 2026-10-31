"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function OperateSurface({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const operate = pathname !== "/";

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (operate) root.dataset.surface = "operate";
    else delete root.dataset.surface;
    return () => {
      delete root.dataset.surface;
    };
  }, [operate]);

  return <div className={operate ? "surface-operate flex-1" : "flex-1"}>{children}</div>;
}

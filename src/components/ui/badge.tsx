import * as React from "react";
import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "gold" | "marine" | "interior" | "mana" | "engineering" | "warn" | "success" | "danger";
}

export function Badge({ tone = "default", className, ...props }: Props) {
  const toneMap: Record<string, string> = {
    default: "bg-surface-2 text-muted border-border",
    gold: "bg-gold-bg text-gold border-gold/40",
    marine: "bg-marine/10 text-marine border-marine/30",
    interior: "bg-interior/10 text-interior border-interior/30",
    mana: "bg-mana/10 text-mana border-mana/30",
    engineering: "bg-engineering/10 text-engineering border-engineering/30",
    warn: "bg-warn/10 text-warn border-warn/30",
    success: "bg-success/10 text-success border-success/30",
    danger: "bg-danger/10 text-danger border-danger/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border tracking-wide uppercase",
        toneMap[tone],
        className
      )}
      {...props}
    />
  );
}

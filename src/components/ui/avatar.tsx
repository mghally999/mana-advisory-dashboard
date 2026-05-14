import { cn } from "@/lib/utils";

interface Props {
  initials: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  tone?: "marine" | "interior" | "mana" | "engineering";
}

export function Avatar({ initials, name, size = "md", className, tone }: Props) {
  const sizes = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
  };
  const toneClass = tone
    ? {
        marine: "bg-marine/15 text-marine border-marine/30",
        interior: "bg-interior/15 text-interior border-interior/30",
        mana: "bg-mana/15 text-mana border-mana/30",
        engineering: "bg-engineering/15 text-engineering border-engineering/30",
      }[tone]
    : "bg-gold-bg text-gold border-gold/30";

  return (
    <div
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium border",
        sizes[size],
        toneClass,
        className
      )}
    >
      {initials}
    </div>
  );
}

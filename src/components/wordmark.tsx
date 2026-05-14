interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export function Wordmark({ size = "md", showTagline = true }: Props) {
  const sizes = { sm: "text-xl", md: "text-3xl", lg: "text-5xl", xl: "text-6xl" };
  const taglineSizes = { sm: "text-[7px]", md: "text-[9px]", lg: "text-[11px]", xl: "text-xs" };
  return (
    <div className="flex flex-col items-start">
      <span className={`brand-wordmark gold-text ${sizes[size]} leading-none`}>MANA</span>
      {showTagline && (
        <span className={`${taglineSizes[size]} text-muted tracking-[0.35em] mt-1 font-light`}>ADVISORY GROUP</span>
      )}
    </div>
  );
}

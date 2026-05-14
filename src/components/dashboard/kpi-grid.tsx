"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Coins, Banknote, PercentCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => {
    const rounded = Math.round(v * 10 ** decimals) / 10 ** decimals;
    const formatted = rounded.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return prefix + formatted + suffix;
  });
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{display}</motion.span>;
}

interface KpiProps {
  label: string;
  value: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: number; // % change
  tone?: "gold" | "marine" | "engineering" | "mana";
}

function KpiCard({ label, value, icon: Icon, prefix, suffix, decimals = 0, delta, tone = "gold" }: KpiProps) {
  const toneRing = {
    gold: "from-gold/30 via-gold/5 to-transparent",
    marine: "from-marine/30 via-marine/5 to-transparent",
    engineering: "from-engineering/30 via-engineering/5 to-transparent",
    mana: "from-mana/30 via-mana/5 to-transparent",
  }[tone];
  const iconTone = {
    gold: "text-gold bg-gold-bg",
    marine: "text-marine bg-marine/10",
    engineering: "text-engineering bg-engineering/10",
    mana: "text-mana bg-mana/10",
  }[tone];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${toneRing} pointer-events-none`} />
        <div className="relative p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-md ${iconTone}`}>
              <Icon size={18} strokeWidth={1.5} />
            </div>
            {delta !== undefined && (
              <span
                className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  delta >= 0 ? "text-success bg-success/10" : "text-danger bg-danger/10"
                }`}
              >
                {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(delta).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-[10px] tracking-[0.2em] text-muted uppercase mb-1">{label}</p>
          <p className="text-3xl font-display font-medium text-ink">
            <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

export function KpiGrid({
  totalRevenue,
  totalCost,
  netProfit,
  netMargin,
  netProfitOverridden,
}: {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  netMargin: number;
  netProfitOverridden?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Total Revenue" value={totalRevenue} icon={Wallet} prefix="AED " delta={8.2} tone="gold" />
      <KpiCard label="Total Cost" value={totalCost} icon={Coins} prefix="AED " delta={-3.1} tone="marine" />
      <KpiCard
        label={netProfitOverridden ? "Net Profit (Override)" : "Net Profit"}
        value={netProfit}
        icon={Banknote}
        prefix="AED "
        delta={12.4}
        tone="engineering"
      />
      <KpiCard label="Net Margin" value={netMargin * 100} icon={PercentCircle} suffix="%" decimals={1} delta={2.6} tone="mana" />
    </div>
  );
}

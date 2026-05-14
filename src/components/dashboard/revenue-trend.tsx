"use client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenuePoint } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";

export function RevenueTrend({ data }: { data: RevenuePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Revenue Trend</CardTitle>
          <CardSubtitle>Last 12 months · revenue vs. cost</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody className="pt-2 pb-1 px-0">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 24, left: 12, bottom: 8 }}>
            <defs>
              <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-cost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--marine))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--marine))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted))", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "hsl(var(--muted))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`)}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--surface))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--ink))",
                fontSize: 12,
              }}
              formatter={(v: number) => `AED ${(v / 1_000_000).toFixed(2)}M`}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--gold))" strokeWidth={2} fill="url(#g-rev)" />
            <Area type="monotone" dataKey="cost" stroke="hsl(var(--marine))" strokeWidth={2} fill="url(#g-cost)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

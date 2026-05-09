"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts"

export function TrendChart({
  data, series, yLabel, domain, yFormat
}: {
  data: Record<string, string | number>[]
  series: { key: string; name: string; color: string }[]
  yLabel: string
  domain: [number | string, number | string]
  yFormat?: (v: number) => string
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#27272a" }} />
          <YAxis domain={domain as [number, number]} tick={{ fill: "#a1a1aa", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#27272a" }} tickFormatter={yFormat as ((v: number) => string) || ((v: number) => `${v}`)} />
          <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#a1a1aa" }} />
          <Legend wrapperStyle={{ fontSize: "10px", color: "#a1a1aa" }} formatter={(v) => <span style={{ color: "#d4d4d8" }}>{v}</span>} />
          {series.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function formatTraffic(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v.toString()
}

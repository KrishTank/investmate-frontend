import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { currency, compactCurrency } from "../lib/currency.js";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const contributed = payload.find((p) => p.dataKey === "total_contributed_to_date")?.value ?? 0;
  const interest = payload.find((p) => p.dataKey === "total_interest_to_date")?.value ?? 0;

  return (
    <div className="bg-vault-deep/95 border border-mist/15 backdrop-blur-md text-mist rounded-xl px-4 py-3 shadow-glow-gold font-body text-sm min-w-[190px]">
      <p className="font-mono text-xs text-mist-faint mb-2 uppercase tracking-wider">
        Year {label}
      </p>
      <div className="flex items-center justify-between gap-4 mb-1">
        <span className="flex items-center gap-1.5 text-mist-soft">
          <span className="w-2 h-2 rounded-full bg-moss-light inline-block" /> Contributed
        </span>
        <span className="font-mono tabular-nums">{currency.format(contributed)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <span className="flex items-center gap-1.5 text-mist-soft">
          <span className="w-2 h-2 rounded-full bg-gold-light inline-block" /> Growth
        </span>
        <span className="font-mono tabular-nums">{currency.format(interest)}</span>
      </div>
      <div className="border-t border-mist/15 mt-2 pt-2 flex items-center justify-between gap-4 font-medium">
        <span>Total</span>
        <span className="font-mono tabular-nums text-gold-light">
          {currency.format(contributed + interest)}
        </span>
      </div>
    </div>
  );
}

export default function WealthChart({ data }) {
  const hasData = data && data.length > 0;

  return (
    <div className="w-full h-[280px] md:h-[340px]">
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillContributed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3FA576" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#3FA576" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="fillGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F4D785" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#F4D785" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 5" stroke="rgba(234,241,236,0.08)" vertical={false} />
            <XAxis
              dataKey="year"
              tickFormatter={(y) => `Y${y}`}
              tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: "#7E9184" }}
              axisLine={{ stroke: "rgba(234,241,236,0.15)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => compactCurrency.format(v)}
              tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: "#7E9184" }}
              axisLine={false}
              tickLine={false}
              width={58}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(228,192,119,0.35)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="total_contributed_to_date"
              stackId="1"
              stroke="#3FA576"
              strokeWidth={2}
              fill="url(#fillContributed)"
              activeDot={{ r: 4, fill: "#3FA576", stroke: "#0A1B14", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="total_interest_to_date"
              stackId="1"
              stroke="#E4C077"
              strokeWidth={2}
              fill="url(#fillGrowth)"
              activeDot={{ r: 4, fill: "#F4D785", stroke: "#0A1B14", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-mist-faint text-sm font-body border border-dashed border-mist/15 rounded-xl">
          Adjust the inputs to see your projection.
        </div>
      )}
    </div>
  );
}
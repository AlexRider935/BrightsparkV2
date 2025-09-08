"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine, // <-- FIX 1: Import the ReferenceLine component
} from "recharts";
import { format } from "date-fns";

// A custom tooltip to match the theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-dark-navy/90 p-3 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-semibold text-light-slate">{`Date: ${format(
          new Date(label),
          "MMM d, yyyy"
        )}`}</p>
        <p className="text-sm text-brand-gold">{`Score: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export default function ProgressChart({ data, average }) {
  // --- FIX 2: Handle case with not enough data to draw a line ---
  if (!data || data.length <= 1) {
    return (
      <div
        style={{ width: "100%", height: 300 }}
        className="flex items-center justify-center">
        <p className="text-slate text-sm">
          More data is needed to show a performance trend.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(136, 146, 176, 0.1)"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), "MMM d")}
            stroke="#8892b0"
            tick={{ fill: "#8892b0", fontSize: 12 }}
          />
          <YAxis
            stroke="#8892b0"
            tick={{ fill: "#8892b0", fontSize: 12 }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* --- FIX 3: Add the ReferenceLine for the subject average --- */}
          <ReferenceLine
            y={average}
            label={{
              value: "Avg",
              position: "insideTopLeft",
              fill: "#8892b0",
              fontSize: 12,
            }}
            stroke="#8892b0"
            strokeDasharray="4 4"
          />

          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#ffcc00"
            strokeWidth={2}
            dot={{ r: 4, fill: "#ffcc00" }}
            activeDot={{
              r: 8,
              stroke: "rgba(255, 204, 0, 0.2)",
              strokeWidth: 8,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

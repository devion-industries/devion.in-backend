import {
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  data: ChartData[];
}

export const PriceChart = ({ data }: PriceChartProps) => {
  // Return early if no data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No chart data available
      </div>
    );
  }

  // Find min and max for proper scaling using close prices
  const closeValues = data.map(d => d.close);
  const minValue = Math.min(...closeValues);
  const maxValue = Math.max(...closeValues);
  const padding = (maxValue - minValue) * 0.1;
  
  // Determine overall trend for gradient color
  const firstPrice = data[0]?.close || 0;
  const lastPrice = data[data.length - 1]?.close || 0;
  const isOverallGain = lastPrice >= firstPrice;

  return (
    <div className="space-y-4 w-full">
      {/* Area Chart */}
      <div className="rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-background to-muted/20">
        <ResponsiveContainer width="100%" height={350} minHeight={300}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={isOverallGain ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                  stopOpacity={0.4}
                />
                <stop 
                  offset="50%" 
                  stopColor={isOverallGain ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                  stopOpacity={0.2}
                />
                <stop 
                  offset="95%" 
                  stopColor={isOverallGain ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.2}
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ 
                fill: "hsl(var(--muted-foreground))", 
                fontSize: 11,
                fontWeight: 500
              }}
              stroke="hsl(var(--border))"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ 
                fill: "hsl(var(--muted-foreground))", 
                fontSize: 11,
                fontWeight: 500
              }}
              stroke="hsl(var(--border))"
              domain={[minValue - padding, maxValue + padding]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
                padding: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const change = data.close - data.open;
                  const changePercent = ((change / data.open) * 100);
                  const isGain = change >= 0;
                  return (
                    <div className="bg-popover border border-border rounded-xl p-3 shadow-xl min-w-[160px]">
                      <p className="font-semibold mb-3 text-sm text-foreground">{label}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-semibold tabular-nums text-lg">₹{data.close.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Change:</span>
                          <span className={`font-medium tabular-nums ${isGain ? 'text-success' : 'text-destructive'}`}>
                            {isGain ? '+' : ''}₹{change.toFixed(2)} ({isGain ? '+' : ''}{changePercent.toFixed(2)}%)
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-border/50">
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="font-medium tabular-nums">{(data.volume / 1000000).toFixed(2)}M</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isOverallGain ? "hsl(var(--success))" : "hsl(var(--destructive))"}
              strokeWidth={2.5}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ 
                r: 5, 
                fill: isOverallGain ? "hsl(var(--success))" : "hsl(var(--destructive))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="rounded-2xl overflow-hidden border border-border/50 bg-muted/10">
        <div className="px-4 py-2 border-b border-border/50">
          <h4 className="text-xs font-medium text-muted-foreground">Volume</h4>
        </div>
        <ResponsiveContainer width="100%" height={100} minHeight={80}>
          <ComposedChart data={data} margin={{ top: 10, right: 15, left: 15, bottom: 10 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.2}
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ 
                fill: "hsl(var(--muted-foreground))", 
                fontSize: 10,
                fontWeight: 500
              }}
              stroke="hsl(var(--border))"
              axisLine={false}
              tickLine={false}
              hide={true}
            />
            <YAxis
              tick={{ 
                fill: "hsl(var(--muted-foreground))", 
                fontSize: 10,
                fontWeight: 500
              }}
              stroke="hsl(var(--border))"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
                padding: "8px",
              }}
              formatter={(value: number) => [`${(value / 1000000).toFixed(2)}M`, "Volume"]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.close >= entry.open
                      ? "hsl(var(--success))"
                      : "hsl(var(--destructive))"
                  }
                  opacity={0.7}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Keep the old name for backward compatibility
export const CandlestickChart = PriceChart;

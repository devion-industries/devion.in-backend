import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { CandlestickChart } from "./CandlestickChart";
import { toast } from "sonner";

interface StockDetailModalProps {
  open: boolean;
  onClose: () => void;
  stock: {
    symbol: string;
    name: string;
    ltp: number;
    change: number;
    sector: string;
    high?: number;
    low?: number;
    volume?: number;
  };
}

export const StockDetailModal = ({ open, onClose, stock }: StockDetailModalProps) => {
  const [chartPeriod, setChartPeriod] = useState<"1M" | "3M" | "1Y">("1M");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");

  // Mock account data
  const cashAvailable = 95532.15;
  const currentPositions = 5;
  const maxPositions = 10;

  // Mock candlestick data with different granularities
  const getChartData = () => {
    if (chartPeriod === "1M") {
      return [
        { date: "W1", open: stock.ltp - 50, high: stock.ltp - 30, low: stock.ltp - 60, close: stock.ltp - 40, volume: 1200000 },
        { date: "W2", open: stock.ltp - 40, high: stock.ltp - 20, low: stock.ltp - 50, close: stock.ltp - 25, volume: 1450000 },
        { date: "W3", open: stock.ltp - 25, high: stock.ltp - 10, low: stock.ltp - 35, close: stock.ltp - 15, volume: 1680000 },
        { date: "W4", open: stock.ltp - 15, high: stock.ltp + 5, low: stock.ltp - 20, close: stock.ltp, volume: 1920000 },
      ];
    } else if (chartPeriod === "3M") {
      return [
        { date: "M1", open: stock.ltp - 100, high: stock.ltp - 70, low: stock.ltp - 120, close: stock.ltp - 80, volume: 4500000 },
        { date: "M2", open: stock.ltp - 80, high: stock.ltp - 40, low: stock.ltp - 90, close: stock.ltp - 50, volume: 5200000 },
        { date: "M3", open: stock.ltp - 50, high: stock.ltp + 10, low: stock.ltp - 60, close: stock.ltp, volume: 6100000 },
      ];
    } else {
      return [
        { date: "Q1", open: stock.ltp - 200, high: stock.ltp - 150, low: stock.ltp - 230, close: stock.ltp - 170, volume: 15000000 },
        { date: "Q2", open: stock.ltp - 170, high: stock.ltp - 100, low: stock.ltp - 190, close: stock.ltp - 120, volume: 18000000 },
        { date: "Q3", open: stock.ltp - 120, high: stock.ltp - 50, low: stock.ltp - 140, close: stock.ltp - 70, volume: 21000000 },
        { date: "Q4", open: stock.ltp - 70, high: stock.ltp + 20, low: stock.ltp - 90, close: stock.ltp, volume: 24000000 },
      ];
    }
  };
  
  const chartData = getChartData();

  // Mock fundamentals
  const fundamentals = {
    marketCap: "₹1,24,532 Cr",
    peRatio: "24.5",
    dividendYield: "1.8%",
    beta: "1.12",
    week52High: `₹${(stock.ltp * 1.15).toFixed(2)}`,
    week52Low: `₹${(stock.ltp * 0.85).toFixed(2)}`,
    todayHigh: stock.high || `₹${(stock.ltp * 1.02).toFixed(2)}`,
    todayLow: stock.low || `₹${(stock.ltp * 0.98).toFixed(2)}`,
  };

  // Calculate estimated value and remaining cash
  const calculateEstimatedValue = () => {
    if (!quantity) return 0;
    const price = orderType === "limit" ? Number(limitPrice || 0) : stock.ltp;
    return Number(quantity) * price;
  };

  const estimatedValue = calculateEstimatedValue();
  const remainingCash = side === "buy" ? cashAvailable - estimatedValue : cashAvailable + estimatedValue;

  // Validation
  const isInsufficientFunds = side === "buy" && estimatedValue > cashAvailable;
  const isPositionLimitReached = currentPositions >= maxPositions;
  const isInvalidLimitPrice = orderType === "limit" && (!limitPrice || Number(limitPrice) <= 0);
  const canPlaceOrder = quantity && Number(quantity) > 0 && 
                        !isInsufficientFunds && 
                        !isPositionLimitReached && 
                        !isInvalidLimitPrice;

  const handlePlaceOrder = () => {
    if (!canPlaceOrder) return;

    toast.success(
      `${side === "buy" ? "Buy" : "Sell"} order placed for ${quantity} shares of ${stock.symbol}!`,
      {
        description: "Check your Portfolio for updates."
      }
    );

    // Clear form and close modal
    setQuantity("");
    setLimitPrice("");
    onClose();
  };

  const isPositive = stock.change >= 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="stock-description">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{stock.name}</DialogTitle>
              <DialogDescription id="stock-description" className="flex items-center gap-3 mt-2">
                <span className="font-semibold text-foreground">{stock.symbol}</span>
                <Badge variant="outline">{stock.sector}</Badge>
              </DialogDescription>
            </div>
          </div>

          {/* Price Summary */}
          <div className="pt-4 border-t mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold tabular-nums">₹{stock.ltp.toFixed(2)}</div>
                <div className={`flex items-center gap-1 mt-1 ${isPositive ? "text-gain" : "text-loss"}`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-semibold tabular-nums">
                    {isPositive ? "+" : ""}{stock.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Trading Panel */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Place Order</Label>
                  <div className="flex gap-1 p-1 bg-muted rounded-lg" role="group" aria-label="Buy or sell selector">
                    <Button
                      variant={side === "buy" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSide("buy")}
                      className={side === "buy" ? "bg-success hover:bg-success/90" : ""}
                      aria-pressed={side === "buy"}
                    >
                      Buy
                    </Button>
                    <Button
                      variant={side === "sell" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSide("sell")}
                      className={side === "sell" ? "bg-destructive hover:bg-destructive/90" : ""}
                      aria-pressed={side === "sell"}
                    >
                      Sell
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select value={orderType} onValueChange={(v: "market" | "limit") => setOrderType(v)}>
                      <SelectTrigger id="orderType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {orderType === "limit" && (
                  <div className="space-y-2">
                    <Label htmlFor="limitPrice">Limit Price (₹)</Label>
                    <Input
                      id="limitPrice"
                      type="number"
                      placeholder="0.00"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                )}

                {quantity && Number(quantity) > 0 && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated {side === "buy" ? "Cost" : "Proceeds"}:</span>
                      <span className="font-semibold tabular-nums">₹{estimatedValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining Cash:</span>
                      <span className={`font-semibold tabular-nums ${remainingCash < 0 ? "text-destructive" : ""}`}>
                        ₹{remainingCash.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {isInsufficientFunds && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">
                      Insufficient funds. You need ₹{(estimatedValue - cashAvailable).toFixed(2)} more.
                    </p>
                  </div>
                )}

                {isPositionLimitReached && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-warning">
                      You&apos;ve reached your position limit of {maxPositions} stocks.
                    </p>
                  </div>
                )}

                {orderType === "market" && quantity && Number(quantity) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Order will execute at live market price when market is open.
                  </p>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder}
                  className={`w-full ${side === "buy" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                  aria-label={`Place ${side} order for ${stock.symbol}`}
                >
                  Place {side === "buy" ? "Buy" : "Sell"} Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogHeader>

        {/* Chart Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Price Chart</h3>
            <div className="flex gap-1 p-1 bg-muted rounded-lg" role="group" aria-label="Chart period selector">
              <Button
                variant={chartPeriod === "1M" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartPeriod("1M")}
                className="h-8"
                aria-label="1 month chart"
                aria-pressed={chartPeriod === "1M"}
              >
                1M
              </Button>
              <Button
                variant={chartPeriod === "3M" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartPeriod("3M")}
                className="h-8"
                aria-label="3 month chart"
                aria-pressed={chartPeriod === "3M"}
              >
                3M
              </Button>
              <Button
                variant={chartPeriod === "1Y" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartPeriod("1Y")}
                className="h-8"
                aria-label="1 year chart"
                aria-pressed={chartPeriod === "1Y"}
              >
                1Y
              </Button>
            </div>
          </div>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <CandlestickChart data={chartData} />
            </CardContent>
          </Card>
        </div>

        {/* 52-Week Range Highlight */}
        <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
          <h4 className="text-sm font-semibold mb-3">52-Week Range</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">Low</div>
              <div className="font-semibold text-loss">{fundamentals.week52Low}</div>
            </div>
            <div className="flex-1 h-2 bg-gradient-to-r from-loss via-warning to-success rounded-full relative">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background"
                style={{ 
                  left: `${((stock.ltp - stock.ltp * 0.85) / (stock.ltp * 0.3)) * 100}%` 
                }}
                title={`Current: ₹${stock.ltp.toFixed(2)}`}
              />
            </div>
            <div className="flex-1 text-right">
              <div className="text-xs text-muted-foreground mb-1">High</div>
              <div className="font-semibold text-success">{fundamentals.week52High}</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Key Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(fundamentals).map(([key, value]) => (
              <div key={key} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <div className="font-semibold tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Description */}
        <div className="mt-6 p-4 rounded-lg bg-muted/20 border border-border/50">
          <h4 className="font-semibold mb-2">About {stock.name}</h4>
          <p className="text-sm text-muted-foreground">
            {stock.name} is a leading company in the {stock.sector} sector, known for its strong market position 
            and consistent performance. The company has demonstrated resilience and growth potential in its segment.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t mt-4">
          <Button variant="ghost" onClick={onClose} aria-label="Close stock detail modal">
            Close
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Educational simulator only. Not financial advice.
        </p>
      </DialogContent>
    </Dialog>
  );
};

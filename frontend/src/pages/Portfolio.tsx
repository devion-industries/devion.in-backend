import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockDetailModal } from "@/components/StockDetailModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, PieChart, ArrowUpRight, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, ShoppingCart } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Link } from "react-router-dom";
import type { Stock } from "@/lib/types/api";

const Portfolio = () => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"alphabet" | "gainLoss" | "weight">("alphabet");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [benchmark, setBenchmark] = useState<"NIFTY50" | "NIFTYNEXT50">("NIFTY50");

  // Get real portfolio data
  const { portfolio, holdings, isLoadingPortfolio, isLoadingHoldings } = usePortfolio();
  
  const isLoading = isLoadingPortfolio || isLoadingHoldings;

  // Calculate totals from real data
  const totalValue = portfolio?.total_value || 0;
  const totalCost = useMemo(() => {
    return holdings.reduce((sum, h) => sum + (h.quantity * h.avg_buy_price), 0);
  }, [holdings]);
  const totalPnL = useMemo(() => {
    return holdings.reduce((sum, h) => sum + (h.gain_loss || 0), 0);
  }, [holdings]);
  const totalPnLPercent = totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(2) : "0.00";

  // Calculate sector allocation
  const sectorAllocation = useMemo(() => {
    return holdings.reduce((acc: any, h) => {
      const sector = h.sector || 'Other';
      const value = h.current_value;
      acc[sector] = (acc[sector] || 0) + value;
      return acc;
    }, {});
  }, [holdings]);

  // Benchmark performance (mock data - will be replaced with real data later)
  const benchmarkPerformance = benchmark === "NIFTY50" ? 0.67 : 0.82;

  // Sort holdings with direction support
  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      let result = 0;
      
      if (sortBy === "alphabet") {
        result = a.symbol.localeCompare(b.symbol);
      } else if (sortBy === "gainLoss") {
        const aPnL = a.gain_loss_percent || 0;
        const bPnL = b.gain_loss_percent || 0;
        result = aPnL - bPnL;
      } else if (sortBy === "weight") {
        const aWeight = totalValue > 0 ? a.current_value / totalValue : 0;
        const bWeight = totalValue > 0 ? b.current_value / totalValue : 0;
        result = aWeight - bWeight;
      }
      
      // Apply sort direction
      return sortDirection === "desc" ? -result : result;
    });
  }, [holdings, sortBy, sortDirection, totalValue]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Portfolio Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-6 w-72" />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
                    <h2 className="text-4xl font-bold tabular-nums mb-3">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1 ${Number(totalPnLPercent) >= 0 ? "text-gain" : "text-loss"}`}>
                        {Number(totalPnLPercent) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="text-lg font-semibold tabular-nums">
                          {Number(totalPnLPercent) >= 0 ? "+" : ""}{totalPnLPercent}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="tabular-nums">
                          {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>{" "}
                        all time
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select value={benchmark} onValueChange={(v: any) => setBenchmark(v)}>
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NIFTY50">NIFTY 50</SelectItem>
                        <SelectItem value="NIFTYNEXT50">NIFTY Next 50</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="border-success/50 text-success bg-success/10">
                      vs {benchmark === "NIFTY50" ? "NIFTY 50" : "NIFTY Next 50"} +{benchmarkPerformance}%
                    </Badge>
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      {holdings.length} Holdings
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diversification Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">7.5/10</div>
              <p className="text-sm text-muted-foreground mb-4">
                Well diversified across sectors
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Insights
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sector Allocation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sector Allocation</CardTitle>
                <CardDescription>Portfolio breakdown by industry</CardDescription>
              </div>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(sectorAllocation).map(([sector, value]: [string, any]) => {
                const percent = ((value / totalValue) * 100).toFixed(1);
                const isOverweight = Number(percent) > 30;
                return (
                  <div key={sector} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium flex items-center gap-2">
                        {sector}
                        {isOverweight && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-warning" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-[200px]">
                                  Above recommended 30% threshold. Consider rebalancing.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </span>
                      <span className={`tabular-nums ${isOverweight ? "text-warning font-semibold" : "text-muted-foreground"}`}>
                        {percent}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isOverweight ? "bg-warning" : "bg-primary"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Holdings</CardTitle>
                <CardDescription>Live prices updated every 3 seconds</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alphabet">Alphabetical</SelectItem>
                    <SelectItem value="gainLoss">Gain/Loss %</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  className="h-8 w-8 p-0"
                  title={`Sort ${sortDirection === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Avg Cost</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">LTP</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Risk</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">P&L</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Loading skeletons
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="py-4 px-2"><Skeleton className="h-10 w-32" /></td>
                        <td className="py-4 px-2 text-right"><Skeleton className="h-6 w-12 ml-auto" /></td>
                        <td className="py-4 px-2 text-right"><Skeleton className="h-6 w-20 ml-auto" /></td>
                        <td className="py-4 px-2 text-right"><Skeleton className="h-6 w-20 ml-auto" /></td>
                        <td className="py-4 px-2 text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
                        <td className="py-4 px-2 text-right"><Skeleton className="h-6 w-24 ml-auto" /></td>
                        <td className="py-4 px-2 text-right"><Skeleton className="h-6 w-20 ml-auto" /></td>
                        <td className="py-4 px-2 text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : sortedHoldings.length === 0 ? (
                    // Empty state
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                          <div>
                            <h3 className="text-lg font-semibold mb-1">No holdings yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Start building your portfolio by exploring the market
                            </p>
                            <Link to="/market">
                              <Button>Explore Market</Button>
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedHoldings.map((holding) => {
                      const value = holding.current_value;
                      const pnl = holding.gain_loss || 0;
                      const pnlPercent = (holding.gain_loss_percent || 0).toFixed(2);
                      const weight = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0.0";
                      const isPositive = pnl >= 0;
                      const isOverweight = Number(weight) > 30;

                      return (
                        <tr 
                          key={holding.id} 
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            // Convert holding to Stock type for modal
                            const stock: Stock = {
                              symbol: holding.symbol,
                              company_name: holding.stock_name || holding.symbol,
                              ltp: holding.current_price,
                              change: pnl,
                              change_percent: Number(pnlPercent),
                              volume: 0,
                              sector: holding.sector || 'Market',
                              is_featured: false,
                              ohlc: undefined,
                            };
                            setSelectedStock(stock);
                            setModalOpen(true);
                          }}
                        >
                          <td className="py-4 px-2">
                            <div>
                              <div className="font-semibold">{holding.symbol}</div>
                              <div className="text-sm text-muted-foreground">{holding.stock_name || holding.symbol}</div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right tabular-nums">{holding.quantity}</td>
                          <td className="py-4 px-2 text-right tabular-nums">₹{holding.avg_buy_price.toFixed(2)}</td>
                          <td className="py-4 px-2 text-right">
                            <div className="font-medium tabular-nums">₹{holding.current_price.toFixed(2)}</div>
                            <Badge variant="outline" className="text-xs">Live</Badge>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="text-xs text-muted-foreground">Market</div>
                          </td>
                          <td className="py-4 px-2 text-right font-medium tabular-nums">₹{value.toFixed(2)}</td>
                          <td className="py-4 px-2 text-right">
                            <div className={`font-semibold tabular-nums ${isPositive ? "text-gain" : "text-loss"}`}>
                              {isPositive ? "+" : ""}₹{pnl.toFixed(2)}
                            </div>
                            <div className={`text-sm tabular-nums ${isPositive ? "text-gain" : "text-loss"}`}>
                              {isPositive ? "+" : ""}{pnlPercent}%
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className={`tabular-nums ${isOverweight ? "text-warning font-semibold" : "text-muted-foreground"}`}>
                                {weight}%
                              </span>
                              {isOverweight && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertTriangle className="h-4 w-4 text-warning" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs max-w-[200px]">
                                        Position exceeds 30% of portfolio. Consider rebalancing.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Portfolio Insights</CardTitle>
                <CardDescription>Personalized recommendations based on your holdings</CardDescription>
              </div>
              <ArrowUpRight className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="font-medium mb-1">Strong IT Sector Concentration</div>
              <p className="text-sm text-muted-foreground">
                35% of your portfolio is in IT stocks. Consider diversifying into other sectors like Healthcare or Consumer Goods.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="font-medium mb-1">Consistent Performer: RELIANCE</div>
              <p className="text-sm text-muted-foreground">
                Your RELIANCE holding has gained 2.4% and outperformed the sector average by 0.8%.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Get More Insights from AI Tutor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedStock(null);
          }}
          stock={selectedStock}
        />
      )}
    </AppLayout>
  );
};

export default Portfolio;

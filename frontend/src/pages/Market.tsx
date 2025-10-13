import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockDetailModal } from "@/components/StockDetailModal";
import { Search, TrendingUp, TrendingDown, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarket } from "@/hooks/useMarket";
import { usePortfolio } from "@/hooks/usePortfolio";
import type { Stock } from "@/lib/types/api";

const Market = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Get real market data
  const { featuredStocks, sectors: sectorData, isLoadingFeatured } = useMarket();
  const { holdings } = usePortfolio();

  // User holdings (extract symbols)
  const userHoldings = useMemo(() => holdings.map(h => h.symbol), [holdings]);

  // Available sectors
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set(featuredStocks.map(s => s.sector).filter(Boolean)));
    return ["all", ...uniqueSectors];
  }, [featuredStocks]);

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return featuredStocks.filter((stock) => {
      const matchesSearch = 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = sectorFilter === "all" || stock.sector === sectorFilter;
      return matchesSearch && matchesSector;
    });
  }, [featuredStocks, searchQuery, sectorFilter]);

  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Market</h1>
          <p className="text-muted-foreground">
            {isLoadingFeatured ? (
              <Skeleton className="h-5 w-64 inline-block" />
            ) : (
              `Explore ${featuredStocks.length} tradable NSE companies`
            )}
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by symbol or company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector === "all" ? "All Sectors" : sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Market Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">NIFTY 50</p>
                  <p className="text-2xl font-bold tabular-nums">22,456.30</p>
                  <div className="flex items-center gap-1 text-gain text-sm mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+0.67%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gainers</p>
                <p className="text-2xl font-bold text-gain">
                  {filteredStocks.filter(s => s.change > 0).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Losers</p>
                <p className="text-2xl font-bold text-loss">
                  {filteredStocks.filter(s => s.change < 0).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stocks List */}
        <Card>
          <CardHeader>
            <CardTitle>All Stocks</CardTitle>
            <CardDescription>
              {filteredStocks.length} stocks • Live prices from Yahoo Finance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isLoadingFeatured ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredStocks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No stocks found matching your filters</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSectorFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Stock
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Sector
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                        LTP
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                        Change
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                        Volume
                      </th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.map((stock) => {
                      const changePercent = stock.change_percent || 0;
                      const isPositive = changePercent >= 0;
                      const isOwned = userHoldings.includes(stock.symbol);

                      return (
                        <tr
                          key={stock.symbol}
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleStockClick(stock)}
                        >
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-semibold flex items-center gap-2">
                                  {stock.symbol}
                                  {isOwned && (
                                    <Badge variant="outline" className="text-xs border-primary text-primary">
                                      Owned
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {stock.company_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge variant="outline">{stock.sector || 'Market'}</Badge>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="font-medium tabular-nums">
                              ₹{stock.ltp ? stock.ltp.toFixed(2) : 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div
                              className={`flex items-center justify-end gap-1 font-semibold tabular-nums ${
                                isPositive ? "text-gain" : "text-loss"
                              }`}
                            >
                              {isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {isPositive ? "+" : ""}
                              {changePercent.toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right text-sm text-muted-foreground tabular-nums">
                            {stock.volume ? `${(stock.volume / 1000000).toFixed(2)}M` : 'N/A'}
                          </td>
                          <td className="py-4 px-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStockClick(stock);
                              }}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal
          open={!!selectedStock}
          onClose={() => setSelectedStock(null)}
          stock={selectedStock}
        />
      )}
    </AppLayout>
  );
};

export default Market;

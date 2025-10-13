import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StockDetailModal } from "@/components/StockDetailModal";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, BookOpen, Target, Zap, ShoppingCart, Lightbulb, GraduationCap } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";

const Dashboard = () => {
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Get real portfolio data
  const { portfolio, holdings, isLoadingPortfolio, isLoadingHoldings } = usePortfolio();

  // Generate portfolio history data (last 7 days) - For demo, use current value
  const comparisonData = [
    { day: "Mon", portfolio: (portfolio?.budget_amount || 10000) * 1.00, nifty: 100000 },
    { day: "Tue", portfolio: (portfolio?.budget_amount || 10000) * 0.9875, nifty: 99200 },
    { day: "Wed", portfolio: (portfolio?.budget_amount || 10000) * 1.023, nifty: 100800 },
    { day: "Thu", portfolio: (portfolio?.budget_amount || 10000) * 1.012, nifty: 101900 },
    { day: "Fri", portfolio: (portfolio?.budget_amount || 10000) * 1.048, nifty: 102400 },
    { day: "Sat", portfolio: (portfolio?.budget_amount || 10000) * 1.039, nifty: 102800 },
    { day: "Today", portfolio: portfolio?.total_value || 10000, nifty: 103900 },
  ];

  const aiInsights = [
    `You have ₹${portfolio?.current_cash.toLocaleString()} in cash available for trading. Consider diversifying your portfolio!`,
    portfolio && portfolio.holdings_count > 0 
      ? `Great job! You're actively managing ${portfolio.holdings_count} position${portfolio.holdings_count > 1 ? 's' : ''} in your portfolio.`
      : "Ready to start trading? Browse the Market to place your first order!",
    portfolio && portfolio.total_gain_loss !== 0
      ? `Your portfolio is ${portfolio.total_gain_loss > 0 ? 'up' : 'down'} ₹${Math.abs(portfolio.total_gain_loss).toFixed(2)} (${portfolio.total_gain_loss_percent.toFixed(2)}%) overall.`
      : "Your portfolio is starting fresh. Time to make some smart trades!",
  ];

  const hasHoldings = holdings.length > 0;
  const isLoading = isLoadingPortfolio || isLoadingHoldings;

  // Calculate today's change (simplified - using total_gain_loss as proxy)
  const todayChange = portfolio?.total_gain_loss || 0;
  const todayChangePercent = portfolio?.total_gain_loss_percent || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hero NAV Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-64" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Portfolio Value (NAV)</p>
                  <h2 className="text-4xl font-bold tabular-nums mb-3">
                    ₹{portfolio?.total_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1 ${todayChangePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {todayChangePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="text-lg font-semibold tabular-nums">
                        {todayChangePercent >= 0 ? '+' : ''}{todayChangePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="tabular-nums">
                        {todayChange >= 0 ? '+' : ''}₹{Math.abs(todayChange).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span> overall
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cash Available</span>
                    <span className="font-semibold tabular-nums">₹{portfolio?.current_cash.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Holdings</span>
                    <span className="font-semibold tabular-nums">{portfolio?.holdings_count || 0} positions</span>
                  </div>
                  <div className="h-16 flex items-end gap-1">
                    {[32, 45, 38, 52, 48, 55, 51, 58, 62, 59, 65, 68].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>AI Insights</CardTitle>
            </div>
            <CardDescription>Personalized recommendations based on your activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {aiInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Portfolio vs NIFTY Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance (Last 7 Days)</CardTitle>
            <CardDescription>Your portfolio compared to NIFTY 50</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    fontWeight={500}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    fontWeight={500}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                      padding: "12px",
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const portfolioValue = payload.find(p => p.dataKey === 'portfolio')?.value;
                        const niftyValue = payload.find(p => p.dataKey === 'nifty')?.value;
                        const difference = ((portfolioValue as number) - (niftyValue as number)) / (niftyValue as number) * 100;
                        
                        return (
                          <div className="bg-popover border border-border rounded-xl p-3 shadow-xl min-w-[180px]">
                            <p className="font-semibold mb-3 text-sm text-foreground">{label}</p>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Your Portfolio:</span>
                                <span className="font-semibold text-primary">₹{(portfolioValue as number).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">NIFTY 50:</span>
                                <span className="font-medium">₹{(niftyValue as number).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center pt-1 border-t border-border/50">
                                <span className="text-muted-foreground">Difference:</span>
                                <span className={`font-semibold ${difference >= 0 ? 'text-success' : 'text-destructive'}`}>
                                  {difference >= 0 ? '+' : ''}{difference.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="portfolio"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nifty"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: "hsl(var(--muted-foreground))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-primary" />
                <span>Your Portfolio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-muted-foreground border-dashed" />
                <span>NIFTY 50</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
                <Link to="/market">
                  <ShoppingCart className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-semibold">Buy Stock</div>
                    <div className="text-xs text-muted-foreground">Place a new order</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
                <Link to="/learn">
                  <BookOpen className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-semibold">Continue Lesson</div>
                    <div className="text-xs text-muted-foreground">P/E Ratio basics</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
                <Link to="/quiz">
                  <GraduationCap className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-semibold">Start Quiz</div>
                    <div className="text-xs text-muted-foreground">Test your knowledge</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Lesson of the Day */}
          <Card className="card-interactive">
            <CardHeader>
              <div className="flex items-center justify-between">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">5-8 min</span>
              </div>
              <CardTitle className="mt-4">Understanding P/E Ratio</CardTitle>
              <CardDescription>
                Learn how to evaluate if a stock is overvalued or undervalued
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={0} className="mb-3" />
              <Button className="w-full" variant="outline" asChild>
                <Link to="/learn">Start Lesson</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quiz of the Day */}
          <Card className="card-interactive border-warning/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Target className="h-5 w-5 text-warning" />
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-warning" />
                  <span className="text-xs font-semibold">7 day streak</span>
                </div>
              </div>
              <CardTitle className="mt-4">Daily Quiz Challenge</CardTitle>
              <CardDescription>
                Test your knowledge on diversification strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">0/10 questions</span>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/quiz">Take Quiz</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Challenge Spotlight */}
          <Card className="card-interactive border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <span className="text-xs text-muted-foreground">3 days left</span>
              </div>
              <CardTitle className="mt-4">Weekly Challenge</CardTitle>
              <CardDescription>
                Beat NIFTY 50 returns this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Your Return</span>
                  <span className="font-semibold text-gain tabular-nums">+2.34%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>NIFTY 50</span>
                  <span className="font-semibold tabular-nums">+0.84%</span>
                </div>
              </div>
              <Button className="w-full" variant="secondary" asChild>
                <Link to="/badges">View Details</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Snapshot */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Top Holdings</CardTitle>
              <CardDescription>Loading your positions...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : hasHoldings ? (
          <Card>
            <CardHeader>
              <CardTitle>Top Holdings</CardTitle>
              <CardDescription>Your current positions ({holdings.length})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings.slice(0, 5).map((holding) => {
                  const totalValue = portfolio?.total_value || 1;
                  const weight = ((holding.current_value / totalValue) * 100);
                  
                  return (
                    <HoldingRow
                      key={holding.id}
                      symbol={holding.symbol}
                      name={holding.stock_name || holding.symbol}
                      quantity={holding.quantity}
                      ltp={holding.current_price}
                      change={holding.gain_loss_percent}
                      weight={weight}
                      sector="Market"
                      onClick={() => {
                        setSelectedStock({
                          symbol: holding.symbol,
                          name: holding.stock_name || holding.symbol,
                          ltp: holding.current_price,
                          change: holding.gain_loss_percent,
                          sector: "Market",
                        });
                        setModalOpen(true);
                      }}
                    />
                  );
                })}
              </div>
              {holdings.length > 5 && (
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Showing top 5 of {holdings.length} holdings
                </p>
              )}
              <Button variant="ghost" className="w-full mt-4" asChild>
                <Link to="/portfolio">View Full Portfolio →</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">No holdings yet</h3>
                <p className="text-muted-foreground">
                  Start exploring the Market to place your first trade!
                </p>
                <Button size="lg" asChild>
                  <Link to="/market">Explore Market</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
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

const HoldingRow = ({
  symbol,
  name,
  quantity,
  ltp,
  change,
  weight,
  sector,
  onClick,
}: {
  symbol: string;
  name: string;
  quantity: number;
  ltp: number;
  change: number;
  weight: number;
  sector: string;
  onClick: () => void;
}) => {
  const isPositive = change >= 0;
  
  return (
    <div 
      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="font-semibold">{symbol}</div>
        <div className="text-sm text-muted-foreground">{name}</div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-right">
          <div className="font-medium tabular-nums">₹{ltp.toFixed(2)}</div>
          <div className="text-muted-foreground">{quantity} qty</div>
        </div>
        <div className={`flex items-center gap-1 min-w-[70px] ${
          isPositive ? "text-gain" : "text-loss"
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span className="font-semibold tabular-nums">{isPositive ? "+" : ""}{change}%</span>
        </div>
        <div className="text-muted-foreground min-w-[50px] text-right tabular-nums">
          {weight}%
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

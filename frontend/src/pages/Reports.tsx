import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FileText, TrendingUp, BookOpen, Award, Download, Sparkles, Share2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { usePortfolio } from "@/hooks/usePortfolio";

const Reports = () => {
  const [chartPeriod, setChartPeriod] = useState<"week" | "month" | "quarter">("week");
  
  const weeklyReport = {
    week: "Sep 25 - Oct 1, 2025",
    portfolio: {
      startValue: 103500,
      endValue: 105467.85,
      return: 1.90,
      trades: 4,
      topPerformer: "TCS (+3.2%)",
    },
    learning: {
      lessonsCompleted: 3,
      quizzesTaken: 5,
      avgQuizScore: 82,
      newBadges: 1,
      streakMaintained: true,
    },
    insights: [
      "Despite Tuesday's market volatility (↓1.25%), your portfolio recovered brilliantly with a 3.6% Friday surge!",
      "Your risk tolerance paid off - you outperformed NIFTY 50 by 1.5% through strategic patience during the dip.",
      "You maintained your 7-day learning streak even during volatile market days - excellent emotional discipline!",
    ],
  };

  // Portfolio performance chart data - Dynamic for demo
  const getPortfolioChartData = () => {
    if (chartPeriod === "week") {
      return [
        { date: "Mon", value: 100000, nifty: 100000 },
        { date: "Tue", value: 98750, nifty: 99200 }, // Market dip
        { date: "Wed", value: 102300, nifty: 100800 }, // Strong recovery
        { date: "Thu", value: 101200, nifty: 101900 }, // Volatility continues
        { date: "Fri", value: 104800, nifty: 102400 }, // Big surge
        { date: "Sat", value: 103900, nifty: 102800 }, // Weekend pullback
        { date: "Today", value: 105467, nifty: 103900 }, // Final outperformance
      ];
    } else if (chartPeriod === "month") {
      return [
        { date: "Week 1", value: 100000, nifty: 100000 },
        { date: "Week 2", value: 97800, nifty: 98500 }, // Correction
        { date: "Week 3", value: 102400, nifty: 101200 }, // Recovery
        { date: "Week 4", value: 105467, nifty: 103900 }, // Strong finish
      ];
    } else {
      return [
        { date: "Month 1", value: 95000, nifty: 96200 }, // Started behind
        { date: "Month 2", value: 98500, nifty: 99800 }, // Catching up
        { date: "Month 3", value: 105467, nifty: 103900 }, // Surged ahead
      ];
    }
  };

  // Learning progress chart data
  const getLearningChartData = () => {
    if (chartPeriod === "week") {
      return [
        { date: "Mon", lessons: 1, quizzes: 1 },
        { date: "Tue", lessons: 0, quizzes: 2 },
        { date: "Wed", lessons: 1, quizzes: 1 },
        { date: "Thu", lessons: 0, quizzes: 0 },
        { date: "Fri", lessons: 1, quizzes: 1 },
      ];
    } else if (chartPeriod === "month") {
      return [
        { date: "Week 1", lessons: 2, quizzes: 3 },
        { date: "Week 2", lessons: 3, quizzes: 4 },
        { date: "Week 3", lessons: 2, quizzes: 2 },
        { date: "Week 4", lessons: 3, quizzes: 5 },
      ];
    } else {
      return [
        { date: "Month 1", lessons: 8, quizzes: 12 },
        { date: "Month 2", lessons: 10, quizzes: 15 },
        { date: "Month 3", lessons: 10, quizzes: 14 },
      ];
    }
  };

  const portfolioData = getPortfolioChartData();
  const learningData = getLearningChartData();

  const handleDownloadPDF = () => {
    toast.success("Generating PDF report...", {
      description: "Your report will download in a moment",
    });
    // In production, this would call a backend endpoint
  };

  const handleShareSummary = () => {
    const summary = `📊 My Devion Weekly Summary

🎯 Portfolio Return: +${weeklyReport.portfolio.return}%
📚 Lessons Completed: ${weeklyReport.learning.lessonsCompleted}
🏆 Badges Earned: ${weeklyReport.learning.newBadges}
🔥 Streak: ${weeklyReport.learning.streakMaintained ? "Maintained" : "Broken"}
✨ Quiz Avg: ${weeklyReport.learning.avgQuizScore}%

Keep learning and growing with Devion!`;

    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard!", {
      description: "Share your progress with friends",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Weekly Reports</h1>
            <p className="text-muted-foreground">
              Track your learning and investing progress over time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="current">
              <SelectTrigger className="w-48" aria-label="Select report week">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">{weeklyReport.week}</SelectItem>
                <SelectItem value="prev1">Sep 18 - Sep 24</SelectItem>
                <SelectItem value="prev2">Sep 11 - Sep 17</SelectItem>
                <SelectItem value="prev3">Sep 4 - Sep 10</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleShareSummary}
              aria-label="Share report summary"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleDownloadPDF}
              aria-label="Download report as PDF"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Week of {weeklyReport.week}</CardTitle>
                <CardDescription>Your performance summary</CardDescription>
              </div>
              <Badge variant="outline" className="border-success/50 text-success">
                Great Week!
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Portfolio Return</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gain" />
                  <span className="text-3xl font-bold text-gain tabular-nums">
                    +{weeklyReport.portfolio.return}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  ₹{(weeklyReport.portfolio.endValue - weeklyReport.portfolio.startValue).toFixed(2)} gained
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Learning Progress</div>
                <div className="text-3xl font-bold">{weeklyReport.learning.lessonsCompleted}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Lessons completed • {weeklyReport.learning.avgQuizScore}% avg quiz score
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Achievements</div>
                <div className="text-3xl font-bold">{weeklyReport.learning.newBadges}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  New badge unlocked
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Performance Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Portfolio Performance</CardTitle>
              </div>
              <div className="flex gap-1 p-1 bg-muted rounded-lg" role="group" aria-label="Chart time period selector">
                <Button
                  variant={chartPeriod === "week" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setChartPeriod("week")}
                  className="h-8"
                  aria-label="View weekly chart"
                  aria-pressed={chartPeriod === "week"}
                >
                  Week
                </Button>
                <Button
                  variant={chartPeriod === "month" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setChartPeriod("month")}
                  className="h-8"
                  aria-label="View monthly chart"
                  aria-pressed={chartPeriod === "month"}
                >
                  Month
                </Button>
                <Button
                  variant={chartPeriod === "quarter" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setChartPeriod("quarter")}
                  className="h-8"
                  aria-label="View quarterly chart"
                  aria-pressed={chartPeriod === "quarter"}
                >
                  Quarter
                </Button>
              </div>
            </div>
            <CardDescription>Compare your returns against NIFTY 50</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Your Portfolio"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="nifty"
                  name="NIFTY 50"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(var(--muted-foreground))", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Learning Progress Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-secondary" />
              <CardTitle>Learning Activity Over Time</CardTitle>
            </div>
            <CardDescription>Track your lessons and quiz completion</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={learningData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="lessons"
                  name="Lessons"
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="quizzes"
                  name="Quizzes"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Detailed Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">{/* ... keep existing code */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Starting Value</span>
                  <span className="font-semibold tabular-nums">
                    ₹{weeklyReport.portfolio.startValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Ending Value</span>
                  <span className="font-semibold tabular-nums">
                    ₹{weeklyReport.portfolio.endValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-success/10">
                  <span className="text-sm font-medium">Net Gain</span>
                  <span className="font-bold text-gain tabular-nums">
                    +₹{(weeklyReport.portfolio.endValue - weeklyReport.portfolio.startValue).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Trades Executed</span>
                  <span className="font-semibold">{weeklyReport.portfolio.trades}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Top Performer</span>
                  <span className="font-semibold">{weeklyReport.portfolio.topPerformer}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-primary/10">
                  <span className="text-sm font-medium">vs NIFTY 50</span>
                  <Badge variant="outline" className="border-success/50 text-success">
                    +0.8% ahead
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Activity Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-secondary" />
              <CardTitle>Learning Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>{/* ... keep existing code */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold mb-1">{weeklyReport.learning.lessonsCompleted}</div>
                <div className="text-sm text-muted-foreground">Lessons</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold mb-1">{weeklyReport.learning.quizzesTaken}</div>
                <div className="text-sm text-muted-foreground">Quizzes</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold mb-1">{weeklyReport.learning.avgQuizScore}%</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold mb-1">{weeklyReport.learning.newBadges}</div>
                <div className="text-sm text-muted-foreground">New Badges</div>
              </div>
            </div>

            {weeklyReport.learning.streakMaintained && (
              <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-3">
                <Award className="h-5 w-5 text-warning" />
                <div>
                  <div className="font-semibold">Streak Maintained!</div>
                  <div className="text-sm text-muted-foreground">
                    You kept your learning streak alive this week
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI Insights</CardTitle>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Personalized observations from your AI tutor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyReport.insights.map((insight, index) => (
              <div key={index} className="p-4 rounded-lg bg-card border border-border">
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            View All Reports
          </Button>
          <Button className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            Get Detailed Analysis
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;

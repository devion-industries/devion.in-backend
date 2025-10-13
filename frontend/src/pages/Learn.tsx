import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Search, Sparkles, CheckCircle2 } from "lucide-react";

const Learn = () => {
  const lessons = [
    {
      id: 1,
      title: "What is the Stock Market?",
      description: "Learn the basics of how stock markets work and why companies go public",
      duration: 8,
      difficulty: "beginner",
      category: "Fundamentals",
      progress: 100,
    },
    {
      id: 2,
      title: "Understanding P/E Ratio",
      description: "Evaluate if a stock is overvalued or undervalued using Price-to-Earnings ratio",
      duration: 6,
      difficulty: "beginner",
      category: "Valuation",
      progress: 0,
    },
    {
      id: 3,
      title: "Diversification Strategy",
      description: "Why not putting all eggs in one basket is crucial for long-term success",
      duration: 10,
      difficulty: "intermediate",
      category: "Risk Management",
      progress: 45,
    },
    {
      id: 4,
      title: "Reading Balance Sheets",
      description: "Understand a company's financial health through its balance sheet",
      duration: 12,
      difficulty: "intermediate",
      category: "Analysis",
      progress: 0,
    },
    {
      id: 5,
      title: "Market Orders vs Limit Orders",
      description: "Learn the difference and when to use each type of order",
      duration: 5,
      difficulty: "beginner",
      category: "Trading",
      progress: 100,
    },
    {
      id: 6,
      title: "Power of Compounding",
      description: "How reinvesting dividends and capital gains accelerates wealth creation",
      duration: 7,
      difficulty: "intermediate",
      category: "Concepts",
      progress: 0,
    },
  ];

  const difficultyColors = {
    beginner: "bg-success/10 text-success",
    intermediate: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Learn Investing</h1>
            <p className="text-muted-foreground">
              Master stock market concepts through bite-sized lessons
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/50 text-primary">
              3 / 6 Completed
            </Badge>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Ask AI Tutor
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search lessons..." className="pl-10" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">All Topics</Button>
                <Button variant="outline" size="sm">Fundamentals</Button>
                <Button variant="outline" size="sm">Trading</Button>
                <Button variant="outline" size="sm">Analysis</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <CardTitle>Your Learning Journey</CardTitle>
            <CardDescription>Keep the momentum going!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span className="font-medium">50% Complete</span>
              </div>
              <Progress value={50} className="h-3" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                3 lessons completed • 3 in progress
              </div>
              <Button variant="outline" size="sm">View Path</Button>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="card-interactive">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    lesson.progress === 100 ? "bg-success/10" : "bg-primary/10"
                  }`}>
                    {lesson.progress === 100 ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={difficultyColors[lesson.difficulty as keyof typeof difficultyColors]}
                    >
                      {lesson.difficulty}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration} min
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {lesson.category}
                  </Badge>
                </div>

                {lesson.progress > 0 && lesson.progress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{lesson.progress}%</span>
                    </div>
                    <Progress value={lesson.progress} />
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    variant={lesson.progress === 100 ? "outline" : "default"}
                    className="w-full"
                  >
                    {lesson.progress === 100
                      ? "Review Lesson"
                      : lesson.progress > 0
                      ? "Continue Learning"
                      : "Start Lesson"}
                  </Button>
                  {lesson.progress === 100 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => window.location.href = "/quiz"}
                    >
                      Take Quiz on {lesson.category}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommended Next */}
        <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your learning progress</CardDescription>
              </div>
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You're doing great with fundamentals! Try learning about "Reading Balance Sheets" next to deepen your analysis skills.
            </p>
            <Button variant="secondary">View Recommendation</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Learn;

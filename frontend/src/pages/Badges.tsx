import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, Lock, TrendingUp, BookOpen, Target, Zap, Trophy, Star, Info, ChevronRight, Calendar, Clock } from "lucide-react";

const Badges = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  const challenges = [
    {
      id: 1,
      title: "Weekly Challenge: Beat NIFTY",
      description: "Outperform NIFTY 50 for 30 consecutive days",
      progress: 70,
      current: 21,
      target: 30,
      daysLeft: 3,
      yourReturn: 1.8,
      benchmarkReturn: 1.1,
      reward: "Market Beater Badge + 50 XP",
      tips: [
        "Diversify across sectors to reduce risk",
        "Consider stocks with strong fundamentals",
        "Monitor daily market trends and news"
      ]
    },
    {
      id: 2,
      title: "Monthly Challenge: 30-Day Streak",
      description: "Complete at least one learning activity daily for 30 days",
      progress: 23,
      current: 7,
      target: 30,
      daysLeft: 23,
      reward: "Consistency Master Badge + 100 XP",
      tips: [
        "Set a daily reminder to complete a lesson",
        "Take quizzes to reinforce learning",
        "Spend at least 10 minutes per day on the platform"
      ]
    }
  ];

  const badges = [
    {
      id: 1,
      name: "First Trade",
      description: "Place your first simulated trade",
      icon: TrendingUp,
      unlocked: true,
      unlockedAt: "2025-09-15",
      category: "Trading",
      howToUnlock: "Complete your first trade on the Market page",
      current: 1,
      target: 1,
    },
    {
      id: 2,
      name: "Bookworm",
      description: "Complete 10 learning lessons",
      icon: BookOpen,
      unlocked: true,
      unlockedAt: "2025-09-22",
      category: "Learning",
      howToUnlock: "Finish 10 lessons from the Learn section",
      current: 10,
      target: 10,
    },
    {
      id: 3,
      name: "Quiz Master",
      description: "Score 100% on any quiz",
      icon: Target,
      unlocked: false,
      progress: 85,
      category: "Quizzes",
      howToUnlock: "Get a perfect score in any quiz. Your best score so far is 85%",
      current: 85,
      target: 100,
    },
    {
      id: 4,
      name: "7 Day Streak",
      description: "Maintain a 7-day learning streak",
      icon: Zap,
      unlocked: true,
      unlockedAt: "2025-10-01",
      category: "Consistency",
      howToUnlock: "Log in and complete at least one activity for 7 consecutive days",
      current: 7,
      target: 7,
    },
    {
      id: 5,
      name: "Diversifier",
      description: "Hold stocks from 5 different sectors",
      icon: Award,
      unlocked: true,
      unlockedAt: "2025-09-28",
      category: "Portfolio",
      howToUnlock: "Build a portfolio with stocks from 5 different sectors",
      current: 5,
      target: 5,
    },
    {
      id: 6,
      name: "Market Beater",
      description: "Outperform NIFTY 50 for one month",
      icon: Trophy,
      unlocked: false,
      progress: 60,
      category: "Performance",
      howToUnlock: "Maintain returns higher than NIFTY 50 for 30 consecutive days",
      current: 18,
      target: 30,
    },
    {
      id: 7,
      name: "Early Bird",
      description: "Log in before 9 AM on 10 days",
      icon: Star,
      unlocked: false,
      progress: 30,
      category: "Consistency",
      howToUnlock: "Access the platform before 9 AM IST on 10 different days",
      current: 3,
      target: 10,
    },
    {
      id: 8,
      name: "Risk Manager",
      description: "Maintain portfolio diversification score above 8/10",
      icon: Award,
      unlocked: false,
      progress: 75,
      category: "Portfolio",
      howToUnlock: "Achieve and maintain a diversification score of 8 or higher for 7 days",
      current: 5,
      target: 7,
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const categoryColors: Record<string, string> = {
    Trading: "bg-primary/10 text-primary",
    Learning: "bg-secondary/10 text-secondary",
    Quizzes: "bg-warning/10 text-warning",
    Consistency: "bg-success/10 text-success",
    Portfolio: "bg-destructive/10 text-destructive",
    Performance: "bg-primary/10 text-primary",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Badges & Achievements</h1>
          <p className="text-muted-foreground">Unlock badges as you progress through your investing journey</p>
        </div>

        {/* Progress Summary */}
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Keep earning badges to level up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {unlockedCount} / {badges.length}
              </div>
              <Badge variant="outline" className="border-primary/50 text-primary text-sm">
                {Math.round((unlockedCount / badges.length) * 100)}% Complete
              </Badge>
            </div>
            <Progress value={(unlockedCount / badges.length) * 100} className="h-3" />
            <div className="text-sm text-muted-foreground">
              {badges.length - unlockedCount} more badges to unlock
            </div>
          </CardContent>
        </Card>

        {/* Badges Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={`card-interactive relative cursor-pointer ${
                        badge.unlocked ? "" : "opacity-75"
                      }`}
                    >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-3 rounded-xl ${
                          badge.unlocked
                            ? "bg-gradient-to-br from-primary/20 to-secondary/20"
                            : "bg-muted"
                        }`}
                      >
                        {badge.unlocked ? (
                          <Icon className="h-6 w-6 text-primary" />
                        ) : (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={categoryColors[badge.category]}
                        >
                          {badge.category}
                        </Badge>
                        {!badge.unlocked && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-1 rounded-full hover:bg-muted transition-colors">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px]">
                              <p className="text-sm">{badge.howToUnlock}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{badge.name}</CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {badge.unlocked ? (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <Award className="h-4 w-4" />
                        Unlocked on {new Date(badge.unlockedAt!).toLocaleDateString()}
                      </div>
                    ) : (
                      badge.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {badge.current}/{badge.target}
                            </span>
                          </div>
                          <Progress value={badge.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {badge.target - badge.current} more to unlock
                          </p>
                        </div>
                      )
                    )}
                  </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4">
                    <div className="space-y-2">
                      <div className="font-semibold flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {badge.name}
                      </div>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      
                      {badge.unlocked ? (
                        <div className="text-xs text-success">
                          ✅ Unlocked on {new Date(badge.unlockedAt!).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-xs font-medium">How to unlock:</div>
                          <div className="text-xs text-muted-foreground">{badge.howToUnlock}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <span>Progress:</span>
                            <span className="font-medium">{badge.current}/{badge.target}</span>
                            <span className="text-muted-foreground">
                              ({Math.round(((badge.current || 0) / badge.target) * 100)}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Current Challenges */}
        <Card className="border-warning/20 bg-gradient-to-br from-card to-warning/5">
          <CardHeader>
            <CardTitle>Active Challenges</CardTitle>
            <CardDescription>Complete these to earn more badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {challenges.map((challenge) => (
              <button 
                key={challenge.id}
                className="w-full p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors text-left"
                onClick={() => setSelectedChallenge(challenge)}
                aria-label={`View details for ${challenge.title}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{challenge.title}</div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {challenge.daysLeft} days left
                  </Badge>
                </div>
                {challenge.yourReturn !== undefined ? (
                  <div className="text-sm text-muted-foreground mb-3 flex items-center justify-between">
                    <span>Your Return: +{challenge.yourReturn}% • NIFTY 50: +{challenge.benchmarkReturn}%</span>
                    <span className="text-success font-medium">You&apos;re ahead!</span>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mb-3">
                    Current Streak: {challenge.current} days • Keep it up!
                  </div>
                )}
                <Progress value={challenge.progress} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{challenge.current}/{challenge.target} days completed</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
          <DialogContent className="max-w-2xl" aria-describedby="challenge-description">
            <DialogHeader>
              <DialogTitle>{selectedChallenge.title}</DialogTitle>
              <DialogDescription id="challenge-description">
                {selectedChallenge.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Progress Overview */}
              <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Progress</div>
                      <div className="text-3xl font-bold">
                        {selectedChallenge.current}/{selectedChallenge.target} days
                      </div>
                    </div>
                    <Badge variant="outline" className="border-warning/50 text-warning">
                      <Calendar className="h-3 w-3 mr-1" />
                      {selectedChallenge.daysLeft} days remaining
                    </Badge>
                  </div>
                  <Progress value={selectedChallenge.progress} className="h-3" />
                  <div className="mt-2 text-sm text-muted-foreground">
                    {selectedChallenge.progress}% complete
                  </div>
                </CardContent>
              </Card>

              {/* Current Stats */}
              {selectedChallenge.yourReturn !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Your Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                        <div className="text-xs text-muted-foreground mb-1">Your Return</div>
                        <div className="text-2xl font-bold text-success">+{selectedChallenge.yourReturn}%</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">NIFTY 50</div>
                        <div className="text-2xl font-bold">+{selectedChallenge.benchmarkReturn}%</div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-sm font-medium text-primary">
                        You&apos;re beating the benchmark by +{(selectedChallenge.yourReturn - selectedChallenge.benchmarkReturn).toFixed(1)}%!
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reward */}
              <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-secondary" />
                    Reward
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{selectedChallenge.reward}</p>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tips to Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedChallenge.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
};

export default Badges;

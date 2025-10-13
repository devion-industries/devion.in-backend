import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Copy, Check, Users } from "lucide-react";
import { toast } from "sonner";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("global");
  const [referralCopied, setReferralCopied] = useState(false);

  const leaderboardData = [
    { rank: 1, alias: "StockGuru99", return: 15.8, badges: 12, streak: 28 },
    { rank: 2, alias: "InvestorPro", return: 14.2, badges: 10, streak: 21 },
    { rank: 3, alias: "MarketWiz", return: 12.5, badges: 11, streak: 15 },
    { rank: 4, alias: "TradeKing", return: 11.9, badges: 9, streak: 14 },
    { rank: 5, alias: "BullRunner", return: 10.4, badges: 8, streak: 12 },
    { rank: 6, alias: "SmartMoney", return: 9.8, badges: 7, streak: 10 },
    { rank: 7, alias: "WealthBuilder", return: 8.5, badges: 9, streak: 18 },
    { rank: 8, alias: "ValueSeeker", return: 7.9, badges: 6, streak: 7 },
    { rank: 9, alias: "GrowthHunter", return: 7.2, badges: 5, streak: 6 },
    { rank: 10, alias: "DividendKid", return: 6.8, badges: 7, streak: 9 },
  ];

  // Mock cohort data (school/NGO group)
  const cohortData = [
    { rank: 1, alias: "MarketStar", return: 8.9, badges: 9, streak: 15, school: "Delhi Public School" },
    { rank: 2, alias: "InvestorRaj", return: 5.4, badges: 5, streak: 7, school: "Delhi Public School", isMe: true },
    { rank: 3, alias: "TradePro21", return: 4.8, badges: 6, streak: 10, school: "Delhi Public School" },
    { rank: 4, alias: "FinanceKid", return: 3.2, badges: 4, streak: 5, school: "Delhi Public School" },
    { rank: 5, alias: "StockLearner", return: 2.1, badges: 3, streak: 4, school: "Delhi Public School" },
  ];

  const myRank = { rank: 15, alias: "InvestorRaj", return: 5.4, badges: 5, streak: 7 };
  const referralCode = "INVEST-RAJ-2025";

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setReferralCopied(true);
    toast.success("Referral code copied to clipboard!");
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-warning" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Award className="h-5 w-5 text-warning/70" />;
      default:
        return null;
    }
  };

  const getAvatarColor = (rank: number) => {
    if (rank === 1) return "bg-warning/20 text-warning";
    if (rank === 2) return "bg-muted text-muted-foreground";
    if (rank === 3) return "bg-warning/10 text-warning/70";
    return "bg-primary/10 text-primary";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank against other investors
          </p>
        </div>

        {/* My Rank Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <CardTitle>Your Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold">#{myRank.rank}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg">{myRank.alias}</div>
                  <div className="text-sm text-muted-foreground">
                    {myRank.badges} badges • {myRank.streak} day streak
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-gain">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-2xl font-bold tabular-nums">+{myRank.return}%</span>
                </div>
                <div className="text-sm text-muted-foreground">Portfolio Return</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>Updated in real-time as portfolios change</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="global">Global</TabsTrigger>
                <TabsTrigger value="cohort">My Cohort</TabsTrigger>
                <TabsTrigger value="friends">Friends</TabsTrigger>
              </TabsList>

              <TabsContent value="global" className="space-y-3">
                {leaderboardData.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      user.rank <= 3
                        ? "bg-gradient-to-r from-primary/5 to-transparent border border-border"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 flex items-center justify-center">
                        {getRankIcon(user.rank) || (
                          <span className="text-sm font-semibold text-muted-foreground">
                            #{user.rank}
                          </span>
                        )}
                      </div>
                      <Avatar className={getAvatarColor(user.rank)}>
                        <AvatarFallback>
                          {user.alias.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{user.alias}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.badges} badges • {user.streak} day streak
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-gain">
                          <TrendingUp className="h-3 w-3" />
                          <span className="font-bold tabular-nums">+{user.return}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Return</div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="cohort" className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Delhi Public School - Class 12A</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your cohort is assigned based on your school/educational institution. Compete with your classmates and track your progress together.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">5 Members</Badge>
                    <span>•</span>
                    <span>Rankings update daily at 8:00 PM IST</span>
                  </div>
                </div>

                {cohortData.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      user.isMe
                        ? "bg-primary/5 border border-primary/20"
                        : user.rank <= 3
                        ? "bg-gradient-to-r from-primary/5 to-transparent border border-border"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 flex items-center justify-center">
                        {getRankIcon(user.rank) || (
                          <span className="text-sm font-semibold text-muted-foreground">
                            #{user.rank}
                          </span>
                        )}
                      </div>
                      <Avatar className={getAvatarColor(user.rank)}>
                        <AvatarFallback>
                          {user.alias.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {user.alias}
                          {user.isMe && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.badges} badges • {user.streak} day streak
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-gain">
                          <TrendingUp className="h-3 w-3" />
                          <span className="font-bold tabular-nums">+{user.return}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Return</div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Invite Friends to Compete</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Share your referral code with friends to create a private leaderboard
                  </p>

                  <div className="max-w-md mx-auto space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="text-xs text-muted-foreground mb-2">Your Referral Code</div>
                      <div className="flex items-center gap-2">
                        <code 
                          className="flex-1 p-3 rounded-md bg-background border border-border font-mono text-sm"
                          aria-label="Referral code"
                        >
                          {referralCode}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyReferralCode}
                          className="shrink-0"
                          aria-label={referralCopied ? "Code copied" : "Copy referral code"}
                        >
                          {referralCopied ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Friends who join using your code will automatically appear in this leaderboard
                    </div>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-primary">
                        💡 Tip: When your friends use your referral code during signup, they&apos;ll be added to your friends list instantly!
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Competition Info */}
        <Card className="border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
          <CardHeader>
            <CardTitle>How Rankings Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <Badge variant="outline" className="border-primary/50 text-primary">1</Badge>
              <div>
                <div className="font-medium mb-1">Portfolio Returns</div>
                <p className="text-muted-foreground">
                  Primary ranking factor based on your overall percentage gain/loss
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="border-primary/50 text-primary">2</Badge>
              <div>
                <div className="font-medium mb-1">Learning Progress</div>
                <p className="text-muted-foreground">
                  Badges earned and quiz performance contribute to tiebreakers
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="border-primary/50 text-primary">3</Badge>
              <div>
                <div className="font-medium mb-1">Privacy Controls</div>
                <p className="text-muted-foreground">
                  Only your alias is shown. Hide yourself from public rankings in Settings → Privacy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Leaderboard;

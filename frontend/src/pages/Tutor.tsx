import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, BookOpen, PieChart, TrendingUp, Globe } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Tutor = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI investing tutor. I'm here to help you understand stock market concepts in simple terms. What would you like to learn about today?",
    },
  ]);
  const [input, setInput] = useState("");

  const quickActions = [
    { label: "Explain Like I'm 15", icon: Sparkles },
    { label: "Use Hinglish", icon: Globe },
    { label: "Analyze My Portfolio", icon: PieChart },
  ];

  const topicChips = [
    { label: "Diversification", icon: PieChart },
    { label: "Compounding", icon: TrendingUp },
    { label: "Risk Management", icon: BookOpen },
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      { role: "user", content: input },
      {
        role: "assistant",
        content: "That's a great question! Let me explain that in a way that's easy to understand...",
      },
    ]);
    setInput("");
  };

  const handleQuickAction = (action: string) => {
    setMessages([
      ...messages,
      { role: "user", content: action },
      {
        role: "assistant",
        content: `Sure! Let me help you with that...`,
      },
    ]);
  };

  return (
    <AppLayout>
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>AI Tutor</CardTitle>
                  <CardDescription>Ask me anything about investing</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline" className="border-primary/50 text-primary">
                  Educational Only
                </Badge>
                <Badge variant="outline" className="text-xs">Educational simulator only. Not financial advice.</Badge>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        <AvatarFallback>
                          <Sparkles className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="bg-primary/10">
                        <AvatarFallback className="text-primary font-semibold">
                          IR
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <CardContent className="border-t border-border pt-4 pb-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Ask about investing, markets, or your portfolio..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => handleQuickAction(action.label)}
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Topic Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Popular Topics</CardTitle>
              <CardDescription>Quick access to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topicChips.map((topic, index) => {
                  const Icon = topic.icon;
                  return (
                    <Button
                      key={index}
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleQuickAction(`Teach me about ${topic.label}`)}
                    >
                      <Icon className="h-3 w-3" />
                      {topic.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Lessons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2"
              >
                Understanding P/E Ratio
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2"
              >
                Diversification Strategy
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2"
              >
                Market vs Limit Orders
              </Button>
            </CardContent>
          </Card>

          {/* Safety Notice */}
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Educational Only</p>
                  <p className="text-xs text-muted-foreground">
                    This AI tutor provides educational content, not investment advice. Always do your own research.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Tutor;

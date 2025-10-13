import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Globe, PieChart } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type TutorDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TutorDrawer({ open, onOpenChange }: TutorDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI investing tutor. Ask me anything about investing or your portfolio!",
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: "Explain Like I'm 15", icon: Sparkles },
    { label: "Use Hinglish", icon: Globe },
    { label: "Analyze My Portfolio", icon: PieChart },
  ];

  // Auto-focus input when drawer opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      { role: "user", content: input },
      {
        role: "assistant",
        content: "That's a great question! Let me explain that in simple terms...",
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl flex flex-col p-0"
        aria-label="AI Tutor Chat"
      >
        <SheetHeader className="border-b border-border p-6 pb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              aria-hidden="true"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle>AI Tutor</SheetTitle>
              <SheetDescription>Educational investing assistant</SheetDescription>
            </div>
          </div>
          
          {/* Quick Action Chips in Header */}
          <div className="flex flex-wrap gap-2 mt-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8"
                  onClick={() => handleQuickAction(action.label)}
                  aria-label={action.label}
                >
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  {action.label}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="border-primary/50 text-primary text-xs">
              Educational Only
            </Badge>
            <Badge variant="outline" className="text-xs" title="Educational simulator only. Not financial advice.">
              Educational Only
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="bg-gradient-to-br from-primary/20 to-secondary/20" aria-hidden="true">
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
                    role="article"
                    aria-label={`${message.role === "user" ? "You" : "AI Tutor"}: ${message.content}`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="bg-primary/10" aria-hidden="true">
                      <AvatarFallback className="text-primary font-semibold">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <Input
                ref={inputRef}
                placeholder="Ask about investing, markets, or your portfolio..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Message input"
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

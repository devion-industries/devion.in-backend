import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Store,
  Briefcase,
  BookOpen,
  ClipboardCheck,
  Award,
  Trophy,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveIndicator } from "@/components/LiveIndicator";
import { TutorDrawer } from "@/components/TutorDrawer";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Market", href: "/market", icon: Store },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Learn", href: "/learn", icon: BookOpen },
  { name: "Quiz", href: "/quiz", icon: ClipboardCheck },
  { name: "Badges", href: "/badges", icon: Award },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [tutorOpen, setTutorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-border bg-muted/30 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Link to="/" className="cursor-pointer">
            <img 
              src="/Custom Logo Design (2).png" 
              alt="Devion" 
              className="h-8 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Educational simulator only.</p>
            <p>Not financial advice.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <Link to="/" className="cursor-pointer">
                  <img 
                    src="/Custom Logo Design (2).png" 
                    alt="Devion" 
                    className="h-6 w-auto hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>
              <h2 className="text-lg font-semibold">
                {navigation.find(item => item.href === location.pathname)?.name || "Dashboard"}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <LiveIndicator />
              <Button size="sm" className="gap-2" onClick={() => setTutorOpen(true)}>
                <Sparkles className="h-4 w-4" />
                AI Tutor
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      <TutorDrawer open={tutorOpen} onOpenChange={setTutorOpen} />
    </div>
  );
};

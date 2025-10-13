import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { 
  Brain, 
  TrendingUp, 
  GamepadIcon, 
  PieChart, 
  Sparkles, 
  Shield, 
  Award,
  Users,
  BookOpen,
  Target,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  BarChart3,
  Zap,
  GraduationCap,
  Globe,
  MessageCircle,
  Building2,
  Send,
  Mail,
  TrendingDown,
  LineChart,
  LayoutDashboard,
  Heart
} from "lucide-react";

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, prefix = "", suffix = "" }: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string; 
}) => {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      {inView ? (
        <CountUp end={end} duration={duration} prefix={prefix} suffix={suffix} />
      ) : (
        <span>{prefix}0{suffix}</span>
      )}
    </div>
  );
};

// Interactive AI Tutor Component
const InteractiveAITutor = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  
  const questions = [
    {
      question: "What is diversification?",
      answer: "Great question! Think of it like not putting all your eggs in one basket. When you diversify your portfolio, you spread your money across different types of stocks..."
    },
    {
      question: "How do I start investing?",
      answer: "Perfect timing to ask! Start by learning the basics here on Devion. Practice with virtual money, understand risk and return, then gradually build confidence..."
    },
    {
      question: "What's the difference between stocks and bonds?",
      answer: "Excellent question! Stocks represent ownership in companies, while bonds are like loans you give to companies or governments. Let me explain with examples..."
    }
  ];

  const handleQuestionClick = (index: number) => {
    setCurrentQuestion(index);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleUserQuestion = () => {
    if (userInput.trim()) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        toast.success("Great question! In the full platform, our AI tutor would provide a personalized answer.");
      }, 2000);
      setUserInput("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">AI Tutor Conversation</h3>
          <p className="text-sm text-muted-foreground">Click questions or ask your own!</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <motion.div 
          className="bg-primary/5 rounded-2xl p-4 cursor-pointer hover:bg-primary/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuestionClick(currentQuestion)}
        >
          <p className="text-sm">
            <span className="font-medium">Student:</span> "{questions[currentQuestion].question}"
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-secondary/5 rounded-2xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentQuestion}
        >
          <p className="text-sm">
            <span className="font-medium text-secondary">AI Tutor:</span> {
              isTyping ? (
                <span className="inline-flex items-center gap-1">
                  <span className="animate-pulse">Typing</span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >...</motion.span>
                </span>
              ) : (
                questions[currentQuestion].answer
              )
            }
          </p>
        </motion.div>
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Ask your own question..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUserQuestion()}
          className="text-sm"
        />
        <Button size="sm" onClick={handleUserQuestion} disabled={!userInput.trim()}>
          Ask
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {questions.map((_, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuestionClick(index)}
            className={`text-xs ${currentQuestion === index ? 'bg-primary/10' : ''}`}
          >
            Q{index + 1}
          </Button>
        ))}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        Available in English & Hinglish
      </div>
    </div>
  );
};

// Live Activity Feed Component
const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([
    { id: 1, text: "Aarav just completed 'Understanding Risk & Return'", time: "2m ago", type: "lesson" },
    { id: 2, text: "Priya earned the 'Diversification Master' badge", time: "5m ago", type: "badge" },
    { id: 3, text: "Ravi made his first virtual trade (₹2,500)", time: "8m ago", type: "trade" },
  ]);

  useEffect(() => {
    const newActivities = [
      "Sarah completed a quiz with 95% score",
      "Arjun unlocked the 'Market Maven' achievement",
      "Anita simulated buying 10 shares of TCS",
      "Vikram finished the 'Basics of Investing' module",
      "Kavya earned 500 learning points",
      "Rohit asked the AI tutor about mutual funds",
    ];

    const interval = setInterval(() => {
      const randomActivity = newActivities[Math.floor(Math.random() * newActivities.length)];
      const newActivity = {
        id: Date.now(),
        text: randomActivity,
        time: "now",
        type: ["lesson", "badge", "trade"][Math.floor(Math.random() * 3)]
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "lesson": return <BookOpen className="h-3 w-3" />;
      case "badge": return <Award className="h-3 w-3" />;
      case "trade": return <TrendingUp className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "lesson": return "text-primary";
      case "badge": return "text-yellow-500";
      case "trade": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        Demo Activity Feed
      </h4>
      <div className="space-y-2 max-h-32 overflow-hidden">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 text-xs p-2 bg-muted/30 rounded-lg"
          >
            <div className={`mt-0.5 ${getColor(activity.type)}`}>
              {getIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-foreground">{activity.text}</p>
              <p className="text-muted-foreground text-xs">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Mini Quiz Component
const MiniQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "What does diversification mean in investing?",
      options: [
        "Putting all money in one stock",
        "Spreading investments across different assets",
        "Only buying expensive stocks",
        "Investing only in technology companies"
      ],
      correct: 1
    },
    {
      question: "What is the main benefit of starting to invest early?",
      options: [
        "You can take bigger risks",
        "Compound interest has more time to work",
        "You need less money to start",
        "You can predict the market better"
      ],
      correct: 1
    },
    {
      question: "What should you do before making any investment?",
      options: [
        "Follow social media tips",
        "Research and understand the investment",
        "Invest all your savings",
        "Copy what others are doing"
      ],
      correct: 1
    }
  ];

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        toast.success(`Quiz complete! You scored ${score + (answerIndex === questions[currentQuestion].correct ? 1 : 0)}/${questions.length}`);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (currentQuestion >= questions.length) {
    return (
      <motion.div 
        className="text-center space-y-4 p-6 bg-success/5 rounded-2xl border border-success/20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h3 className="font-semibold">Quiz Complete!</h3>
        <p className="text-sm text-muted-foreground">
          You scored {score}/{questions.length}! Ready to learn more on the full platform?
        </p>
        <Button onClick={resetQuiz} size="sm">Try Again</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Quick Finance Quiz</h4>
        <Badge variant="secondary">{currentQuestion + 1}/{questions.length}</Badge>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm font-medium">{questions[currentQuestion].question}</p>
        
        <div className="space-y-2">
          {questions[currentQuestion].options.map((option, index) => (
            <motion.button
              key={index}
              className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                showResult
                  ? index === questions[currentQuestion].correct
                    ? 'bg-success/10 border-success text-success'
                    : index === selectedAnswer && index !== questions[currentQuestion].correct
                    ? 'bg-destructive/10 border-destructive text-destructive'
                    : 'bg-muted/30 border-border'
                  : selectedAnswer === index
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted/30 border-border hover:bg-muted/50'
              }`}
              onClick={() => !showResult && handleAnswer(index)}
              disabled={showResult}
              whileHover={{ scale: showResult ? 1 : 1.02 }}
              whileTap={{ scale: showResult ? 1 : 0.98 }}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const response = await fetch('https://formspree.io/f/mjkaoonv', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setIsSubmitting(false);
        setIsSubmitted(true);
        toast.success("Thank you for your interest! We'll get back to you within 24 hours.");
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: "",
            email: "",
            organization: "",
            message: ""
          });
        }, 3000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Sorry, there was an error sending your message. Please try again.");
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.name && formData.email && formData.message;

  if (isSubmitted) {
    return (
      <Card className="max-w-md w-full mx-auto text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <CardTitle className="text-2xl">Message Sent!</CardTitle>
          <CardDescription>
            We've received your inquiry and will respond within 24 hours.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          Get in Touch
        </CardTitle>
        <CardDescription>
          Fill out the form below and we'll get back to you within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={(e) => handleInputChange("organization", e.target.value)}
              placeholder="Your school, company, or institution"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Tell us about your interest in Devion, your organization, and how we can help you..."
              rows={6}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            * Required fields. We respect your privacy and will never share your information.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

const Index = () => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="cursor-pointer">
                <img 
                  src="/Custom Logo Design (2).png" 
                  alt="Devion" 
                  className="h-7 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
            
            {/* Center Navigation Menu */}
            <div className="hidden lg:flex items-center gap-1">
              <a 
                href="#features" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Features
              </a>
              <a 
                href="#learn" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                How It Works
              </a>
              <a 
                href="#for-parents" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                For Parents
              </a>
              <a 
                href="#vision" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Vision
              </a>
              <a 
                href="#contact" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Contact
              </a>
            </div>
            
            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  className="hidden md:inline-flex text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  className="text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-teal-950/20" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
        
        <div className="relative container mx-auto px-6 py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Demo Badge */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium">Demo Live at Global Fintech Fest</span>
            </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block mb-2">Transforming teens into</span>
              <span className="block text-primary mb-2">confident investors</span>
              <span className="block bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent text-3xl md:text-5xl lg:text-6xl">
                through AI-driven education
              </span>
            </motion.h1>

            {/* Subheadline */}
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
                We blend real market simulation with engaging lessons to democratize financial literacy for India's youth.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed">
                Learn finance through engaging lessons, practice with ₹10K virtual portfolios, and master investing risk‑free.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
              <div className="flex flex-col items-center">
              <Link to="/signup">
                  <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transition-all mb-2">
                    Start Learning
                    <BookOpen className="ml-2 h-5 w-5" />
                </Button>
              </Link>
                <p className="text-sm text-muted-foreground/70 text-center max-w-[200px]">
                  Discover interactive lessons and quizzes
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-4 border-2 hover:bg-primary/5 mb-2"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Play className="mr-2 h-5 w-5" />
                  View Live Demo
                </Button>
                <p className="text-sm text-muted-foreground/70 text-center max-w-[200px]">
                  Explore the paper trading simulator and AI tutor
                </p>
              </div>
            </div>

            {/* Highlighted Benefits Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12">
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-success/30 transition-colors">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <span className="text-sm font-medium text-center">100% Safe & Educational</span>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-center">Real NSE Market Simulation</span>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-secondary/30 transition-colors">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-secondary" />
                </div>
                <span className="text-sm font-medium text-center">AI-Powered Learning</span>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-yellow-500/30 transition-colors">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <GamepadIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <span className="text-sm font-medium text-center">Gamified Progress</span>
              </div>
            </div>

            {/* Demo Status Notice */}
            <div className="max-w-2xl mx-auto pt-8">
              <p className="text-sm text-muted-foreground/60 leading-relaxed text-center">
                This is a demonstration of Devion's upcoming platform — our full product is currently in production.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary/60 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute top-10 left-10 w-20 h-20 bg-primary/30 rounded-full blur-xl"
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-32 right-20 w-16 h-16 bg-secondary/30 rounded-full blur-xl"
            animate={{ 
              y: [0, 20, 0],
              x: [0, -10, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-500/30 rounded-full blur-xl"
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master financial literacy in three simple steps — guided by AI, secured by education.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -5, 5, 0],
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                  }}
                >
                  <Brain className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div 
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-4 border-background"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-sm font-bold text-primary">1</span>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold">Learn with AI Tutor</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our AI tutor explains finance concepts in simple terms, adapts to your learning pace, and answers questions 24/7.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -5, 5, 0],
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                  }}
                >
                  <TrendingUp className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div 
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-4 border-background"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <span className="text-sm font-bold text-secondary">2</span>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold">Simulate Trades</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Practice with ₹10K virtual portfolio using real NSE data. Make mistakes safely and learn from every decision.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -5, 5, 0],
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                  }}
                >
                  <Target className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div 
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-4 border-background"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <span className="text-sm font-bold text-yellow-600">3</span>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold">Grow with Insights</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Track progress with personalized reports, earn badges, and build confidence for real-world investing.
              </p>
            </motion.div>
          </div>

          {/* Animated Connect arrows for desktop */}
          <motion.div 
            className="hidden md:flex justify-center items-center mt-8 space-x-32"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="learn" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">What is Devion?</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Devion bridges the gap between finance and education by making investing concepts 
                  <span className="text-foreground font-semibold"> easy, interactive, and risk-free.</span>
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Students learn by doing — through virtual portfolios, adaptive quizzes, and an AI tutor 
                  that explains every concept in simple terms, just like a real teacher.
                </p>
              </div>
              
              {/* Impact Metrics with animations */}
              <motion.div 
                className="grid grid-cols-2 gap-6 pt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl font-bold text-primary">AI-Powered</div>
                  <div className="text-sm text-muted-foreground">Personalized learning experience</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 bg-secondary/5 rounded-2xl border border-secondary/20 hover:bg-secondary/10 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl font-bold text-secondary">Demo</div>
                  <div className="text-sm text-muted-foreground">Educational simulation platform</div>
                </motion.div>
              </motion.div>

              {/* Platform Vision */}
              <div className="space-y-4 pt-6">
                <h4 className="font-semibold text-foreground">Our Vision:</h4>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-primary">
                    <p className="text-sm italic">"Making financial concepts as easy to understand as everyday conversations"</p>
                    <footer className="text-xs text-muted-foreground mt-2">— Educational Philosophy</footer>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-secondary">
                    <p className="text-sm italic">"Combining the safety of simulation with the excitement of real market learning"</p>
                    <footer className="text-xs text-muted-foreground mt-2">— Demo Concept</footer>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm">Zero Financial Risk</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm">Real Market Prices</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm">Adaptive AI Tutoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm">Gamified Experience</span>
                </div>
              </div>
            </div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-shadow">
                <InteractiveAITutor />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Parents Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-mint-50 to-green-50 dark:from-blue-950/20 dark:via-green-950/20 dark:to-mint-950/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Before they invest, let them learn.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Financial literacy is a lifelong skill — and it starts with understanding, not risk. 
                Devion gives students a ₹10,000 virtual portfolio powered by real NSE data, so they can 
                learn how markets work without any financial exposure.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Our AI tutor teaches age-appropriate lessons, simplifies complex ideas, and helps 
                    students build the right foundation before they ever trade for real.
                  </p>
            </div>

            {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/70 dark:bg-white/10 rounded-2xl border border-success/20">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-success" />
              </div>
                    <div className="text-sm font-medium">100% Educational</div>
              </div>
                  
                  <div className="text-center p-4 bg-white/70 dark:bg-white/10 rounded-2xl border border-primary/20">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-primary" />
              </div>
                    <div className="text-sm font-medium">Safe Simulation</div>
            </div>
                  
                  <div className="text-center p-4 bg-white/70 dark:bg-white/10 rounded-2xl border border-secondary/20">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="h-6 w-6 text-secondary" />
          </div>
                    <div className="text-sm font-medium">Guided by AI</div>
        </div>
      </div>

                {/* Parent Features */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-xl">
                    <div className="w-8 h-8 bg-heart/10 rounded-full flex items-center justify-center mt-1">
                      <Heart className="h-4 w-4 text-pink-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Peace of Mind for Parents</h4>
                      <p className="text-sm text-muted-foreground">Monitor progress, see what they're learning, and know they're building skills safely.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-xl">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Age-Appropriate Learning</h4>
                      <p className="text-sm text-muted-foreground">Concepts explained in simple terms, designed for young minds to understand and apply.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    {/* Parent-Student Illustration */}
                    <motion.div 
                      className="flex items-center justify-center gap-4 p-6 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-2xl"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <motion.div 
                        className="text-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-sm font-medium">Parent & Student</div>
                        <div className="text-xs text-muted-foreground">Learning Together</div>
                      </motion.div>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      </motion.div>
                      <motion.div 
                        className="text-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Shield className="h-8 w-8 text-success" />
                        </div>
                        <div className="text-sm font-medium">Safe Learning</div>
                        <div className="text-xs text-muted-foreground">Zero Risk</div>
                      </motion.div>
                    </motion.div>
                    
                    {/* Live Activity Feed */}
                    <LiveActivityFeed />
                    
                    {/* Mini Quiz Preview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <MiniQuiz />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">AI-Powered Learning Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From classroom to capital markets — powered by AI, secured by education.
            </p>
      </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
              icon={<Brain className="h-8 w-8" />}
            title="AI Tutor"
              description="Adaptive AI tutor that explains financial concepts in English or Hinglish, personalizing lessons to each student's learning pace."
              color="from-blue-500 to-indigo-500"
          />
          <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="AI-Guided Trading"
              description="Practice with ₹10,000 virtual portfolio using real NSE data. AI provides insights and explains market movements in real-time."
              color="from-green-500 to-emerald-500"
          />
          <FeatureCard
              icon={<GamepadIcon className="h-8 w-8" />}
              title="AI-Generated Quizzes"
              description="Dynamic, AI-created challenges that adapt to your progress. Earn badges and compete with classmates in personalized learning paths."
              color="from-purple-500 to-pink-500"
          />
          <FeatureCard
              icon={<PieChart className="h-8 w-8" />}
              title="AI Portfolio Insights"
              description="Intelligent analysis of your virtual portfolio. AI explains diversification, risk metrics, and investment patterns in simple terms."
              color="from-orange-500 to-red-500"
          />
        </div>
      </div>
      </section>

      {/* Future Vision Section */}
      <section id="vision" className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The Future of Learning Finance</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering financial literacy, one student at a time. In an age of AI and fintech, 
              financial literacy is a life skill. Devion uses real data, adaptive learning, 
              and gamification to help young learners build lasting financial confidence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Phase 1 - Foundation</h3>
              <p className="text-muted-foreground mb-4">AI Tutor + Paper Trading</p>
              <Badge variant="secondary">Current Demo</Badge>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                <span className="text-2xl font-bold text-secondary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Phase 2 - Engagement</h3>
              <p className="text-muted-foreground mb-4">Gamification + Leaderboards + Adaptive Quizzes</p>
              <Badge variant="outline">In Development</Badge>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <span className="text-2xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Phase 3 - Scale</h3>
              <p className="text-muted-foreground mb-4">Voice Tutor + Regional Languages + Teacher Dashboards</p>
              <Badge variant="outline">Future Vision</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Product Preview</h2>
            <p className="text-xl text-muted-foreground">
              Real prices. Real lessons. Zero risk.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PreviewCard
              title="Dynamic Dashboard"
              description="Track your portfolio performance against NIFTY 50 with AI-powered insights and volatility analysis."
              icon={<LayoutDashboard className="h-8 w-8" />}
              badge="Live Demo"
              caption="Real-time portfolio tracking with market benchmarking"
            />
            <PreviewCard
              title="Interactive Area Charts"
              description="Modern area charts showing price movements with detailed tooltips, timeframe selection, and volume data."
              icon={<LineChart className="h-8 w-8" />}
              badge="Enhanced"
              caption="Replaced candlestick charts with intuitive area visualization"
            />
            <PreviewCard
              title="AI Tutor Chat"
              description="Get instant help and explanations from your personal AI investing coach available on every page."
              icon={<Brain className="h-8 w-8" />}
              badge="AI Powered"
              caption="Conversational learning with context-aware responses"
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why It Matters</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ImpactCard
              icon={<GraduationCap className="h-8 w-8" />}
              title="Essential Life Skill"
              description="Financial literacy is now essential for the next generation's success."
            />
            <ImpactCard
              icon={<Target className="h-8 w-8" />}
              title="Learning by Doing"
              description="Hands-on experience increases retention by 75% compared to traditional methods."
            />
            <ImpactCard
              icon={<Users className="h-8 w-8" />}
              title="Tested & Proven"
              description="Over 100+ students have successfully tested our AI learning modules."
            />
            <ImpactCard
              icon={<Star className="h-8 w-8" />}
              title="Future Ready"
              description="Preparing students for a world where financial decisions define success."
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold">Get in Touch</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ready to transform financial education? Let's discuss partnerships, investments, or how Devion can help your organization.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Info Cards */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Partnerships</CardTitle>
                        <CardDescription>Schools, colleges & institutions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Investment</CardTitle>
                        <CardDescription>VC funds & angel investors</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">General Inquiries</CardTitle>
                        <CardDescription>Questions about our platform</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Demo Available</CardTitle>
                    </div>
                    <CardDescription>
                      Experience our AI-powered financial literacy platform live at the Global Fintech Fest.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <ContactForm />
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-8 mt-16 pt-16 border-t border-border">
              <h3 className="text-2xl font-bold">Ready to revolutionize financial education?</h3>
              <p className="text-muted-foreground">
                Join us in making financial literacy accessible to every student in India through AI-powered learning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-secondary">
                    Try Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link to="/" className="cursor-pointer">
                  <img 
                    src="/Custom Logo Design (2).png" 
                    alt="Devion" 
                    className="h-8 w-auto hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                India's first AI-powered financial literacy platform for students.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/market" className="hover:text-foreground transition-colors">Market</Link></li>
                <li><Link to="/portfolio" className="hover:text-foreground transition-colors">Portfolio</Link></li>
                <li><Link to="/learn" className="hover:text-foreground transition-colors">Learn</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
        </div>
      </div>

          <div className="border-t border-border mt-12 pt-8">
            <div className="bg-accent/10 rounded-2xl p-6 mb-6">
          <p className="text-center text-sm text-muted-foreground">
                <strong>Demo Notice:</strong> This is a demonstration of the Devion platform. 
                The final product is currently in production. View this as a glimpse into the future 
                of financial learning.
          </p>
            </div>
          <p className="text-center text-sm text-muted-foreground">
              © 2024 Devion. All rights reserved. Educational simulator only. Not financial advice.
          </p>
          </div>
        </div>
      </footer>

      {/* Demo Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-8 max-w-2xl w-full relative">
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
            >
              ×
            </button>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto">
                <Play className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Experience the Future</h3>
              <p className="text-muted-foreground">
                Experience how AI and fintech redefine financial education. 
                See real market data, interactive charts, and personalized learning in action.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
                  Open Demo Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const FeatureCard = ({ 
  icon, 
  title, 
  description,
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="relative group hover:shadow-2xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity`} />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {isHovered && (
            <>
              <motion.div
                className="absolute w-2 h-2 bg-primary/30 rounded-full"
                initial={{ x: 10, y: 10, opacity: 0 }}
                animate={{ 
                  x: [10, 50, 90], 
                  y: [10, 30, 50], 
                  opacity: [0, 1, 0] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute w-1.5 h-1.5 bg-secondary/40 rounded-full"
                initial={{ x: 80, y: 20, opacity: 0 }}
                animate={{ 
                  x: [80, 40, 20], 
                  y: [20, 60, 80], 
                  opacity: [0, 1, 0] 
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </div>

        <CardHeader className="pb-4 relative z-10">
          <motion.div 
            className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white mb-4`}
            whileHover={{ 
              scale: 1.1, 
              rotate: [0, -10, 10, 0],
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <CardDescription className="text-base leading-relaxed group-hover:text-foreground/80 transition-colors">
            {description}
          </CardDescription>
          
          {/* Interactive demo hints */}
          <motion.div 
            className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ height: 0 }}
            whileHover={{ height: "auto" }}
          >
            <div className="text-xs text-primary font-medium flex items-center gap-1">
              <Play className="h-3 w-3" />
              Click to explore in demo
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PreviewCard = ({ 
  title, 
  description, 
  icon, 
  badge,
  caption 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  badge: string;
  caption: string;
}) => (
  <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden">
    <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-4 right-4">
        <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
          {badge}
        </Badge>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-card/90 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
          <div className="text-primary">
            {icon}
          </div>
        </div>
      </div>
    </div>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription className="mb-3">{description}</CardDescription>
      <div className="text-xs text-muted-foreground italic border-t pt-3">
        {caption}
      </div>
    </CardHeader>
  </Card>
);

const ImpactCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="text-center group">
    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors group-hover:scale-110 transform duration-300">
      <div className="text-primary">
        {icon}
      </div>
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

export default Index;
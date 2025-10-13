import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Zap, TrendingUp, CheckCircle2, XCircle, ArrowRight, BookOpen, Calendar, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  const quizLibrary = [
    { id: 1, topic: "Valuation Basics", questions: 10, bestScore: 90, difficulty: "beginner", lessonId: 2 },
    { id: 2, topic: "Diversification", questions: 8, bestScore: 75, difficulty: "intermediate", lessonId: 3 },
    { id: 3, topic: "Trading Orders", questions: 6, bestScore: 100, difficulty: "beginner", lessonId: 5 },
    { id: 4, topic: "Balance Sheets", questions: 12, bestScore: null, difficulty: "intermediate", lessonId: 4 },
    { id: 5, topic: "Compounding", questions: 7, bestScore: null, difficulty: "intermediate", lessonId: 6 },
  ];

  const quizHistory = [
    { id: 1, topic: "Trading Orders", score: 100, questions: 6, date: "2025-01-02", streak: 7 },
    { id: 2, topic: "Diversification", score: 75, questions: 8, date: "2025-01-01", streak: 6 },
    { id: 3, topic: "Valuation Basics", score: 90, questions: 10, date: "2024-12-31", streak: 5 },
    { id: 4, topic: "Market Fundamentals", score: 85, questions: 12, date: "2024-12-30", streak: 4 },
  ];

  const questions = [
    {
      id: 1,
      question: "What does P/E ratio stand for?",
      options: [
        "Price to Equity",
        "Price to Earnings",
        "Profit to Equity",
        "Profit to Earnings",
      ],
      correct: 1,
      explanation: "P/E ratio stands for Price-to-Earnings ratio. It compares a company's stock price to its earnings per share.",
    },
    {
      id: 2,
      question: "Which of these is NOT a benefit of diversification?",
      options: [
        "Reduces overall portfolio risk",
        "Guarantees higher returns",
        "Spreads investment across sectors",
        "Protects against single-stock volatility",
      ],
      correct: 1,
      explanation: "Diversification reduces risk but doesn't guarantee higher returns. It's about managing risk, not maximizing gains.",
    },
    {
      id: 3,
      question: "What is a limit order?",
      options: [
        "An order that executes immediately at market price",
        "An order that executes only at a specified price or better",
        "An order that limits the number of shares you can buy",
        "An order that expires after one trading session",
      ],
      correct: 1,
      explanation: "A limit order only executes when the stock reaches your specified price or better, giving you price control.",
    },
  ];

  const handleAnswer = () => {
    setShowFeedback(true);
    if (Number(selectedAnswer) === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setShowFeedback(false);
    } else {
      setQuizComplete(true);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isCorrect = Number(selectedAnswer) === questions[currentQuestion]?.correct;

  if (!quizStarted && !selectedQuizId) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Knowledge Check</h1>
            <p className="text-muted-foreground">
              Test your investing knowledge with topic-specific quizzes
            </p>
          </div>

          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="library">Quiz Library</TabsTrigger>
              <TabsTrigger value="history">Quiz History</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-4 mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {quizLibrary.map((quiz) => (
                  <Card key={quiz.id} className="card-interactive">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={
                            quiz.difficulty === "beginner" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          }>
                            {quiz.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{quiz.topic}</CardTitle>
                      <CardDescription>
                        {quiz.questions} questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {quiz.bestScore !== null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Best Score</span>
                          <Badge variant="secondary" className="gap-1">
                            <Trophy className="h-3 w-3" />
                            {quiz.bestScore}%
                          </Badge>
                        </div>
                      )}
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedQuizId(quiz.id);
                          setQuizStarted(true);
                        }}
                      >
                        {quiz.bestScore !== null ? "Retake Quiz" : "Start Quiz"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Quiz Attempts</CardTitle>
                  <CardDescription>Track your progress and streaks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quizHistory.map((attempt) => (
                      <div 
                        key={attempt.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{attempt.topic}</div>
                          <Badge variant={attempt.score >= 70 ? "default" : "secondary"}>
                            {attempt.score}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(attempt.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-warning" />
                              {attempt.streak} day streak
                            </span>
                          </div>
                          <span>{attempt.score} / {attempt.questions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className={`border-2 ${isPassing ? "border-success/20 bg-gradient-to-br from-card to-success/5" : "border-warning/20 bg-gradient-to-br from-card to-warning/5"}`}>
            <CardHeader className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${
                isPassing ? "bg-success/10" : "bg-warning/10"
              }`}>
                {isPassing ? (
                  <TrendingUp className="h-8 w-8 text-success" />
                ) : (
                  <Target className="h-8 w-8 text-warning" />
                )}
              </div>
              <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
              <CardDescription>
                {isPassing ? "Great job! Keep up the momentum." : "Good effort! Review and try again."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{percentage}%</div>
                <div className="text-muted-foreground">
                  {score} out of {questions.length} correct
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold">Performance Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Correct Answers</span>
                    <span className="font-medium text-success">{score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Incorrect Answers</span>
                    <span className="font-medium text-destructive">{questions.length - score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Streak Status</span>
                    <Badge variant="outline" className="border-success/50 text-success">
                      <Zap className="h-3 w-3 mr-1" />
                      8 days
                    </Badge>
                  </div>
                </div>
              </div>

              {!isPassing && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Recommended Next Steps
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Review the "Understanding P/E Ratio" lesson to strengthen your valuation knowledge.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/learn")}
                  >
                    Go to Lesson
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setQuizStarted(false);
                    setQuizComplete(false);
                    setCurrentQuestion(0);
                    setScore(0);
                    setSelectedAnswer("");
                    setShowFeedback(false);
                    setSelectedQuizId(null);
                  }}
                >
                  Back to Library
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    setQuizComplete(false);
                    setCurrentQuestion(0);
                    setScore(0);
                    setSelectedAnswer("");
                    setShowFeedback(false);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-warning/50 text-warning">
                  <Zap className="h-3 w-3 mr-1" />
                  7 day streak
                </Badge>
                <Badge variant="outline">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
              </div>
              <div className="text-sm font-medium">
                Score: {score}/{currentQuestion}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{questions[currentQuestion].question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showFeedback}>
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                      showFeedback
                        ? index === questions[currentQuestion].correct
                          ? "border-success bg-success/5"
                          : Number(selectedAnswer) === index
                          ? "border-destructive bg-destructive/5"
                          : "border-border"
                        : "border-border hover:border-primary/50 cursor-pointer"
                    }`}
                  >
                    <RadioGroupItem value={String(index)} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                    {showFeedback && index === questions[currentQuestion].correct && (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    )}
                    {showFeedback && Number(selectedAnswer) === index && index !== questions[currentQuestion].correct && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>

            {showFeedback && (
              <div className={`p-4 rounded-lg ${
                isCorrect ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"
              }`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold mb-1">
                      {isCorrect ? "Correct!" : "Not quite right"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {questions[currentQuestion].explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!showFeedback ? (
                <Button
                  onClick={handleAnswer}
                  disabled={!selectedAnswer}
                  className="w-full"
                  size="lg"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="w-full" size="lg">
                  {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Quiz;

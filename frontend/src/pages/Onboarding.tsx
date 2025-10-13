import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Shield } from "lucide-react";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    alias: "",
    parentEmail: "",
    consent: false,
    ageBand: "",
    grade: "",
    experience: "",
    language: "en",
    accessibility: false,
  });

  const handleNext = () => {
    if (step === 1 && (!formData.alias || !formData.consent)) {
      toast.error("Please enter an alias and accept the terms");
      return;
    }
    if (step === 2 && (!formData.ageBand || !formData.grade || !formData.experience)) {
      toast.error("Please complete all profile fields");
      return;
    }
    if (step === 3) {
      toast.success("Welcome to Devion! Let's start learning.");
      navigate("/dashboard");
      return;
    }
    setStep(step + 1);
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Devion</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Let's Get Started</h1>
          <p className="text-muted-foreground">Set up your learning profile in 3 simple steps</p>
        </div>

        {/* Progress */}
        <Progress value={progress} className="mb-8" />

        {/* Step Content */}
        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Your Identity</CardTitle>
                <CardDescription>Choose how you'd like to be known on Devion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias (Display Name) *</Label>
                  <Input
                    id="alias"
                    placeholder="e.g., InvestorRaj"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    This is how you'll appear on leaderboards
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Parent/Guardian Email (Optional)</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="parent@example.com"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  />
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, consent: checked as boolean })
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent" className="cursor-pointer">
                      I understand this is an educational simulator *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      All trades are simulated. No real money is involved. Educational simulator only. Not financial advice.
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Help us personalize your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Age Group *</Label>
                  <RadioGroup
                    value={formData.ageBand}
                    onValueChange={(value) => setFormData({ ...formData, ageBand: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10-12" id="age1" />
                      <Label htmlFor="age1" className="cursor-pointer">10-12 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="13-15" id="age2" />
                      <Label htmlFor="age2" className="cursor-pointer">13-15 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="16-17" id="age3" />
                      <Label htmlFor="age3" className="cursor-pointer">16-17 years</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/Class *</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="Select your grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <SelectItem key={grade} value={String(grade)}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Investing Experience *</Label>
                  <RadioGroup
                    value={formData.experience}
                    onValueChange={(value) => setFormData({ ...formData, experience: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="exp1" />
                      <Label htmlFor="exp1" className="cursor-pointer">Beginner - Just starting out</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="exp2" />
                      <Label htmlFor="exp2" className="cursor-pointer">Intermediate - Know the basics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="exp3" />
                      <Label htmlFor="exp3" className="cursor-pointer">Advanced - Ready for complex concepts</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your learning environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hinglish">Hinglish</SelectItem>
                      <SelectItem value="hi">Hindi (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="accessibility"
                    checked={formData.accessibility}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, accessibility: checked as boolean })
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="accessibility" className="cursor-pointer">
                      Enable accessibility features
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enhanced contrast, larger text, and reduced motion
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Your Privacy Matters</p>
                    <p className="text-sm text-muted-foreground">
                      We only show your alias publicly. Your personal data stays private and secure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          <CardContent className="pt-0">
            <div className="flex gap-3">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Back
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                {step === 3 ? "Complete Setup" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Step {step} of 3 • About {60 - (step * 15)}s remaining
        </p>
      </div>
    </div>
  );
};

export default Onboarding;

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export function OnboardingModal() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    alias: "",
    parentEmail: "",
    age: "",
    grade: "",
    experience: "",
    language: "en",
    consent: false,
  });

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("invested-onboarded");
    if (!hasOnboarded) {
      setOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem("invested-onboarded", "true");
    localStorage.setItem("invested-user", JSON.stringify(formData));
    setOpen(false);
    navigate("/dashboard");
  };

  const canProceedStep1 = formData.alias.trim() && formData.consent;
  const canProceedStep2 = formData.age && formData.grade && formData.experience;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Welcome to Devion! 🎯</DialogTitle>
          <DialogDescription>
            Let's set up your profile to personalize your learning experience
          </DialogDescription>
        </DialogHeader>

        <Progress value={(step / 3) * 100} className="mb-4" />

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alias">Choose your alias *</Label>
              <Input
                id="alias"
                placeholder="e.g., StockStar123"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                This will be visible on leaderboards
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent's email (optional)</Label>
              <Input
                id="parentEmail"
                type="email"
                placeholder="parent@example.com"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
              />
              <label htmlFor="consent" className="text-sm leading-tight">
                I understand this is an educational simulator only. Not financial advice. *
              </label>
            </div>

            <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Age group *</Label>
              <RadioGroup value={formData.age} onValueChange={(value) => setFormData({ ...formData, age: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10-12" id="age1" />
                  <Label htmlFor="age1">10-12 years</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="13-15" id="age2" />
                  <Label htmlFor="age2">13-15 years</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="16-17" id="age3" />
                  <Label htmlFor="age3">16-17 years</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                    <SelectItem key={grade} value={String(grade)}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Experience level *</Label>
              <RadioGroup value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="exp1" />
                  <Label htmlFor="exp1">Beginner (new to investing)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="exp2" />
                  <Label htmlFor="exp2">Intermediate (some knowledge)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="exp3" />
                  <Label htmlFor="exp3">Advanced (experienced learner)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Preferred language *</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hinglish">Hinglish</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Privacy First 🔒</h4>
              <p className="text-xs text-muted-foreground">
                Your data stays private. We use your alias for leaderboards and never share personal information.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Get Started! 🚀
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

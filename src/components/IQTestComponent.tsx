import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, ArrowLeft, Check, X, Lightbulb } from "lucide-react";
import { TestResults } from "@/components/TestResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: number;
  type: "logical" | "numerical" | "verbal" | "spatial";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

// Questions will be loaded from AI
let ALL_QUESTIONS: Question[] = [];

interface IQTestComponentProps {
  onBack: () => void;
  user: any;
}

export const IQTestComponent = ({ onBack, user }: IQTestComponentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Load AI-generated questions on component mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const { data, error } = await supabase.functions.invoke('generate-iq-questions', {
        body: { count: 100 }
      });

      if (error) throw error;
      
      setQuestions(data.questions);
      ALL_QUESTIONS = data.questions; // Update global for compatibility
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error("Failed to load questions");
      // Fallback to a simple set of questions
      const fallbackQuestions: Question[] = [
        {
          id: 1,
          type: "logical",
          question: "If all birds can fly and penguins are birds, what can we conclude?",
          options: ["Penguins can fly", "The statement is false", "Birds don't fly", "Nothing"],
          correctAnswer: 1,
          explanation: "This shows a logical fallacy - the premise 'all birds can fly' is false.",
          difficulty: "medium"
        }
      ];
      setQuestions(fallbackQuestions);
      ALL_QUESTIONS = fallbackQuestions;
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleNext();
    }
  }, [timeLeft, isComplete]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer ?? -1;
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(45);
    } else {
      setIsComplete(true);
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    
    // Enhanced IQ score calculation for 100 questions
    const percentage = (correct / questions.length) * 100;
    return Math.round(70 + (percentage / 100) * 60); // Range: 70-130
  };

  if (showResults) {
    return (
      <TestResults
        score={calculateScore()}
        answers={answers}
        questions={questions}
        onBack={onBack}
        onRetake={() => {
          setCurrentQuestion(0);
          setAnswers([]);
          setSelectedAnswer(null);
          setTimeLeft(45);
          setIsComplete(false);
          setShowResults(false);
          loadQuestions(); // Reload fresh questions
        }}
      />
    );
  }

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const currentQ = questions[currentQuestion];

  // Show loading state while questions are being generated
  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Card className="border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Brain className="h-16 w-16 text-brain-primary animate-pulse mb-4" />
              <h2 className="text-2xl font-bold mb-2">Generating Your IQ Test</h2>
              <p className="text-muted-foreground mb-4">Our AI is creating personalized questions for you...</p>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brain-primary"></div>
                <span className="text-sm text-muted-foreground">Please wait...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if no questions loaded
  if (!loadingQuestions && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Card className="border-0 shadow-xl">
            <CardContent className="text-center py-16">
              <X className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Failed to Load Questions</h2>
              <p className="text-muted-foreground mb-6">
                There was an error generating your IQ test questions. Please try again.
              </p>
              <Button variant="brain" onClick={() => loadQuestions()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 self-start">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={timeLeft <= 10 ? "text-warning font-bold" : ""}>{timeLeft}s</span>
            </div>
            <div className="text-xs sm:text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar - Mobile Optimized */}
        <div className="mb-4 sm:mb-8">
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card - Mobile Optimized */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brain-primary text-white flex items-center justify-center text-xs sm:text-sm font-medium">
                {currentQuestion + 1}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium capitalize text-muted-foreground">
                  {currentQ.type} Reasoning
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  currentQ.difficulty === 'easy' ? 'bg-success/20 text-success' :
                  currentQ.difficulty === 'medium' ? 'bg-warning/20 text-warning' :
                  'bg-destructive/20 text-destructive'
                }`}>
                  {currentQ.difficulty}
                </span>
              </div>
            </div>
            <CardTitle className="text-lg sm:text-xl leading-relaxed">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'border-brain-primary bg-brain-primary/10 shadow-md'
                      : 'border-border bg-card hover:border-brain-primary/50 hover:bg-brain-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                      selectedAnswer === index
                        ? 'border-brain-primary bg-brain-primary text-white'
                        : 'border-muted-foreground/30'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm sm:text-base">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 sm:mt-8">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {ALL_QUESTIONS.length} comprehensive questions • AI-powered analysis
              </div>
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                variant="brain"
                size="lg"
                className="w-full sm:w-auto min-w-32"
              >
                {currentQuestion === ALL_QUESTIONS.length - 1 ? 'Finish Test' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timer Warning - Mobile Optimized */}
        {timeLeft <= 15 && (
          <div className="mt-4 p-3 sm:p-4 bg-warning/10 border border-warning/20 rounded-lg text-center">
            <p className="text-warning font-medium text-sm sm:text-base">
              ⚠️ Time running out! {timeLeft} seconds remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
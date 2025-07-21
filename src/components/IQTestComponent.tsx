import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, ArrowLeft, Check, X, Lightbulb } from "lucide-react";
import { TestResults } from "@/components/TestResults";

interface Question {
  id: number;
  type: "logical" | "numerical" | "verbal" | "spatial";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    type: "logical",
    question: "If all roses are flowers and some flowers are red, which statement must be true?",
    options: [
      "All roses are red",
      "Some roses might be red", 
      "No roses are red",
      "All red things are roses"
    ],
    correctAnswer: 1,
    explanation: "Since some flowers are red and all roses are flowers, it's possible that some roses could be red, but we cannot determine this with certainty.",
    difficulty: "medium"
  },
  {
    id: 2,
    type: "numerical",
    question: "What comes next in the sequence: 2, 6, 18, 54, ?",
    options: ["108", "162", "216", "324"],
    correctAnswer: 1,
    explanation: "Each number is multiplied by 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162",
    difficulty: "medium"
  },
  {
    id: 3,
    type: "verbal",
    question: "Which word is most similar in meaning to 'UBIQUITOUS'?",
    options: ["Rare", "Omnipresent", "Ancient", "Mysterious"],
    correctAnswer: 1,
    explanation: "Ubiquitous means existing or being everywhere at the same time, which is synonymous with omnipresent.",
    difficulty: "hard"
  },
  {
    id: 4,
    type: "spatial",
    question: "How many cubes are there in this 3D arrangement? (Imagine a 3×3×3 cube with the front-bottom-left cube removed)",
    options: ["25", "26", "27", "28"],
    correctAnswer: 1,
    explanation: "A 3×3×3 cube has 27 cubes total. Removing one cube leaves 26 cubes.",
    difficulty: "medium"
  },
  {
    id: 5,
    type: "logical",
    question: "All birds can fly. Penguins are birds. Therefore:",
    options: [
      "Penguins can fly",
      "The first statement is false",
      "Penguins are not birds", 
      "Flying is not necessary for birds"
    ],
    correctAnswer: 1,
    explanation: "This is a classic example of a false premise. Since we know penguins cannot fly, the first statement 'All birds can fly' must be false.",
    difficulty: "hard"
  }
];

interface IQTestComponentProps {
  onBack: () => void;
  user: any;
}

export const IQTestComponent = ({ onBack, user }: IQTestComponentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
    
    if (currentQuestion < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setIsComplete(true);
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === SAMPLE_QUESTIONS[index].correctAnswer) {
        correct++;
      }
    });
    
    // Calculate IQ score (simplified)
    const percentage = (correct / SAMPLE_QUESTIONS.length) * 100;
    return Math.round(85 + (percentage / 100) * 30); // Range: 85-115
  };

  if (showResults) {
    return (
      <TestResults
        score={calculateScore()}
        answers={answers}
        questions={SAMPLE_QUESTIONS}
        onBack={onBack}
        onRetake={() => {
          setCurrentQuestion(0);
          setAnswers([]);
          setSelectedAnswer(null);
          setTimeLeft(30);
          setIsComplete(false);
          setShowResults(false);
        }}
      />
    );
  }

  const progress = ((currentQuestion + 1) / SAMPLE_QUESTIONS.length) * 100;
  const currentQ = SAMPLE_QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {timeLeft}s
            </div>
            <div>
              Question {currentQuestion + 1} of {SAMPLE_QUESTIONS.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-brain-primary text-white flex items-center justify-center text-sm font-medium">
                {currentQuestion + 1}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize text-muted-foreground">
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
            <CardTitle className="text-xl leading-relaxed">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'border-brain-primary bg-brain-primary/10 shadow-md'
                      : 'border-border bg-card hover:border-brain-primary/50 hover:bg-brain-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      selectedAnswer === index
                        ? 'border-brain-primary bg-brain-primary text-white'
                        : 'border-muted-foreground/30'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                variant="brain"
                size="lg"
                className="min-w-32"
              >
                {currentQuestion === SAMPLE_QUESTIONS.length - 1 ? 'Finish Test' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timer Warning */}
        {timeLeft <= 10 && (
          <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg text-center">
            <p className="text-warning font-medium">⚠️ Time running out! {timeLeft} seconds remaining</p>
          </div>
        )}
      </div>
    </div>
  );
};
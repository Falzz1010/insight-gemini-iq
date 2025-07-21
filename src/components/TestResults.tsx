import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Lightbulb, RotateCcw, ArrowLeft, Check, X, Zap } from "lucide-react";
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

interface TestResultsProps {
  score: number;
  answers: number[];
  questions: Question[];
  onBack: () => void;
  onRetake: () => void;
}

export const TestResults = ({ score, answers, questions, onBack, onRetake }: TestResultsProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "detailed" | "ai">("overview");

  useEffect(() => {
    generateAIAnalysis();
  }, []);

  const generateAIAnalysis = async () => {
    try {
      // Calculate performance by category
      const categoryPerformance = calculateCategoryPerformance();
      const correctAnswers = answers.filter((answer, index) => answer === questions[index].correctAnswer).length;
      
      const analysisData = {
        score,
        totalQuestions: questions.length,
        correctAnswers,
        categoryPerformance,
        answers: answers.map((answer, index) => ({
          question: questions[index].question,
          userAnswer: answer,
          correctAnswer: questions[index].correctAnswer,
          isCorrect: answer === questions[index].correctAnswer,
          type: questions[index].type,
          difficulty: questions[index].difficulty
        }))
      };

      const { data, error } = await supabase.functions.invoke('analyze-iq-results', {
        body: analysisData
      });

      if (error) throw error;
      
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast.error("Failed to generate AI analysis");
      // Fallback analysis
      setAiAnalysis(generateFallbackAnalysis());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackAnalysis = () => {
    const correctAnswers = answers.filter((answer, index) => answer === questions[index].correctAnswer).length;
    const percentage = (correctAnswers / questions.length) * 100;
    
    let analysis = `Based on your IQ test results, you scored ${score}, which places you `;
    
    if (score >= 130) {
      analysis += "in the highly gifted range. This is an exceptional performance!";
    } else if (score >= 115) {
      analysis += "above average. You demonstrate strong cognitive abilities.";
    } else if (score >= 100) {
      analysis += "in the average range, which is perfectly normal.";
    } else {
      analysis += "below average, but remember that IQ tests are just one measure of intelligence.";
    }
    
    analysis += `\n\nYou answered ${correctAnswers} out of ${questions.length} questions correctly (${percentage.toFixed(1)}%). `;
    
    const categoryPerformance = calculateCategoryPerformance();
    const strongestCategory = Object.entries(categoryPerformance).reduce((a, b) => 
      categoryPerformance[a[0]] > categoryPerformance[b[0]] ? a : b
    );
    
    analysis += `Your strongest area appears to be ${strongestCategory[0]} reasoning. `;
    analysis += "Consider practicing more varied question types to improve your overall cognitive flexibility.";
    
    return analysis;
  };

  const calculateCategoryPerformance = () => {
    const categories = { logical: 0, numerical: 0, verbal: 0, spatial: 0 };
    const categoryTotals = { logical: 0, numerical: 0, verbal: 0, spatial: 0 };
    
    questions.forEach((question, index) => {
      categoryTotals[question.type]++;
      if (answers[index] === question.correctAnswer) {
        categories[question.type]++;
      }
    });
    
    Object.keys(categories).forEach(key => {
      const categoryKey = key as keyof typeof categories;
      categories[categoryKey] = categoryTotals[categoryKey] > 0 
        ? (categories[categoryKey] / categoryTotals[categoryKey]) * 100 
        : 0;
    });
    
    return categories;
  };

  const getScoreLevel = (score: number) => {
    if (score >= 130) return { label: "Highly Gifted", color: "bg-purple-500", description: "Top 2% of population" };
    if (score >= 115) return { label: "Above Average", color: "bg-blue-500", description: "Top 16% of population" };
    if (score >= 100) return { label: "Average", color: "bg-green-500", description: "Average range" };
    if (score >= 85) return { label: "Below Average", color: "bg-yellow-500", description: "Lower range" };
    return { label: "Well Below Average", color: "bg-red-500", description: "Needs improvement" };
  };

  const correctAnswers = answers.filter((answer, index) => answer === questions[index].correctAnswer).length;
  const categoryPerformance = calculateCategoryPerformance();
  const scoreLevel = getScoreLevel(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={onRetake} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retake Test
          </Button>
        </div>

        {/* Score Overview */}
        <Card className="border-0 shadow-xl mb-8">
          <CardHeader className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-brain-primary to-brain-secondary flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-white">{score}</span>
            </div>
            <CardTitle className="text-3xl mb-2">Your IQ Score</CardTitle>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className={`${scoreLevel.color} text-white`}>
                {scoreLevel.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {scoreLevel.description}
              </span>
            </div>
            <CardDescription className="text-lg">
              You answered {correctAnswers} out of {questions.length} questions correctly
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "overview" ? "brain" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="gap-2"
          >
            <Target className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "detailed" ? "brain" : "outline"}
            onClick={() => setActiveTab("detailed")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Detailed Analysis
          </Button>
          <Button
            variant={activeTab === "ai" ? "brain" : "outline"}
            onClick={() => setActiveTab("ai")}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            AI Insights
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Performance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-brain-primary" />
                  Performance by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryPerformance).map(([category, percentage]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{category} Reasoning</span>
                      <span>{percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Correct Answers</span>
                  <span className="font-medium">{correctAnswers}/{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy Rate</span>
                  <span className="font-medium">{((correctAnswers / questions.length) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Score Range</span>
                  <span className="font-medium">{scoreLevel.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Percentile</span>
                  <span className="font-medium">
                    {score >= 130 ? "98th" : score >= 115 ? "84th" : score >= 100 ? "50th" : "16th"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "detailed" && (
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <Card key={question.id} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCorrect ? 'bg-success text-white' : 'bg-destructive text-white'
                        }`}>
                          {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">{question.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {question.difficulty}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-medium mt-1">{question.question}</h3>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Your Answer:</h4>
                        <p className={`p-2 rounded border ${
                          isCorrect ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'
                        }`}>
                          {userAnswer >= 0 ? question.options[userAnswer] : "No answer"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Correct Answer:</h4>
                        <p className="p-2 rounded border bg-success/10 border-success/20">
                          {question.options[question.correctAnswer]}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-warning" />
                        Explanation:
                      </h4>
                      <p className="text-muted-foreground">{question.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "ai" && (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-brain-primary" />
                AI-Powered Analysis by Google Gemini
              </CardTitle>
              <CardDescription>
                Personalized insights and recommendations based on your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brain-primary"></div>
                  <span className="ml-2 text-muted-foreground">Generating AI analysis...</span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {aiAnalysis}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
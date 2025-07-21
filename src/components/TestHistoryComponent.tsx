import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, TrendingUp, Brain, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TestHistory {
  id: string;
  score: number;
  category_performance: any;
  ai_analysis: string;
  created_at: string;
}

interface TestHistoryComponentProps {
  onBack: () => void;
  user: any;
}

export const TestHistoryComponent = ({ onBack, user }: TestHistoryComponentProps) => {
  const [history, setHistory] = useState<TestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<TestHistory | null>(null);

  useEffect(() => {
    if (user) {
      fetchTestHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTestHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('iq_test_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching test history:', error);
      toast.error("Failed to load test history");
    } finally {
      setLoading(false);
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 130) return { label: "Highly Gifted", color: "bg-purple-500" };
    if (score >= 115) return { label: "Above Average", color: "bg-blue-500" };
    if (score >= 100) return { label: "Average", color: "bg-green-500" };
    if (score >= 85) return { label: "Below Average", color: "bg-yellow-500" };
    return { label: "Well Below Average", color: "bg-red-500" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-8">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
              <p className="text-muted-foreground">
                Please sign in to view your test history and track your cognitive development over time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => setSelectedTest(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Button>
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-brain-primary to-brain-secondary flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">{selectedTest.score}</span>
                </div>
                <CardTitle className="text-2xl mb-2">Test Results</CardTitle>
                <p className="text-muted-foreground">{formatDate(selectedTest.created_at)}</p>
              </div>
            </CardHeader>
            <CardContent>
              {/* Category Performance */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brain-primary" />
                  Category Performance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedTest.category_performance || {}).map(([category, percentage]) => (
                    <div key={category} className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-brain-primary mb-1">
                        {typeof percentage === 'number' ? percentage.toFixed(0) : '0'}%
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              {selectedTest.ai_analysis && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-brain-primary" />
                    AI Analysis
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                      {selectedTest.ai_analysis}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Test History</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brain-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading test history...</span>
          </div>
        ) : history.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="text-center pt-8">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">No Test History</h2>
              <p className="text-muted-foreground mb-6">
                You haven't taken any IQ tests yet. Take your first test to start tracking your cognitive development!
              </p>
              <Button variant="brain" onClick={onBack}>
                Take Your First Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your IQ Test History</h2>
              <p className="text-muted-foreground">
                Track your cognitive development over time with {history.length} completed test{history.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-4">
              {history.map((test) => {
                const scoreLevel = getScoreLevel(test.score);
                return (
                  <Card key={test.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full ${scoreLevel.color} flex items-center justify-center`}>
                            <span className="text-lg font-bold text-white">{test.score}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${scoreLevel.color} text-white`}>
                                {scoreLevel.label}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(test.created_at)}
                              </span>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              {Object.entries(test.category_performance || {}).map(([category, percentage]) => (
                                <span key={category} className="capitalize">
                                  {category}: {typeof percentage === 'number' ? percentage.toFixed(0) : '0'}%
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTest(test)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
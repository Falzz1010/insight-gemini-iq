import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, TrendingUp, Users, Star, ArrowRight, History, User, LogOut } from "lucide-react";
import { IQTestComponent } from "@/components/IQTestComponent";
import { AuthComponent } from "@/components/AuthComponent";
import { TestHistoryComponent } from "@/components/TestHistoryComponent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [currentView, setCurrentView] = useState<"home" | "test" | "auth" | "history">("home");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      setCurrentView("home");
    } catch (error: any) {
      toast.error("Error signing out: " + error.message);
    }
  };

  if (currentView === "test") {
    return <IQTestComponent onBack={() => setCurrentView("home")} user={user} />;
  }

  if (currentView === "auth") {
    return <AuthComponent onBack={() => setCurrentView("home")} onLogin={setUser} />;
  }

  if (currentView === "history") {
    return <TestHistoryComponent onBack={() => setCurrentView("home")} user={user} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      {/* Header - Mobile Optimized */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-brain-primary" />
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-brain-primary to-brain-secondary bg-clip-text text-transparent">
              <span className="hidden sm:inline">Insight Gemini IQ</span>
              <span className="sm:hidden">IQ Test</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentView("history")} 
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">History</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setCurrentView("auth")} className="text-xs sm:text-sm px-2 sm:px-3">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent/50 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-accent-foreground mb-4 sm:mb-6">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">AI-Powered Intelligence Assessment</span>
            <span className="sm:hidden">AI-Powered IQ Test</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Discover Your True
            <span className="bg-gradient-to-r from-brain-primary to-brain-secondary bg-clip-text text-transparent block">
              Intellectual Potential
            </span>
          </h2>
          
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            Take our comprehensive <strong>100-question IQ test</strong> and receive detailed AI analysis powered by Google Gemini. 
            Get personalized insights and recommendations to enhance your cognitive abilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              variant="brain" 
              size="xl"
              onClick={() => setCurrentView("test")}
              className="group w-full sm:w-auto"
            >
              Start 100-Question IQ Test
              <ArrowRight className="group-hover:translate-x-1 transition-transform ml-2" />
            </Button>
            <Button variant="outline" size="xl" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Optimized */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Why Choose Our IQ Test?</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Our advanced testing platform combines traditional IQ assessment with cutting-edge AI analysis
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-0 shadow-[var(--shadow-soft)] hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
            <CardHeader className="p-4 sm:p-6">
              <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-brain-primary mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">100 Comprehensive Questions</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Extensive assessment covering logical reasoning, numerical analysis, verbal comprehension, and spatial intelligence
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-[var(--shadow-soft)] hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
            <CardHeader className="p-4 sm:p-6">
              <Zap className="h-8 w-8 sm:h-12 sm:w-12 text-warning mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">AI-Powered Analysis</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Google Gemini AI analyzes your responses and provides detailed explanations and personalized recommendations
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-[var(--shadow-soft)] hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] sm:col-span-2 lg:col-span-1">
            <CardHeader className="p-4 sm:p-6">
              <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-success mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Progress Tracking</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Track your cognitive development over time with detailed score history and improvement suggestions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Statistics Section - Mobile Optimized */}
      <section className="bg-card/50 border-y">
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-brain-primary mb-1 sm:mb-2">100</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Questions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-success mb-1 sm:mb-2">95%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-warning mb-1 sm:mb-2">4.9</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-info mb-1 sm:mb-2">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <Card className="max-w-2xl mx-auto border-0 bg-gradient-to-r from-brain-primary/10 to-brain-secondary/10 shadow-xl">
          <CardContent className="pt-6 sm:pt-8 p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Unlock Your Potential?</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Join thousands of users who have discovered their true intellectual capabilities with our comprehensive 100-question AI-powered IQ assessment.
            </p>
            <Button 
              variant="brain" 
              size="lg"
              onClick={() => setCurrentView("test")}
              className="w-full sm:w-auto"
            >
              Start Your IQ Journey
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Insight Gemini IQ. Powered by AI technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

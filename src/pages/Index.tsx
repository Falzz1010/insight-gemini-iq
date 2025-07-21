import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, TrendingUp, Users, Star, ArrowRight } from "lucide-react";
import { IQTestComponent } from "@/components/IQTestComponent";
import { AuthComponent } from "@/components/AuthComponent";

const Index = () => {
  const [currentView, setCurrentView] = useState<"home" | "test" | "auth">("home");
  const [user, setUser] = useState(null);

  if (currentView === "test") {
    return <IQTestComponent onBack={() => setCurrentView("home")} user={user} />;
  }

  if (currentView === "auth") {
    return <AuthComponent onBack={() => setCurrentView("home")} onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-brain-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brain-primary to-brain-secondary bg-clip-text text-transparent">
              Insight Gemini IQ
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <span className="text-sm text-muted-foreground">Welcome back!</span>
            ) : (
              <Button variant="outline" onClick={() => setCurrentView("auth")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent/50 px-4 py-2 rounded-full text-sm font-medium text-accent-foreground mb-6">
            <Zap className="h-4 w-4" />
            AI-Powered Intelligence Assessment
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Discover Your True
            <span className="bg-gradient-to-r from-brain-primary to-brain-secondary bg-clip-text text-transparent block">
              Intellectual Potential
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Take our comprehensive IQ test and receive detailed AI analysis powered by Google Gemini. 
            Get personalized insights and recommendations to enhance your cognitive abilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="brain" 
              size="xl"
              onClick={() => setCurrentView("test")}
              className="group"
            >
              Start IQ Test
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Why Choose Our IQ Test?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our advanced testing platform combines traditional IQ assessment with cutting-edge AI analysis
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-[var(--shadow-soft)] hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
            <CardHeader>
              <Brain className="h-12 w-12 text-brain-primary mb-4" />
              <CardTitle>Comprehensive Assessment</CardTitle>
              <CardDescription>
                Multiple question types: logical reasoning, numerical analysis, verbal comprehension, and spatial intelligence
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-[var(--shadow-soft)] hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
            <CardHeader>
              <Zap className="h-12 w-12 text-warning mb-4" />
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Google Gemini AI analyzes your responses and provides detailed explanations and personalized recommendations
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-0 shadow-[var(--shadow-soft)] hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-success mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Track your cognitive development over time with detailed score history and improvement suggestions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-card/50 border-y">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-brain-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Tests Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warning mb-2">4.9</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-info mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto border-0 bg-gradient-to-r from-brain-primary/10 to-brain-secondary/10 shadow-xl">
          <CardContent className="pt-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Unlock Your Potential?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of users who have discovered their true intellectual capabilities with our AI-powered IQ assessment.
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

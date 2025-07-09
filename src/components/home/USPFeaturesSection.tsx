
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, GitCompare, Calculator, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const USPFeaturesSection = () => {
  const navigate = useNavigate();

  const uspFeatures = [
    {
      icon: Brain,
      title: "AI Assistant", 
      description: "Use AI assistant across the website and card level to improve decision making while buying cards",
      cta: "Try AI Assistant",
      link: "/all-cards?onboarding=ai-assistant",
      color: "primary",
      isAI: true
    },
    {
      icon: GitCompare,
      title: "Card Comparison",
      description: "Compare between textual information and spend-based calculations with detailed analysis",
      cta: "Compare Cards",
      link: "/all-cards?onboarding=compare-cards",
      color: "success",
      isCompare: true
    },
    {
      icon: Calculator,
      title: "Reward Calculator",
      description: "Choose a card and get category-specific questions for shopping, fuel, dining, utility etc.",
      cta: "Calculate Rewards",
      link: "/calculator",
      color: "accent"
    },
    {
      icon: Sparkles,
      title: "Card Genius",
      description: "Answer 19 comprehensive questions to get personalized card recommendations",
      cta: "Try Card Genius",
      link: "/genius",
      color: "primary"
    },
    {
      icon: Trophy,
      title: "Beat My Card",
      description: "Choose your existing card and find out which card would save you more money",
      cta: "Beat My Card",
      link: "/beat-my-card",
      color: "success"
    }
  ];

  const handleAIAssistantClick = () => {
    navigate('/all-cards?onboarding=ai-assistant');
  };

  const handleCompareCardsClick = () => {
    navigate('/all-cards?onboarding=compare-cards');
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Why Content Creators Choose Uncredit
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We understand your unique financial needs and help you make smarter credit card decisions
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {uspFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="relative group hover-lift shadow-card animate-slide-up border-0 bg-card/50 backdrop-blur-sm"
                style={{animationDelay: `${index * 200}ms`}}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                    feature.color === 'primary' ? 'bg-primary/10 text-primary' :
                    feature.color === 'success' ? 'bg-success/10 text-success' :
                    'bg-accent/10 text-accent'
                  }`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.isAI ? (
                    <Button 
                      variant="outline" 
                      className={`w-full group ${
                        feature.color === 'primary' ? 'border-primary text-primary hover:bg-primary/5' :
                        feature.color === 'success' ? 'border-success text-success hover:bg-success/5' :
                        'border-accent text-accent hover:bg-accent/5'
                      }`}
                      onClick={handleAIAssistantClick}
                    >
                      {feature.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : feature.isCompare ? (
                    <Button 
                      variant="outline" 
                      className={`w-full group ${
                        feature.color === 'primary' ? 'border-primary text-primary hover:bg-primary/5' :
                        feature.color === 'success' ? 'border-success text-success hover:bg-success/5' :
                        'border-accent text-accent hover:bg-accent/5'
                      }`}
                      onClick={handleCompareCardsClick}
                    >
                      {feature.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className={`w-full group ${
                        feature.color === 'primary' ? 'border-primary text-primary hover:bg-primary/5' :
                        feature.color === 'success' ? 'border-success text-success hover:bg-success/5' :
                        'border-accent text-accent hover:bg-accent/5'
                      }`}
                      asChild
                    >
                      <Link to={feature.link}>
                        {feature.cta}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

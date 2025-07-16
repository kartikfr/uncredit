
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, GitCompare, Calculator, Sparkles, Trophy, ArrowRight, Zap, Shield, Target, TrendingUp, Award, Crown, Star, Users, CreditCard, Coins, Percent, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const USPFeaturesSection = () => {
  const navigate = useNavigate();

  const uspFeatures = [
    {
      icon: Brain,
      title: "AI Assistant", 
      description: "Get personalized recommendations and smart insights to make informed credit card decisions",
      cta: "Try AI Assistant",
      link: "/all-cards?onboarding=ai-assistant",
      color: "blue",
      isAI: true,
      badge: "Most Popular"
    },
    {
      icon: GitCompare,
      title: "Smart Comparison",
      description: "Compare cards side-by-side with detailed analysis of rewards, fees, and benefits",
      cta: "Compare Cards",
      link: "/all-cards?onboarding=compare-cards",
      color: "green",
      isCompare: true,
      badge: "New"
    },
    {
      icon: Calculator,
      title: "Reward Calculator",
      description: "Calculate your potential rewards and cashback based on your spending patterns",
      cta: "Calculate Rewards",
      link: "/calculator",
      color: "purple"
    },
    {
      icon: Sparkles,
      title: "Card Genius",
      description: "Answer 19 questions to get AI-powered personalized card recommendations",
      cta: "Try Card Genius",
      link: "/genius",
      color: "indigo",
      badge: "AI Powered"
    },
    {
      icon: Trophy,
      title: "Beat My Card",
      description: "Find cards that offer better rewards than your current credit card",
      cta: "Beat My Card",
      link: "/beat-my-card",
      color: "orange"
    }
  ];

  const handleAIAssistantClick = () => {
    navigate('/all-cards?onboarding=ai-assistant');
  };

  const handleCompareCardsClick = () => {
    navigate('/all-cards?onboarding=compare-cards');
  };

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white/60 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 md:mb-20 animate-fade-in">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Why Content Creators Choose Uncredit
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Smart Tools for Smart Decisions
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We understand your unique financial needs as a content creator and provide AI-powered tools to help you make smarter credit card decisions
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
          {uspFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
              green: 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100',
              purple: 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100',
              indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100',
              orange: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
            };
            
            return (
              <Card 
                key={index} 
                className="relative group hover-lift shadow-lg animate-slide-up border-2 bg-white/80 backdrop-blur-sm overflow-hidden"
                style={{animationDelay: `${index * 150}ms`}}
              >
                {feature.badge && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={`text-xs px-2 py-1 ${
                      feature.badge === 'Most Popular' ? 'bg-yellow-500 text-white' :
                      feature.badge === 'New' ? 'bg-green-500 text-white' :
                      'bg-purple-500 text-white'
                    }`}>
                      {feature.badge}
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-6 md:p-8 text-center relative">
                  <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center border-2 ${colorClasses[feature.color]}`}>
                    <Icon className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <Separator className="my-4" />
                  
                  {feature.isAI ? (
                    <Button 
                      variant="outline" 
                      className={`w-full group border-2 font-semibold ${
                        feature.color === 'blue' ? 'border-blue-300 text-blue-600 hover:bg-blue-50' :
                        feature.color === 'green' ? 'border-green-300 text-green-600 hover:bg-green-50' :
                        feature.color === 'purple' ? 'border-purple-300 text-purple-600 hover:bg-purple-50' :
                        feature.color === 'indigo' ? 'border-indigo-300 text-indigo-600 hover:bg-indigo-50' :
                        'border-orange-300 text-orange-600 hover:bg-orange-50'
                      }`}
                      onClick={handleAIAssistantClick}
                    >
                      {feature.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : feature.isCompare ? (
                    <Button 
                      variant="outline" 
                      className={`w-full group border-2 font-semibold ${
                        feature.color === 'blue' ? 'border-blue-300 text-blue-600 hover:bg-blue-50' :
                        feature.color === 'green' ? 'border-green-300 text-green-600 hover:bg-green-50' :
                        feature.color === 'purple' ? 'border-purple-300 text-purple-600 hover:bg-purple-50' :
                        feature.color === 'indigo' ? 'border-indigo-300 text-indigo-600 hover:bg-indigo-50' :
                        'border-orange-300 text-orange-600 hover:bg-orange-50'
                      }`}
                      onClick={handleCompareCardsClick}
                    >
                      {feature.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className={`w-full group border-2 font-semibold ${
                        feature.color === 'blue' ? 'border-blue-300 text-blue-600 hover:bg-blue-50' :
                        feature.color === 'green' ? 'border-green-300 text-green-600 hover:bg-green-50' :
                        feature.color === 'purple' ? 'border-purple-300 text-purple-600 hover:bg-purple-50' :
                        feature.color === 'indigo' ? 'border-indigo-300 text-indigo-600 hover:bg-indigo-50' :
                        'border-orange-300 text-orange-600 hover:bg-orange-50'
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


import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Zap, TrendingUp, Users, Award, Crown, Star, CreditCard, Coins, Target, CheckCircle, Calculator as CalculatorIcon } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-cards.jpg";

interface StatsProps {
  stats: Array<{
    number: string;
    label: string;
  }>;
}

const Stats = ({ stats }: StatsProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 pt-8">
    {stats.map((stat, index) => (
      <div key={index} className="text-center animate-bounce-in bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl border-2 border-white/50 hover-lift shadow-lg" style={{animationDelay: `${index * 150}ms`}}>
        <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">{stat.number}</div>
        <div className="text-xs md:text-sm text-blue-700 font-medium">{stat.label}</div>
      </div>
    ))}
  </div>
);

export const HeroSection = () => {
  const stats = [
    { number: "10,000+", label: "Creators Trust Us" },
    { number: "₹2.5Cr+", label: "Rewards Unlocked" },
    { number: "500+", label: "Cards Analyzed" },
    { number: "95%", label: "Satisfaction Rate" }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles with different sizes and positions */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-calculator-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-reward-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-calculator-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-white/5 rounded-full animate-reward-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Additional animated elements */}
        <div className="absolute top-10 right-10 w-8 h-8 bg-white/15 rounded-full animate-calculator-float" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute top-60 left-20 w-14 h-14 bg-white/8 rounded-full animate-reward-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-10 left-10 w-10 h-10 bg-white/12 rounded-full animate-calculator-float" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute top-80 right-40 w-6 h-6 bg-white/20 rounded-full animate-reward-pulse" style={{animationDelay: '0.3s'}}></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-32 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-float-slow blur-xl" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute bottom-32 right-1/4 w-40 h-40 bg-gradient-to-r from-purple-400/15 to-blue-400/15 rounded-full animate-pulse-slow blur-xl" style={{animationDelay: '0.7s'}}></div>
        
        {/* Animated lines */}
        <div className="absolute top-1/4 left-0 w-1 h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-3/4 right-0 w-1 h-16 bg-gradient-to-b from-transparent via-white/15 to-transparent animate-pulse" style={{animationDelay: '1.8s'}}></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-white/25 rotate-45 animate-float-slow" style={{animationDelay: '1.7s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-white/20 rounded-sm animate-pulse-slow" style={{animationDelay: '0.9s'}}></div>
        
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 animate-shimmer-bg pointer-events-none"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Trusted by 10,000+ Content Creators
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Find Your Perfect 
                <span className="text-yellow-300"> Credit Card</span>, 
                <br />
                <span className="text-purple-200"> Creator Style!</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-2xl leading-relaxed">
                AI-powered recommendations tailored for content creators. 
                Compare cards, calculate rewards, and optimize your spending with smart insights.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 group hover-lift shadow-lg"
                asChild
              >
                <Link to="/all-cards">
                  <Target className="mr-2 h-5 w-5" />
                  Find the Best Card
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 font-semibold text-lg px-8 py-4 shadow-lg"
                asChild
              >
                <Link to="/calculator">
                  <CalculatorIcon className="mr-2 h-5 w-5" />
                  Try Calculator
                </Link>
              </Button>
            </div>

            <Stats stats={stats} />
          </div>
          
          <div className="relative animate-slide-up">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Credit Cards" 
                className="w-full h-auto rounded-2xl shadow-2xl floating"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg animate-calculator-float">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-800">Best Rewards</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg animate-reward-pulse">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-800">AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-cards.jpg";

interface StatsProps {
  stats: Array<{
    number: string;
    label: string;
  }>;
}

const Stats = ({ stats }: StatsProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
    {stats.map((stat, index) => (
      <div key={index} className="text-center animate-bounce-in" style={{animationDelay: `${index * 100}ms`}}>
        <div className="text-2xl font-bold text-primary">{stat.number}</div>
        <div className="text-sm text-muted-foreground">{stat.label}</div>
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
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Trusted by 10,000+ Creators
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Find Your Perfect 
                <span className="text-primary"> Credit Card</span>, 
                <span className="text-accent"> Creator Style!</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                AI-powered recommendations tailored for content creators. 
                Compare cards, calculate rewards, and optimize your spending.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground group"
                asChild
              >
                <Link to="/all-cards">
                  Find the Best Card
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/5"
                asChild
              >
                <Link to="/calculator">Try Calculator</Link>
              </Button>
            </div>

            <Stats stats={stats} />
          </div>
          
          <div className="relative animate-slide-up">
            <img 
              src={heroImage} 
              alt="Credit Cards" 
              className="w-full h-auto rounded-2xl shadow-elevated floating"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};


import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Find Your Perfect Credit Card?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who've optimized their finances with AI-powered recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 group"
              asChild
            >
              <Link to="/genius">
                Start with AI Assistant
                <Sparkles className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link to="/all-cards">Browse All Cards</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

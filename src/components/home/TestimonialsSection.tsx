
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Quote, Award, Users, TrendingUp, CheckCircle, Sparkles } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "YouTuber & Content Creator",
      content: "Found the perfect travel card for my frequent shoots. The AI recommendations were spot-on and I saved ₹45,000 in the first year alone!",
      rating: 5,
      avatar: "PS",
      savings: "₹45,000",
      category: "Travel"
    },
    {
      name: "Rahul Kumar",
      role: "Instagram Influencer", 
      content: "The reward calculator helped me realize I was missing out on so many rewards. It's a complete game changer for my business expenses!",
      rating: 5,
      avatar: "RK",
      savings: "₹32,000",
      category: "Shopping"
    },
    {
      name: "Sneha Patel",
      role: "Freelance Designer",
      content: "AI recommendations were incredibly accurate. Got a card that perfectly matches my creative business expenses and lifestyle.",
      rating: 5,
      avatar: "SP",
      savings: "₹28,000",
      category: "Business"
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 md:mb-20 animate-fade-in">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 mb-4">
            <Award className="w-4 h-4 mr-2" />
            Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Content Creators Say
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Real stories from real creators who found their perfect credit card match and saved thousands
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="hover-lift animate-slide-up shadow-xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm overflow-hidden group"
              style={{animationDelay: `${index * 200}ms`}}
            >
              <CardContent className="p-6 md:p-8">
                {/* Header with Avatar and Rating */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-blue-400 opacity-50" />
                </div>
                
                {/* Content */}
                <p className="text-muted-foreground italic text-base leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
                
                <Separator className="my-4" />
                
                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">
                      Saved {testimonial.savings}
                    </span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
                    {testimonial.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Stats Summary */}
        <div className="mt-16 text-center">
          <div className="bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-blue-200">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Trusted by Content Creators Worldwide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="flex items-center justify-center space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-blue-600">10,000+</div>
                  <div className="text-sm text-muted-foreground">Happy Creators</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-green-600">₹2.5Cr+</div>
                  <div className="text-sm text-muted-foreground">Total Savings</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-purple-600">95%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

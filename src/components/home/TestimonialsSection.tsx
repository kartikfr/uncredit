
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "YouTuber & Content Creator",
      content: "Found the perfect travel card for my frequent shoots. Saved ₹45,000 in the first year!",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Rahul Kumar",
      role: "Instagram Influencer", 
      content: "The spending calculator helped me realize I was missing out on so many rewards. Game changer!",
      rating: 5,
      avatar: "RK"
    },
    {
      name: "Sneha Patel",
      role: "Freelance Designer",
      content: "AI recommendations were spot-on. Got a card that matches my creative business expenses perfectly.",
      rating: 5,
      avatar: "SP"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            What Creators Say About Us
          </h2>
          <p className="text-xl text-muted-foreground">
            Real stories from real creators who found their perfect match
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="hover-lift animate-slide-up shadow-card border-0 bg-card/50 backdrop-blur-sm"
              style={{animationDelay: `${index * 200}ms`}}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

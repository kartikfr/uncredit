import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles, Target, TrendingUp, Award } from "lucide-react";

const CardGenius = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [spendingData, setSpendingData] = useState({
    amazon_spends: 5000,
    flipkart_spends: 3000,
    grocery_spends_online: 4000,
    online_food_ordering: 2500,
    other_online_spends: 2000,
    other_offline_spends: 3000,
    dining_or_going_out: 3500,
    fuel: 4000,
    school_fees: 0,
    rent: 25000,
    mobile_phone_bills: 1000,
    electricity_bills: 3000,
    water_bills: 1500,
    ott_channels: 800,
    hotels_annual: 30000,
    flights_annual: 40000,
    insurance_health_annual: 25000,
    insurance_car_or_bike_annual: 15000,
    large_electronics_purchase_like_mobile_tv_etc: 50000,
    domestic_lounge_usage_quarterly: 4,
    international_lounge_usage_quarterly: 0,
  });

  const questions = [
    { key: "amazon_spends", label: "Amazon Monthly Spending", min: 0, max: 50000, step: 500 },
    { key: "flipkart_spends", label: "Flipkart Monthly Spending", min: 0, max: 50000, step: 500 },
    { key: "other_online_spends", label: "Other Online Shopping", min: 0, max: 30000, step: 500 },
    { key: "other_offline_spends", label: "Offline Shopping", min: 0, max: 30000, step: 500 },
    { key: "grocery_spends_online", label: "Online Grocery Shopping", min: 0, max: 20000, step: 500 },
    { key: "online_food_ordering", label: "Food Delivery Apps", min: 0, max: 15000, step: 250 },
    { key: "dining_or_going_out", label: "Dining & Entertainment", min: 0, max: 20000, step: 500 },
    { key: "fuel", label: "Monthly Fuel Expenses", min: 0, max: 15000, step: 500 },
    { key: "rent", label: "Monthly Rent", min: 0, max: 100000, step: 1000 },
    { key: "mobile_phone_bills", label: "Mobile Bills", min: 0, max: 5000, step: 100 },
    { key: "electricity_bills", label: "Electricity Bills", min: 0, max: 10000, step: 200 },
    { key: "water_bills", label: "Water Bills", min: 0, max: 5000, step: 100 },
    { key: "ott_channels", label: "OTT Subscriptions", min: 0, max: 2000, step: 50 },
    { key: "insurance_health_annual", label: "Health Insurance (Annual)", min: 0, max: 100000, step: 2000 },
    { key: "insurance_car_or_bike_annual", label: "Vehicle Insurance (Annual)", min: 0, max: 50000, step: 1000 },
    { key: "hotels_annual", label: "Hotels (Annual)", min: 0, max: 200000, step: 5000 },
    { key: "flights_annual", label: "Flights (Annual)", min: 0, max: 300000, step: 5000 },
    { key: "domestic_lounge_usage_quarterly", label: "Domestic Lounge Usage (Quarterly)", min: 0, max: 50, step: 1 },
    { key: "international_lounge_usage_quarterly", label: "International Lounge Usage (Quarterly)", min: 0, max: 20, step: 1 },
  ];

  const progress = ((currentStep + 1) / questions.length) * 100;

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  const updateSpending = (key: string, value: number[]) => {
    setSpendingData(prev => ({ ...prev, [key]: value[0] }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = questions[currentStep];

  // Mock recommendations
  const recommendations = [
    {
      rank: 1,
      name: "Amazon Pay ICICI Credit Card",
      bank: "ICICI Bank",
      score: 95,
      annualRewards: 28500,
      highlights: ["5% on Amazon", "Unlimited cashback", "No annual fee"],
      category: "Shopping"
    },
    {
      rank: 2,
      name: "HDFC Regalia Credit Card",
      bank: "HDFC Bank",
      score: 88,
      annualRewards: 24200,
      highlights: ["Airport lounge access", "Air miles", "Travel benefits"],
      category: "Travel"
    },
    {
      rank: 3,
      name: "SBI SimplyCLICK Credit Card",
      bank: "SBI",
      score: 82,
      annualRewards: 21800,
      highlights: ["10X online rewards", "Dining benefits", "Low fees"],
      category: "Dining"
    }
  ];

  const spendingAnalysis = {
    totalMonthlySpend: Object.values(spendingData).reduce((sum, val) => sum + val, 0),
    topCategories: [
      { name: "Shopping", amount: 15000, percentage: 35 },
      { name: "Bills & Utilities", amount: 12000, percentage: 28 },
      { name: "Travel", amount: 8000, percentage: 19 },
      { name: "Dining", amount: 7500, percentage: 18 }
    ]
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        {/* Results Header */}
        <section className="bg-gradient-primary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-fade-in">
              <Sparkles className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Your AI-Powered Recommendations
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Based on your comprehensive spending analysis, here are the perfect credit cards for your lifestyle
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Spending Analysis Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-card sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Your Spending Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      ₹{spendingAnalysis.totalMonthlySpend.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Monthly Spending</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Top Categories</h4>
                    {spendingAnalysis.topCategories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground">{category.name}</span>
                          <span className="text-muted-foreground">₹{category.amount.toLocaleString()}</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>

                  <Button className="w-full" variant="outline">
                    Refine Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {recommendations.map((card, index) => (
                  <Card 
                    key={index} 
                    className="shadow-card hover-lift animate-slide-up"
                    style={{animationDelay: `${index * 200}ms`}}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                            #{card.rank}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">{card.name}</h3>
                            <p className="text-muted-foreground">{card.bank}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <Award className="h-4 w-4 text-accent mr-1" />
                            <span className="text-2xl font-bold text-accent">{card.score}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Match Score</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-foreground mb-3">Key Highlights</h4>
                          <div className="space-y-2">
                            {card.highlights.map((highlight, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-2 mb-2">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-3">Projected Rewards</h4>
                          <div className="text-center p-4 bg-success/5 rounded-lg">
                            <div className="text-2xl font-bold text-success">
                              ₹{card.annualRewards.toLocaleString()}
                            </div>
                            <p className="text-sm text-muted-foreground">Annual Rewards</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-6">
                        <Button className="flex-1 bg-primary hover:bg-primary/90">
                          Apply Now
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Compare Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Implementation Guide */}
              <Card className="shadow-card mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Implementation Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">1</div>
                      <div>
                        <h4 className="font-medium text-foreground">Apply for Top Choice</h4>
                        <p className="text-sm text-muted-foreground">Start with the highest-ranked card for maximum rewards</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm font-semibold">2</div>
                      <div>
                        <h4 className="font-medium text-foreground">Optimize Spending</h4>
                        <p className="text-sm text-muted-foreground">Align your spending with the card's reward categories</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-semibold">3</div>
                      <div>
                        <h4 className="font-medium text-foreground">Track & Review</h4>
                        <p className="text-sm text-muted-foreground">Monitor rewards and reassess annually</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <Sparkles className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Card Genius AI Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get personalized credit card recommendations based on your complete spending profile. 
              Answer 19 questions for the most accurate analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Header */}
      <section className="bg-gradient-subtle py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Question {currentStep + 1} of {questions.length}
              </h2>
              <p className="text-muted-foreground">
                Building your comprehensive spending profile...
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </section>

      {/* Question Interface */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card animate-fade-in">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    {currentQuestion.label}
                  </h3>
                  <p className="text-muted-foreground">
                    Adjust the slider to reflect your typical spending
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {formatCurrency(spendingData[currentQuestion.key as keyof typeof spendingData])}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.key.includes('annual') ? 'per year' : 'per month'}
                    </p>
                  </div>

                  <div className="px-4">
                    <Slider
                      value={[spendingData[currentQuestion.key as keyof typeof spendingData]]}
                      onValueChange={(value) => updateSpending(currentQuestion.key, value)}
                      max={currentQuestion.max}
                      min={currentQuestion.min}
                      step={currentQuestion.step}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{formatCurrency(currentQuestion.min)}</span>
                      <span>{formatCurrency(currentQuestion.max)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={nextStep}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {currentStep === questions.length - 1 ? "Get My Recommendations" : "Next"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="shadow-soft mt-6">
            <CardContent className="p-6">
              <h4 className="font-semibold text-foreground mb-3">💡 Pro Tip</h4>
              <p className="text-sm text-muted-foreground">
                Be as accurate as possible with your spending amounts. Our AI uses this data to find cards 
                that will maximize your rewards and savings based on your actual lifestyle.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CardGenius;
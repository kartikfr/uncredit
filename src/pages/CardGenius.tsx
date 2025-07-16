import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, ArrowLeft, Sparkles, Target, TrendingUp, Award, Crown, Star, Users, CreditCard, Zap, CheckCircle, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Link } from "react-router-dom";

const API_QUESTIONS = [
  { key: "amazon_spends", label: "How much do you spend on Amazon in a month? 🛍️", min: 0, max: 50000, step: 500 },
  { key: "flipkart_spends", label: "How much do you spend on Flipkart in a month? 📦", min: 0, max: 50000, step: 500 },
  { key: "grocery_spends_online", label: "How much do you spend on groceries (Blinkit,Zepto etc.) every month? 🥦", min: 0, max: 20000, step: 500 },
  { key: "online_food_ordering", label: "How much do you spend on food delivery apps in a month? 🛵🍜", min: 0, max: 15000, step: 250 },
  { key: "other_online_spends", label: "How much do you spend on other online shopping? 💸", min: 0, max: 30000, step: 500 },
  { key: "other_offline_spends", label: "How much do you spend at local shops or offline stores monthly? 🏪", min: 0, max: 30000, step: 500 },
  { key: "dining_or_going_out", label: "How much do you spend on dining out in a month? 🥗", min: 0, max: 20000, step: 500 },
  { key: "fuel", label: "How much do you spend on fuel in a month? ⛽", min: 0, max: 15000, step: 500 },
  { key: "school_fees", label: "How much do you pay in school fees monthly?", min: 0, max: 50000, step: 1000 },
  { key: "rent", label: "How much do you pay for house rent every month?", min: 0, max: 100000, step: 1000 },
  { key: "mobile_phone_bills", label: "How much do you spend on recharging your mobile or Wi-Fi monthly? 📱", min: 0, max: 5000, step: 100 },
  { key: "electricity_bills", label: "What’s your average monthly electricity bill? ⚡️", min: 0, max: 10000, step: 200 },
  { key: "water_bills", label: "And what about your monthly water bill? 💧", min: 0, max: 5000, step: 100 },
  { key: "hotels_annual", label: "How much do you spend on hotel stays in a year? 🛌", min: 0, max: 200000, step: 5000 },
  { key: "flights_annual", label: "How much do you spend on flights in a year? ✈️", min: 0, max: 300000, step: 5000 },
  { key: "insurance_health_annual", label: "How much do you pay for health or term insurance annually? 🛡️", min: 0, max: 100000, step: 2000 },
  { key: "insurance_car_or_bike_annual", label: "How much do you pay for car or bike insurance annually?", min: 0, max: 50000, step: 1000 },
  { key: "domestic_lounge_usage_quarterly", label: "How often do you visit domestic airport lounges in a year? 🇮🇳", min: 0, max: 50, step: 1 },
  { key: "international_lounge_usage_quarterly", label: "Plus, what about international airport lounges?", min: 0, max: 20, step: 1 },
];

export default function CardGenius() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [spendingData, setSpendingData] = useState(() => {
    const initial: Record<string, number> = {};
    API_QUESTIONS.forEach(q => { initial[q.key] = 0; });
    return initial;
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const progress = ((currentStep + 1) / API_QUESTIONS.length) * 100;

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
    if (currentStep < API_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitToAPI();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitToAPI = async () => {
    setLoading(true);
    setApiError("");
    setShowResults(false);
    try {
      const payload = { ...spendingData, selected_card_id: null };
      const response = await fetch('https://card-recommendation-api-v2.bankkaro.com/cg/api/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      console.log('Card Genius API response:', data);
      let cards = [];
      if (Array.isArray(data.savings)) {
        cards = data.savings;
      }
      setRecommendations(cards);
      setShowResults(true);
    } catch (err) {
      setApiError('Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = API_QUESTIONS[currentStep];

  const isLoungeQuestion = (key: string) =>
    key === "domestic_lounge_usage_quarterly" || key === "international_lounge_usage_quarterly";

  if (showResults) {
    const sortedCards = recommendations
      .map(card => ({
        ...card,
        _netSavings: (Number(card.total_savings_yearly) || 0) - (Number(card.joining_fees) || 0)
      }))
      .sort((a, b) => b._netSavings - a._netSavings);
    
    const topCard = sortedCards[0];
    const top3Cards = sortedCards.slice(0, 3);
    const remainingCards = sortedCards.slice(3, 10);

    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="h-16 w-16 mr-4" />
                <Crown className="h-16 w-16" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Your Perfect Match Found! 🎉
              </h1>
              <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                Based on your spending patterns, we've found the ideal credit card that will maximize your savings
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Top Card Highlight */}
          {topCard && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 text-lg font-bold mb-4 animate-pulse">
                  <Crown className="h-5 w-5 mr-2" />
                  TOP RECOMMENDATION
                </Badge>
                <h2 className="text-3xl font-bold text-foreground mb-2">Best Card for You</h2>
                <p className="text-muted-foreground">Maximum savings with optimal benefits</p>
              </div>
              
              <Card className="shadow-2xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 animate-card-glow">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Card Image */}
                    <div className="text-center lg:text-left">
                      <div className="w-48 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mx-auto lg:mx-0 mb-4">
                        {topCard.image ? (
                          <img 
                            src={topCard.image} 
                            alt={topCard.card_name} 
                            className="w-full h-full object-cover rounded-xl" 
                          />
                        ) : (
                          <CreditCard className="h-16 w-16 text-white" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{topCard.card_name}</h3>
                      <p className="text-lg text-muted-foreground">{topCard.bank_name}</p>
                    </div>
                    
                    {/* Savings Breakdown */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-800 font-semibold">Total Annual Savings</span>
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-green-900">
                          ₹{Number(topCard.total_savings_yearly || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-800 font-semibold">Joining Fees</span>
                          <Award className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          ₹{Number(topCard.joining_fees || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Net Savings & Action */}
                    <div className="text-center space-y-6">
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-center mb-2">
                          <Zap className="h-6 w-6 text-purple-600 mr-2" />
                          <span className="text-purple-800 font-semibold text-lg">Net Savings</span>
                        </div>
                        <div className="text-4xl font-bold text-purple-900">
                          ₹{topCard._netSavings.toLocaleString()}
                        </div>
                        <p className="text-purple-700 mt-2">After deducting joining fees</p>
                      </div>
                      
                      <Button asChild size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 text-lg animate-pulse-glow">
                        <Link to={`/card/${topCard.seo_card_alias || topCard.id}?tab=calculator`}>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          View Full Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top 3 Cards Comparison */}
          {top3Cards.length > 1 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Top 3 Recommendations</h2>
                <p className="text-muted-foreground">Compare the best options for your spending pattern</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {top3Cards.map((card, idx) => (
                  <Card key={card.id || idx} className={`shadow-lg hover:shadow-xl transition-all duration-300 ${idx === 0 ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border border-muted'}`}>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        {/* Rank Badge */}
                        <div className="flex justify-center">
                          <Badge className={`px-4 py-2 text-lg font-bold ${idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-primary text-white'}`}>
                            {idx === 0 ? <Crown className="h-4 w-4 mr-1" /> : null}
                            #{idx + 1}
                          </Badge>
                        </div>
                        
                        {/* Card Image */}
                        <div className="w-32 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md mx-auto">
                          {card.image ? (
                            <img 
                              src={card.image} 
                              alt={card.card_name} 
                              className="w-full h-full object-cover rounded-lg" 
                            />
                          ) : (
                            <CreditCard className="h-8 w-8 text-white" />
                          )}
                        </div>
                        
                        {/* Card Info */}
                        <div>
                          <h3 className="font-bold text-foreground text-lg line-clamp-2">{card.card_name}</h3>
                          <p className="text-sm text-muted-foreground">{card.bank_name}</p>
                        </div>
                        
                        {/* Net Savings */}
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <div className="text-sm text-green-700 font-medium">Net Savings</div>
                          <div className="text-2xl font-bold text-green-900">₹{card._netSavings.toLocaleString()}</div>
                        </div>
                        
                        {/* Action Button */}
                        <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90">
                          <Link to={`/card/${card.seo_card_alias || card.id}?tab=calculator`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Recommendations Table */}
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="table" className="flex items-center">
                <Table className="h-4 w-4 mr-2" />
                All Recommendations
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="space-y-6">
            <div className="overflow-x-auto max-w-full">
                <div className="max-h-[600px] overflow-y-auto rounded-lg border border-muted/30 shadow-md bg-white">
                <Table className="min-w-[900px]">
                  <TableHeader>
                      <TableRow className="bg-muted/50">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Credit Card</TableHead>
                      <TableHead className="text-center">Total Savings</TableHead>
                      <TableHead className="text-center">Joining Fees</TableHead>
                      <TableHead className="text-center">Net Savings</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {remainingCards.map((card, idx) => {
                        const totalSavings = Number(card.total_savings_yearly) || 0;
                        const joiningFees = Number(card.joining_fees) || 0;
                        const netSavings = card._netSavings;
                        return (
                          <TableRow key={card.id || card.card_name || idx} className="hover:bg-primary/5 transition-colors">
                            <TableCell className="text-center align-middle">
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-base font-bold shadow-sm">
                                #{idx + 4}
                              </Badge>
                            </TableCell>
                            <TableCell className="flex items-center gap-3 min-w-[220px] py-4">
                              <div className="w-14 h-10 rounded-lg bg-muted flex items-center justify-center border shadow-sm overflow-hidden">
                                {card.image ? (
                                  <img src={card.image} alt={card.card_name} className="w-full h-full object-contain rounded" />
                                ) : (
                                  <span className="text-xs text-muted-foreground">No Image</span>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground text-base leading-tight line-clamp-2">{card.card_name}</div>
                                <div className="text-xs text-muted-foreground mt-1">{card.bank_name}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold text-green-600 text-base">₹{totalSavings.toLocaleString()}</TableCell>
                            <TableCell className="text-center text-muted-foreground text-base">₹{joiningFees.toLocaleString()}</TableCell>
                            <TableCell className="text-center font-bold text-green-700 text-base">₹{netSavings.toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 shadow">
                                <Link to={`/card/${card.seo_card_alias || card.id}?tab=calculator`}>View Detail</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="shadow-card border-l-4 border-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                      <h3 className="text-xl font-bold text-green-900">Total Savings Range</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-700">
                      ₹{Math.min(...sortedCards.map(c => Number(c.total_savings_yearly) || 0)).toLocaleString()} - ₹{Math.max(...sortedCards.map(c => Number(c.total_savings_yearly) || 0)).toLocaleString()}
                    </div>
                    <p className="text-green-600 mt-2">Annual savings across all cards</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card border-l-4 border-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Award className="h-8 w-8 text-blue-600 mr-3" />
                      <h3 className="text-xl font-bold text-blue-900">Average Joining Fee</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-700">
                      ₹{(sortedCards.reduce((sum, c) => sum + (Number(c.joining_fees) || 0), 0) / sortedCards.length).toLocaleString()}
                    </div>
                    <p className="text-blue-600 mt-2">Average across all recommendations</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card border-l-4 border-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Zap className="h-8 w-8 text-purple-600 mr-3" />
                      <h3 className="text-xl font-bold text-purple-900">Best Net Savings</h3>
                    </div>
                    <div className="text-3xl font-bold text-purple-700">
                      ₹{topCard?._netSavings.toLocaleString()}
                </div>
                    <p className="text-purple-600 mt-2">Top recommendation</p>
                  </CardContent>
                </Card>
            </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <Button 
              onClick={() => { setShowResults(false); setCurrentStep(0); }}
              variant="outline"
              size="lg"
              className="px-8 py-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Start New Analysis
            </Button>
            <Button 
              asChild
              size="lg"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Link to="/all-cards">
                <TrendingUp className="h-5 w-5 mr-2" />
                Explore All Cards
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Card Genius</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Credit Card Recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Step {currentStep + 1} of {API_QUESTIONS.length}</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Spending Analysis</span>
              <span>
                {isLoungeQuestion(currentQuestion.key)
                  ? `${spendingData[currentQuestion.key]} times`
                  : formatCurrency(spendingData[currentQuestion.key])}
              </span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {currentQuestion.label}
                </h3>
                <p className="text-muted-foreground">
                  Help us understand your spending pattern for better recommendations
                </p>
              </div>

              {/* Slider Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-blue-800">Adjust your spending</span>
                    <div className="flex items-center space-x-2">
              <input
                type="number"
                min={0}
                        className="border-2 border-blue-300 rounded-lg px-4 py-2 w-32 text-right text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={spendingData[currentQuestion.key]}
                onChange={e => {
                  const val = Math.max(0, Number(e.target.value));
                  updateSpending(currentQuestion.key, [val]);
                }}
              />
                      <span className="text-sm text-blue-700 font-medium">
                        {isLoungeQuestion(currentQuestion.key) ? 'times' : (currentQuestion.key.includes('annual') ? '/year' : '/month')}
                      </span>
                    </div>
                  </div>
                  
                  <Slider
                    min={currentQuestion.min}
                    max={isLoungeQuestion(currentQuestion.key) ? Math.max(currentQuestion.max, spendingData[currentQuestion.key]) : currentQuestion.max}
                    step={currentQuestion.step}
                    value={[spendingData[currentQuestion.key]]}
                    onValueChange={val => updateSpending(currentQuestion.key, val)}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-blue-600 mt-2">
                    <span>{isLoungeQuestion(currentQuestion.key) ? '0' : formatCurrency(currentQuestion.min)}</span>
                    <span>{isLoungeQuestion(currentQuestion.key) ? '50+' : formatCurrency(currentQuestion.max)}</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[0, 1000, 5000, 10000].map(preset => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => updateSpending(currentQuestion.key, [preset])}
                    >
                      {isLoungeQuestion(currentQuestion.key) ? `${preset} times` : formatCurrency(preset)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {apiError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{apiError}</p>
                    </div>
            </div>
          </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={currentStep === 0 || loading}
                  className="px-6 py-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> 
                  Previous
            </Button>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    onClick={nextStep} 
                    disabled={loading}
                    className="px-6 py-2"
                  >
              Skip
            </Button>
                  
                  <Button 
                    onClick={nextStep} 
                    disabled={loading}
                    className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  >
                    {currentStep === API_QUESTIONS.length - 1 ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Recommendations
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
            </Button>
          </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-800 font-medium">Analyzing your spending patterns...</span>
                  </div>
                </div>
              )}
        </CardContent>
      </Card>

          {/* Tips Section */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-900">Personalized</h4>
              </div>
              <p className="text-sm text-blue-700">Recommendations based on your actual spending habits</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-semibold text-purple-900">Maximum Savings</h4>
              </div>
              <p className="text-sm text-purple-700">Find cards that maximize your annual savings</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-900">Quick Results</h4>
              </div>
              <p className="text-sm text-green-700">Get instant AI-powered recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
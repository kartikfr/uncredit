import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles, Target, TrendingUp, Award } from "lucide-react";
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
    return (
      <div className="min-h-screen bg-background">
        <section className="bg-gradient-primary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-fade-in">
              <Sparkles className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Your AI-Powered Recommendations
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Based on your spending, here are the perfect credit cards for your lifestyle
              </p>
            </div>
          </div>
        </section>
        <div className="container mx-auto px-4 py-12">
          {recommendations.length > 0 ? (
            <div className="overflow-x-auto max-w-full">
              <div className="max-h-[540px] overflow-y-auto rounded-lg border border-muted/30 shadow-md bg-white">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Credit Card</TableHead>
                      <TableHead className="text-center">Total Savings</TableHead>
                      <TableHead className="text-center">Joining Fees</TableHead>
                      <TableHead className="text-center">Net Savings</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations
                      .map(card => ({
                        ...card,
                        _netSavings: (Number(card.total_savings_yearly) || 0) - (Number(card.joining_fees) || 0)
                      }))
                      .sort((a, b) => b._netSavings - a._netSavings)
                      .slice(0, 10)
                      .map((card, idx) => {
                        const totalSavings = Number(card.total_savings_yearly) || 0;
                        const joiningFees = Number(card.joining_fees) || 0;
                        const netSavings = card._netSavings;
                        return (
                          <TableRow key={card.id || card.card_name || idx} className="hover:bg-primary/5 transition-colors">
                            <TableCell className="text-center align-middle">
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-base font-bold shadow-sm">{`#${idx + 1}`}</Badge>
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
                                <Link to={`/card/${card.id}?tab=calculator`}>View Detail</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
              {recommendations.length > 10 && (
                <div className="text-center text-xs text-muted-foreground mt-2">
                  Showing top 10 cards. Scroll for more.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No recommendations found.</div>
          )}
          <div className="flex justify-center mt-8">
            <Button onClick={() => { setShowResults(false); setCurrentStep(0); }}>
              Start Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Card className="w-full max-w-xl shadow-card animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-primary" />
            Card Genius
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs mt-2">
              <span>Step {currentStep + 1} of {API_QUESTIONS.length}</span>
              <span>
                {isLoungeQuestion(currentQuestion.key)
                  ? spendingData[currentQuestion.key]
                  : formatCurrency(spendingData[currentQuestion.key])}
              </span>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">{currentQuestion.label}</h2>
            <div className="flex items-center gap-4">
              <Slider
                min={currentQuestion.min}
                max={isLoungeQuestion(currentQuestion.key) ? Math.max(currentQuestion.max, spendingData[currentQuestion.key]) : currentQuestion.max}
                step={currentQuestion.step}
                value={[spendingData[currentQuestion.key]]}
                onValueChange={val => updateSpending(currentQuestion.key, val)}
              />
              <input
                type="number"
                min={0}
                className="border rounded px-2 py-1 w-24 text-right text-base focus:outline-primary"
                value={spendingData[currentQuestion.key]}
                onChange={e => {
                  const val = Math.max(0, Number(e.target.value));
                  updateSpending(currentQuestion.key, [val]);
                }}
              />
              {isLoungeQuestion(currentQuestion.key) ? <span className="ml-1 text-xs text-muted-foreground">times</span> : <span className="ml-1 text-xs text-muted-foreground">{currentQuestion.key.includes('annual') ? 'per year' : 'per month'}</span>}
            </div>
          </div>
          {apiError && <div className="text-destructive text-sm mb-4">{apiError}</div>}
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0 || loading}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="ghost" onClick={nextStep} disabled={loading}>
              Skip
            </Button>
            <Button onClick={nextStep} disabled={loading}>
              {currentStep === API_QUESTIONS.length - 1 ? 'Get Recommendations' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {loading && <div className="text-center text-muted-foreground mt-4">Loading recommendations...</div>}
        </CardContent>
      </Card>
    </div>
  );
}
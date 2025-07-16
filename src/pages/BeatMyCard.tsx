import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, ArrowRight, ArrowLeft, Sparkles, Target, TrendingUp, Award, Crown, Star, Users, CreditCard, Zap, CheckCircle, ExternalLink, ArrowUpRight, ArrowDownRight, Calculator, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Link } from "react-router-dom";

const QUESTION_META = {
  amazon_spends: { label: "How much do you spend on Amazon in a month? 🛍️", min: 0, max: 50000, step: 500 },
  flipkart_spends: { label: "How much do you spend on Flipkart in a month? 📦", min: 0, max: 50000, step: 500 },
  other_online_spends: { label: "How much do you spend on other online shopping? 💸", min: 0, max: 30000, step: 500 },
  other_offline_spends: { label: "How much do you spend at local shops or offline stores monthly? 🏪", min: 0, max: 30000, step: 500 },
  grocery_spends_online: { label: "How much do you spend on groceries (Blinkit,Zepto etc.) every month? 🥦", min: 0, max: 20000, step: 500 },
  online_food_ordering: { label: "How much do you spend on food delivery apps in a month? 🛵🍜", min: 0, max: 15000, step: 250 },
  fuel: { label: "How much do you spend on fuel in a month? ⛽", min: 0, max: 15000, step: 500 },
  dining_or_going_out: { label: "How much do you spend on dining out in a month? 🥗", min: 0, max: 20000, step: 500 },
  flights_annual: { label: "How much do you spend on flights in a year? ✈️", min: 0, max: 300000, step: 5000 },
  hotels_annual: { label: "How much do you spend on hotel stays in a year? 🛌", min: 0, max: 200000, step: 5000 },
  domestic_lounge_usage_quarterly: { label: "How often do you visit domestic airport lounges in a year? 🇮🇳", min: 0, max: 50, step: 1 },
  international_lounge_usage_quarterly: { label: "Plus, what about international airport lounges? 🌎", min: 0, max: 20, step: 1 },
  mobile_phone_bills: { label: "How much do you spend on recharging your mobile or Wi-Fi monthly? 📱", min: 0, max: 5000, step: 100 },
  electricity_bills: { label: "What’s your average monthly electricity bill? ⚡️", min: 0, max: 10000, step: 200 },
  water_bills: { label: "And what about your monthly water bill? 💧", min: 0, max: 5000, step: 100 },
  insurance_health_annual: { label: "How much do you pay for health or term insurance annually? 🛡️", min: 0, max: 100000, step: 2000 },
  insurance_car_or_bike_annual: { label: "How much do you pay for car or bike insurance annually?", min: 0, max: 50000, step: 1000 },
  rent: { label: "How much do you pay for house rent every month?", min: 0, max: 100000, step: 1000 },
  school_fees: { label: "How much do you pay in school fees monthly?", min: 0, max: 50000, step: 1000 },
};
const ALL_KEYS = Object.keys(QUESTION_META);

export default function BeatMyCard() {
  const [cardOptions, setCardOptions] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [step, setStep] = useState(1);
  const [questionStep, setQuestionStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, number>>(() => Object.fromEntries(ALL_KEYS.map(k => [k, 0])));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comparison, setComparison] = useState<any | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Fetch card options from Card Genius API
  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch('https://card-recommendation-api-v2.bankkaro.com/cg/api/pro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(ALL_KEYS.map(k => [k, 0])))
        });
        const data = await response.json();
        setCardOptions((data.savings || []).map((c: any) => ({
          value: c.seo_card_alias,
          label: c.card_name,
          image: c.image
        })));
      } catch (err) {
        setCardOptions([]);
      }
    }
    fetchCards();
  }, []);

  const handleValueChange = (key: string, value: number) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleCompare = async () => {
    setLoading(true);
    setError("");
    setComparison(null);
    try {
      const payload: Record<string, any> = {};
      for (const k of ALL_KEYS) payload[k] = formValues[k];
      const response = await fetch('https://card-recommendation-api-v2.bankkaro.com/cg/api/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const allCards = (data.savings || []).map((c: any) => ({
        ...c,
        _netSavings: (Number(c.total_savings_yearly) || 0) - (Number(c.joining_fees) || 0)
      }));
      const userCard = allCards.find((c: any) => c.seo_card_alias === selectedCard);
      const bestCard = allCards.sort((a, b) => b._netSavings - a._netSavings)[0];
      setComparison({ userCard, bestCard, allCards });
    } catch (err) {
      setError('Failed to compare cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Card selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Beat My Card</h1>
                  <p className="text-sm text-muted-foreground">Find Better Credit Card Options</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <Trophy className="h-12 w-12 md:h-16 md:w-16 mr-2 md:mr-4" />
                <Crown className="h-12 w-12 md:h-16 md:w-16" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
                Beat Your Current Card! 🏆
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed px-4">
                Discover credit cards that can save you more money than your current one
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Card Selection */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    Select Your Current Card
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground px-2">
                    Choose the credit card you're currently using to compare with better options
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-6 rounded-xl border border-blue-200">
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center mb-3 md:mb-4">
                        <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                        <span className="text-xs md:text-sm font-medium text-blue-800">Your Current Card</span>
                      </div>
                      
                      <Select value={selectedCard} onValueChange={setSelectedCard}>
                        <SelectTrigger className="h-10 md:h-12 text-sm md:text-lg border-2 border-blue-300 focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Choose your current credit card" />
                        </SelectTrigger>
                        <SelectContent 
                          position="popper" 
                          side="bottom" 
                          align="start"
                          className="w-full max-h-[300px] overflow-y-auto"
                          sideOffset={4}
                        >
                          <ScrollArea className="h-[250px]">
                            {cardOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value} className="py-2 md:py-3">
                                <div className="flex items-center space-x-2 md:space-x-3">
                                  <div className="w-6 h-4 md:w-8 md:h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                                    {opt.image ? (
                                      <img src={opt.image} alt={opt.label} className="w-full h-full object-cover rounded" />
                                    ) : (
                                      <CreditCard className="h-2 w-2 md:h-3 md:w-3 text-white" />
                                    )}
                                  </div>
                                  <span className="text-xs md:text-sm lg:text-base">{opt.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedCard && (
                    <div className="text-center animate-fade-in">
                      <Button 
                        size="lg"
                        onClick={() => setStep(2)}
                        className="px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm md:text-lg w-full md:w-auto"
                      >
                        <Calculator className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        Start Spending Analysis
                        <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features Section */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                  <h4 className="text-sm md:text-base font-semibold text-blue-900">Smart Comparison</h4>
                </div>
                <p className="text-xs md:text-sm text-blue-700">Compare your current card with the best alternatives</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-2" />
                  <h4 className="text-sm md:text-base font-semibold text-purple-900">Savings Analysis</h4>
                </div>
                <p className="text-xs md:text-sm text-purple-700">See exactly how much more you could save</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-blue-200 sm:col-span-2 md:col-span-1">
                <div className="flex items-center mb-2">
                  <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                  <h4 className="text-sm md:text-base font-semibold text-blue-900">Quick Results</h4>
                </div>
                <p className="text-xs md:text-sm text-blue-700">Get instant comparison results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Card Genius-style question flow
  if (step === 2) {
    const keys = ALL_KEYS;
    const currentKey = keys[questionStep];
    const progress = ((questionStep + 1) / keys.length) * 100;
    const isLoungeQuestion = (key: string) =>
      key === "domestic_lounge_usage_quarterly" || key === "international_lounge_usage_quarterly";

    const formatCurrency = (value: number) => {
      if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
      } else if (value >= 1000) {
        return `₹${(value / 1000).toFixed(0)}K`;
      }
      return `₹${value}`;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Beat My Card</h1>
                  <p className="text-sm text-muted-foreground">Spending Analysis for Comparison</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Progress Section */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-foreground">Step {questionStep + 1} of {keys.length}</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs md:text-sm">
                  {Math.round(progress)}% Complete
                </Badge>
              </div>
              <Progress value={progress} className="h-2 md:h-3" />
              <div className="flex justify-between text-xs md:text-sm text-muted-foreground mt-2">
                <span>Spending Analysis</span>
                <span>
                  {isLoungeQuestion(currentKey)
                    ? `${formValues[currentKey]} times`
                    : formatCurrency(formValues[currentKey])}
                </span>
              </div>
            </div>

            {/* Question Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Target className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2">
                    {QUESTION_META[currentKey].label}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground px-2">
                    Help us understand your spending pattern to find better card options
                  </p>
                </div>

                {/* Slider Section */}
                <div className="space-y-4 md:space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-6 rounded-xl border border-blue-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4 space-y-2 md:space-y-0">
                      <span className="text-xs md:text-sm font-medium text-blue-800">Adjust your spending</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          className="border-2 border-blue-300 rounded-lg px-3 md:px-4 py-2 w-24 md:w-32 text-right text-sm md:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formValues[currentKey]}
                          onChange={e => handleValueChange(currentKey, Math.max(0, Number(e.target.value)))}
                        />
                        <span className="text-xs md:text-sm text-blue-700 font-medium">
                          {isLoungeQuestion(currentKey) ? 'times' : (currentKey.includes('annual') ? '/year' : '/month')}
                        </span>
                      </div>
                    </div>
                    
                    <Slider
                      min={QUESTION_META[currentKey].min}
                      max={Math.max(QUESTION_META[currentKey].max, formValues[currentKey])}
                      step={QUESTION_META[currentKey].step}
                      value={[formValues[currentKey]]}
                      onValueChange={val => handleValueChange(currentKey, val[0])}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-xs text-blue-600 mt-2">
                      <span>{isLoungeQuestion(currentKey) ? '0' : formatCurrency(QUESTION_META[currentKey].min)}</span>
                      <span>{isLoungeQuestion(currentKey) ? '50+' : formatCurrency(QUESTION_META[currentKey].max)}</span>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    {[0, 1000, 5000, 10000].map(preset => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        className="text-xs border-blue-200 hover:bg-blue-50 py-1 md:py-2"
                        onClick={() => handleValueChange(currentKey, preset)}
                      >
                        {isLoungeQuestion(currentKey) ? `${preset} times` : formatCurrency(preset)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 md:mt-8 pt-4 md:pt-6 border-t space-y-3 md:space-y-0">
                  <Button 
                    variant="outline" 
                    onClick={() => setQuestionStep(q => Math.max(0, q - 1))} 
                    disabled={questionStep === 0 || loading}
                    className="px-4 md:px-6 py-2 w-full md:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> 
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2 md:space-x-3 w-full md:w-auto">
                    <Button 
                      variant="ghost" 
                      onClick={() => setQuestionStep(q => Math.min(keys.length - 1, q + 1))} 
                      disabled={loading}
                      className="px-4 md:px-6 py-2 flex-1 md:flex-none"
                    >
                      Skip
                    </Button>
                    
                    <Button 
                      onClick={questionStep === keys.length - 1 ? () => { setStep(3); handleCompare(); } : () => setQuestionStep(q => Math.min(keys.length - 1, q + 1))} 
                      disabled={loading}
                      className="px-6 md:px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold flex-1 md:flex-none"
                    >
                      {questionStep === keys.length - 1 ? (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Calculate & Compare</span>
                          <span className="sm:hidden">Compare</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Next</span>
                          <span className="sm:hidden">Next</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center px-3 md:px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-blue-600 mr-2 md:mr-3"></div>
                      <span className="text-blue-800 font-medium text-sm md:text-base">Analyzing your spending patterns...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Section */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                  <h4 className="text-sm md:text-base font-semibold text-blue-900">Accurate Comparison</h4>
                </div>
                <p className="text-xs md:text-sm text-blue-700">Better spending data leads to more accurate comparisons</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-2" />
                  <h4 className="text-sm md:text-base font-semibold text-purple-900">Maximum Savings</h4>
                </div>
                <p className="text-xs md:text-sm text-purple-700">Find cards that beat your current savings</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-blue-200 sm:col-span-2 md:col-span-1">
                <div className="flex items-center mb-2">
                  <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                  <h4 className="text-sm md:text-base font-semibold text-blue-900">Quick Results</h4>
                </div>
                <p className="text-xs md:text-sm text-blue-700">Get instant comparison results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Show comparison
  if (step === 3) {
    const savingsDifference = comparison ? comparison.bestCard._netSavings - comparison.userCard._netSavings : 0;
    const isBetter = savingsDifference > 0;

          return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <div className="animate-fade-in">
                <div className="flex items-center justify-center mb-6">
                  <Trophy className="h-16 w-16 mr-4" />
                  {isBetter ? <ArrowUpRight className="h-16 w-16" /> : <ArrowDownRight className="h-16 w-16" />}
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                  {isBetter ? "Found Better Options! 🎉" : "Analysis Complete"}
                </h1>
                <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                  {isBetter 
                    ? `You could save ₹${savingsDifference.toLocaleString()} more annually with a better card!`
                    : "Here's how your current card compares to the best options"
                  }
                </p>
              </div>
            </div>
          </section>

        <div className="container mx-auto px-4 py-12">
          {error && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {comparison && (
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Comparison Cards */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Current Card */}
                <Card className="shadow-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <Badge className="bg-gray-500 text-white px-4 py-1 mb-4">
                        Your Current Card
                      </Badge>
                      <div className="w-48 h-32 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                        {comparison.userCard.image ? (
                          <img 
                            src={comparison.userCard.image} 
                            alt={comparison.userCard.card_name} 
                            className="w-full h-full object-cover rounded-xl" 
                          />
                        ) : (
                          <CreditCard className="h-16 w-16 text-white" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{comparison.userCard.card_name}</h3>
                      <p className="text-lg text-muted-foreground">{comparison.userCard.bank_name}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-semibold">Total Annual Savings</span>
                          <TrendingUp className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{Number(comparison.userCard.total_savings_yearly || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-semibold">Joining Fees</span>
                          <Award className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          ₹{Number(comparison.userCard.joining_fees || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-2">
                          <Zap className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="text-gray-700 font-semibold">Net Savings</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                          ₹{comparison.userCard._netSavings.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Best Card */}
                <Card className={`shadow-2xl border-2 ${isBetter ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 animate-card-glow' : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100'}`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <Badge className={`px-4 py-1 mb-4 ${isBetter ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {isBetter ? (
                          <>
                            <Crown className="h-4 w-4 mr-1" />
                            Better Option
                          </>
                        ) : (
                          'Best Available'
                        )}
                      </Badge>
                      <div className={`w-48 h-32 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 ${isBetter ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}>
                        {comparison.bestCard.image ? (
                          <img 
                            src={comparison.bestCard.image} 
                            alt={comparison.bestCard.card_name} 
                            className="w-full h-full object-cover rounded-xl" 
                          />
                        ) : (
                          <CreditCard className="h-16 w-16 text-white" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{comparison.bestCard.card_name}</h3>
                      <p className="text-lg text-muted-foreground">{comparison.bestCard.bank_name}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border ${isBetter ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-200' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold ${isBetter ? 'text-green-800' : 'text-gray-700'}`}>Total Annual Savings</span>
                          <TrendingUp className={`h-5 w-5 ${isBetter ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div className={`text-2xl font-bold ${isBetter ? 'text-green-900' : 'text-gray-900'}`}>
                          ₹{Number(comparison.bestCard.total_savings_yearly || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${isBetter ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-200' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold ${isBetter ? 'text-green-800' : 'text-gray-700'}`}>Joining Fees</span>
                          <Award className={`h-5 w-5 ${isBetter ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div className={`text-xl font-bold ${isBetter ? 'text-green-900' : 'text-gray-900'}`}>
                          ₹{Number(comparison.bestCard.joining_fees || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${isBetter ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-200' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'}`}>
                        <div className="flex items-center justify-center mb-2">
                          <Zap className={`h-5 w-5 mr-2 ${isBetter ? 'text-green-600' : 'text-gray-600'}`} />
                          <span className={`font-semibold ${isBetter ? 'text-green-800' : 'text-gray-700'}`}>Net Savings</span>
                        </div>
                        <div className={`text-3xl font-bold ${isBetter ? 'text-green-900' : 'text-gray-900'}`}>
                          ₹{comparison.bestCard._netSavings.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Savings Difference */}
              {isBetter && (
                <Card className="shadow-xl border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <ArrowUpRight className="h-12 w-12 text-green-600 mr-4" />
                      <h2 className="text-3xl font-bold text-green-900">Potential Annual Savings</h2>
                    </div>
                    <div className="text-6xl font-bold text-green-700 mb-4">
                      ₹{savingsDifference.toLocaleString()}
                    </div>
                    <p className="text-xl text-green-600 mb-6">
                      That's how much more you could save annually with the better card!
                    </p>
                    <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 text-lg">
                      <Link to={`/card/${comparison.bestCard.seo_card_alias || comparison.bestCard.id}?tab=calculator`}>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        View Better Card Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
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
                          {comparison.allCards
                            .sort((a: any, b: any) => b._netSavings - a._netSavings)
                            .slice(0, 10)
                            .map((card: any, idx: number) => {
                              const isCurrentCard = card.seo_card_alias === selectedCard;
                              const isBestCard = idx === 0;
                              return (
                                <TableRow key={card.id || card.card_name || idx} className={`hover:bg-primary/5 transition-colors ${isCurrentCard ? 'bg-blue-50' : ''} ${isBestCard ? 'bg-green-50' : ''}`}>
                                  <TableCell className="text-center align-middle">
                                    <Badge variant="secondary" className={`px-3 py-1 text-base font-bold shadow-sm ${isCurrentCard ? 'bg-blue-100 text-blue-700 border-blue-200' : isBestCard ? 'bg-green-100 text-green-700 border-green-200' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                      {isCurrentCard ? 'Current' : isBestCard ? 'Best' : `#${idx + 1}`}
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
                                  <TableCell className="text-center font-bold text-green-600 text-base">₹{Number(card.total_savings_yearly || 0).toLocaleString()}</TableCell>
                                  <TableCell className="text-center text-muted-foreground text-base">₹{Number(card.joining_fees || 0).toLocaleString()}</TableCell>
                                  <TableCell className="text-center font-bold text-green-700 text-base">₹{card._netSavings.toLocaleString()}</TableCell>
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
                    <Card className="shadow-card border-l-4 border-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                          <h3 className="text-xl font-bold text-blue-900">Your Current Card</h3>
                        </div>
                        <div className="text-3xl font-bold text-blue-700">
                          ₹{comparison.userCard._netSavings.toLocaleString()}
                        </div>
                        <p className="text-blue-600 mt-2">Annual net savings</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-card border-l-4 border-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                          <h3 className="text-xl font-bold text-green-900">Best Available</h3>
                        </div>
                        <div className="text-3xl font-bold text-green-700">
                          ₹{comparison.bestCard._netSavings.toLocaleString()}
                        </div>
                        <p className="text-green-600 mt-2">Maximum potential savings</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-card border-l-4 border-orange-500">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <Zap className="h-8 w-8 text-orange-600 mr-3" />
                          <h3 className="text-xl font-bold text-orange-900">Potential Gain</h3>
                        </div>
                        <div className="text-3xl font-bold text-orange-700">
                          ₹{savingsDifference.toLocaleString()}
                        </div>
                        <p className="text-orange-600 mt-2">{isBetter ? 'Additional annual savings' : 'No improvement found'}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
                <Button 
                  onClick={() => { setStep(1); setQuestionStep(0); setComparison(null); }}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Start New Comparison
                </Button>
                <Button 
                  onClick={() => { setStep(2); setComparison(null); }}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Modify Spending Data
                </Button>
                                 <Button 
                   asChild
                   size="lg"
                   className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                 >
                   <Link to="/all-cards">
                     <TrendingUp className="h-5 w-5 mr-2" />
                     Explore All Cards
                   </Link>
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
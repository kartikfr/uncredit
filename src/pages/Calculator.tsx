import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Calculator, CreditCard, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CalculatorPage = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [questions, setQuestions] = useState<any>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { id: "all", label: "All", description: "Complete spending analysis" },
    { id: "shopping", label: "Shopping", description: "Amazon, Flipkart, online/offline" },
    { id: "utility", label: "Utility", description: "Bills, rent, insurance" },
    { id: "grocery", label: "Grocery", description: "Online grocery spending" },
    { id: "fuel", label: "Fuel", description: "Fuel spending patterns" },
    { id: "dining", label: "Dining", description: "Restaurant and going out" },
    { id: "food-ordering", label: "Online Food Ordering", description: "Food delivery spending" },
    { id: "travel", label: "Travel & Hotel", description: "Annual travel and lounge" }
  ];

  const categoryQuestions = {
    all: [
      { key: "amazon_spends", label: "Amazon Monthly Spending", min: 0, max: 50000, step: 500 },
      { key: "flipkart_spends", label: "Flipkart Monthly Spending", min: 0, max: 50000, step: 500 },
      { key: "grocery_spends_online", label: "Online Grocery Monthly Spending", min: 0, max: 25000, step: 250 },
      { key: "online_food_ordering", label: "Food Delivery Monthly Spending", min: 0, max: 15000, step: 250 },
      { key: "other_online_spends", label: "Other Online Monthly Spending", min: 0, max: 25000, step: 500 },
      { key: "other_offline_spends", label: "Other Offline Monthly Spending", min: 0, max: 25000, step: 500 },
      { key: "dining_or_going_out", label: "Dining/Going Out Monthly Spending", min: 0, max: 20000, step: 250 },
      { key: "fuel", label: "Fuel Monthly Spending", min: 0, max: 15000, step: 250 },
      { key: "school_fees", label: "School Fees Annual", min: 0, max: 200000, step: 5000 },
      { key: "rent", label: "Rent Monthly", min: 0, max: 100000, step: 2500 },
      { key: "mobile_phone_bills", label: "Mobile Bills Monthly", min: 0, max: 5000, step: 100 },
      { key: "electricity_bills", label: "Electricity Bills Monthly", min: 0, max: 15000, step: 250 },
      { key: "water_bills", label: "Water Bills Monthly", min: 0, max: 5000, step: 100 },
      { key: "ott_channels", label: "OTT Subscriptions Monthly", min: 0, max: 3000, step: 100 },
      { key: "hotels_annual", label: "Hotels Annual Spending", min: 0, max: 300000, step: 10000 },
      { key: "flights_annual", label: "Flights Annual Spending", min: 0, max: 300000, step: 10000 },
      { key: "insurance_health_annual", label: "Health Insurance Annual", min: 0, max: 200000, step: 5000 },
      { key: "insurance_car_or_bike_annual", label: "Vehicle Insurance Annual", min: 0, max: 100000, step: 2500 },
      { key: "large_electronics_purchase_like_mobile_tv_etc", label: "Electronics Purchase Annual", min: 0, max: 500000, step: 10000 }
    ],
    shopping: [
      { key: "amazon_spends", label: "Amazon Monthly Spending", min: 0, max: 50000, step: 500 },
      { key: "flipkart_spends", label: "Flipkart Monthly Spending", min: 0, max: 50000, step: 500 },
      { key: "other_online_spends", label: "Other Online Monthly Spending", min: 0, max: 25000, step: 500 },
      { key: "other_offline_spends", label: "Other Offline Monthly Spending", min: 0, max: 25000, step: 500 }
    ],
    utility: [
      { key: "mobile_phone_bills", label: "Mobile Bills Monthly", min: 0, max: 5000, step: 100 },
      { key: "electricity_bills", label: "Electricity Bills Monthly", min: 0, max: 15000, step: 250 },
      { key: "water_bills", label: "Water Bills Monthly", min: 0, max: 5000, step: 100 },
      { key: "insurance_health_annual", label: "Health Insurance Annual", min: 0, max: 200000, step: 5000 },
      { key: "insurance_car_or_bike_annual", label: "Vehicle Insurance Annual", min: 0, max: 100000, step: 2500 },
      { key: "school_fees", label: "School Fees Annual", min: 0, max: 200000, step: 5000 },
      { key: "rent", label: "Rent Monthly", min: 0, max: 100000, step: 2500 }
    ],
    grocery: [
      { key: "grocery_spends_online", label: "Online Grocery Monthly Spending", min: 0, max: 25000, step: 250 }
    ],
    fuel: [
      { key: "fuel", label: "Fuel Monthly Spending", min: 0, max: 15000, step: 250 }
    ],
    "food-ordering": [
      { key: "online_food_ordering", label: "Food Delivery Monthly Spending", min: 0, max: 15000, step: 250 }
    ],
    dining: [
      { key: "dining_or_going_out", label: "Dining/Going Out Monthly Spending", min: 0, max: 20000, step: 250 }
    ],
    travel: [
      { key: "hotels_annual", label: "Hotels Annual Spending", min: 0, max: 300000, step: 10000 },
      { key: "flights_annual", label: "Flights Annual Spending", min: 0, max: 300000, step: 10000 },
      { key: "domestic_lounge_usage_quarterly", label: "Domestic Lounge Usage Quarterly", min: 0, max: 50, step: 1 },
      { key: "international_lounge_usage_quarterly", label: "International Lounge Usage Quarterly", min: 0, max: 30, step: 1 }
    ]
  };

  useEffect(() => {
    fetchAllCards();
  }, []);

  const fetchAllCards = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://bk-api.bankkaro.com/sp/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: "",
          banks_ids: [],
          card_networks: [],
          annualFees: "",
          credit_score: "",
          sort_by: "",
          free_cards: "",
          eligiblityPayload: {},
          cardGeniusPayload: {}
        }),
      });
      const data = await response.json();
      setCards(data.cards || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setResults(null);
    const categoryQs = categoryQuestions[categoryId as keyof typeof categoryQuestions] || [];
    const initialQuestions = {};
    categoryQs.forEach(q => {
      initialQuestions[q.key] = [0];
    });
    setQuestions(initialQuestions);
  };

  const handleQuestionAnswer = (key: string, value: number[]) => {
    setQuestions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    const categoryQs = categoryQuestions[selectedCategory as keyof typeof categoryQuestions] || [];
    if (currentQuestionIndex < categoryQs.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResults = async () => {
    setLoading(true);
    try {
      const payload = {
        ...Object.keys(questions).reduce((acc, key) => {
          acc[key] = questions[key][0];
          return acc;
        }, {} as any),
        selected_card_id: null
      };

      const response = await fetch('https://card-recommendation-api-v2.bankkaro.com/cg/api/pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentQuestions = categoryQuestions[selectedCategory as keyof typeof categoryQuestions] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Reward Calculator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a card and calculate your potential rewards based on spending patterns
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Step 1: Card Selection */}
        {!selectedCard && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Select a Credit Card</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCard} onValueChange={setSelectedCard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a credit card to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {cards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Tabs with Card Details and Calculator */}
        {selectedCard && (
          <Tabs defaultValue="details" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Card Details</TabsTrigger>
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Card Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {cards.find(card => card.id === selectedCard) && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">
                        {cards.find(card => card.id === selectedCard)?.name}
                      </h3>
                      <p className="text-muted-foreground">
                        Detailed card information will be displayed here based on the selected card.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator">
              <div className="space-y-6">
                {/* Category Selection */}
                {!selectedCategory && (
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Choose Spending Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {categories.map((category) => (
                          <Card 
                            key={category.id} 
                            className="cursor-pointer hover-lift border-2 hover:border-primary transition-colors"
                            onClick={() => handleCategorySelect(category.id)}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-foreground">{category.label}</h4>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Questions Flow */}
                {selectedCategory && !results && currentQuestion && (
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{currentQuestion.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {currentQuestionIndex + 1} of {currentQuestions.length}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Slider
                          value={questions[currentQuestion.key] || [0]}
                          onValueChange={(value) => handleQuestionAnswer(currentQuestion.key, value)}
                          max={currentQuestion.max}
                          min={currentQuestion.min}
                          step={currentQuestion.step}
                          className="w-full"
                        />
                        <div className="text-center">
                          <span className="text-2xl font-bold text-primary">
                            ₹{(questions[currentQuestion.key]?.[0] || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={handlePrevious}
                          disabled={currentQuestionIndex === 0}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                        <Button onClick={handleNext} disabled={loading}>
                          {currentQuestionIndex === currentQuestions.length - 1 ? (
                            loading ? "Calculating..." : "Calculate Results"
                          ) : (
                            <>
                              Next
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results */}
                {results && (
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Calculation Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-lg">
                          Based on your spending patterns, here are your potential rewards:
                        </p>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <pre className="text-sm">
                            {JSON.stringify(results, null, 2)}
                          </pre>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedCategory("");
                            setResults(null);
                            setCurrentQuestionIndex(0);
                          }}
                        >
                          Try Another Category
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CalculatorPage;
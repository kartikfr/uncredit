import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, X, CreditCard, Star, Check, Minus, ArrowRight } from "lucide-react";

const Compare = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  // Mock card data
  const allCards = [
    {
      id: "1",
      name: "Amazon Pay ICICI Credit Card",
      bank: "ICICI Bank",
      annualFee: "Free",
      network: "Visa",
      rewards: "5% on Amazon",
      rating: 4.5,
      joinFee: "₹0",
      ageRequirement: "21-65 years",
      incomeRequirement: "₹25,000/month",
      benefits: {
        shopping: "5% on Amazon, 2% on others",
        dining: "2% on dining",
        fuel: "2% on fuel",
        travel: "1% on travel",
        lounge: "None",
        insurance: "None"
      }
    },
    {
      id: "2", 
      name: "HDFC Regalia Credit Card",
      bank: "HDFC Bank",
      annualFee: "₹2,500",
      network: "Visa",
      rewards: "4 Reward Points per ₹150",
      rating: 4.3,
      joinFee: "₹2,500",
      ageRequirement: "21-60 years",
      incomeRequirement: "₹1,00,000/month",
      benefits: {
        shopping: "2 points per ₹150",
        dining: "4 points per ₹150",
        fuel: "2 points per ₹150",
        travel: "4 points per ₹150",
        lounge: "Domestic & International",
        insurance: "Travel insurance included"
      }
    },
    {
      id: "3",
      name: "SBI SimplyCLICK Credit Card",
      bank: "SBI",
      annualFee: "₹499",
      network: "Visa",
      rewards: "10X on online spends",
      rating: 4.1,
      joinFee: "₹499",
      ageRequirement: "21-70 years",
      incomeRequirement: "₹20,000/month",
      benefits: {
        shopping: "10X rewards online",
        dining: "5X on dining",
        fuel: "1X on fuel",
        travel: "2X on travel",
        lounge: "None",
        insurance: "None"
      }
    }
  ];

  const filteredCards = allCards.filter(card => 
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const comparedCards = allCards.filter(card => selectedCards.includes(card.id));

  const addToCompare = (cardId: string) => {
    if (selectedCards.length < 4 && !selectedCards.includes(cardId)) {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  const removeFromCompare = (cardId: string) => {
    setSelectedCards(selectedCards.filter(id => id !== cardId));
  };

  const comparisonCategories = [
    { key: "basic", label: "Basic Information" },
    { key: "rewards", label: "Rewards & Benefits" },
    { key: "eligibility", label: "Eligibility" },
    { key: "features", label: "Features" }
  ];

  const getComparisonIcon = (value: string, bestValue: string) => {
    if (value === bestValue) {
      return <Check className="h-4 w-4 text-success" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Compare Credit Cards
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Side-by-side comparison to help you make the perfect choice. Add up to 4 cards to compare.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {selectedCards.length === 0 ? (
          // Card Selection Interface
          <div className="space-y-8">
            {/* Search Bar */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search for cards to compare..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card, index) => (
                <Card 
                  key={card.id} 
                  className="hover-lift shadow-card animate-slide-up"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Card Visual */}
                      <div className="w-full h-32 bg-gradient-primary rounded-lg flex items-center justify-center relative">
                        <CreditCard className="h-12 w-12 text-white" />
                        <Badge className="absolute top-2 right-2 bg-white text-primary">
                          {card.annualFee}
                        </Badge>
                      </div>

                      {/* Card Info */}
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{card.name}</h3>
                        <p className="text-sm text-muted-foreground">{card.bank}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-accent text-accent mr-1" />
                          <span className="text-sm font-medium">{card.rating}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {card.network}
                        </Badge>
                      </div>

                      <div className="bg-accent/10 p-3 rounded-lg">
                        <p className="text-sm font-medium text-accent">{card.rewards}</p>
                      </div>

                      <Button 
                        onClick={() => addToCompare(card.id)}
                        disabled={selectedCards.includes(card.id) || selectedCards.length >= 4}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {selectedCards.includes(card.id) ? "Added" : "Add to Compare"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Comparison Interface
          <div className="space-y-8">
            {/* Comparison Header */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Comparing {selectedCards.length} Card{selectedCards.length > 1 ? 's' : ''}
                    </h2>
                    <p className="text-muted-foreground">
                      Side-by-side analysis of your selected credit cards
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedCards([])}
                    >
                      Start Over
                    </Button>
                    <Button>
                      Export Comparison
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Table */}
            <Card className="shadow-card">
              <CardContent className="p-0">
                <Tabs defaultValue="basic" className="w-full">
                  <div className="border-b">
                    <TabsList className="grid w-full grid-cols-4 h-14">
                      {comparisonCategories.map((category) => (
                        <TabsTrigger 
                          key={category.key} 
                          value={category.key}
                          className="text-sm font-medium"
                        >
                          {category.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <TabsContent value="basic" className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-4 font-medium">Feature</th>
                            {comparedCards.map((card) => (
                              <th key={card.id} className="text-center p-4 min-w-[200px]">
                                <div className="space-y-2">
                                  <div className="w-16 h-10 bg-gradient-primary rounded mx-auto flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">{card.name}</p>
                                    <p className="text-xs text-muted-foreground">{card.bank}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFromCompare(card.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Annual Fee</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">
                                <Badge variant={card.annualFee === "Free" ? "default" : "secondary"}>
                                  {card.annualFee}
                                </Badge>
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Joining Fee</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">{card.joinFee}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Network</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">{card.network}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Rating</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">
                                <div className="flex items-center justify-center">
                                  <Star className="h-4 w-4 fill-accent text-accent mr-1" />
                                  {card.rating}
                                </div>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="rewards" className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-4 font-medium">Category</th>
                            {comparedCards.map((card) => (
                              <th key={card.id} className="text-center p-4 min-w-[200px]">
                                {card.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Shopping Rewards</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">{card.benefits.shopping}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Dining Rewards</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">{card.benefits.dining}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Travel Rewards</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">{card.benefits.travel}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Fuel Rewards</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">{card.benefits.fuel}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Lounge Access</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">
                                <Badge variant={card.benefits.lounge !== "None" ? "default" : "secondary"}>
                                  {card.benefits.lounge}
                                </Badge>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="eligibility" className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-4 font-medium">Requirement</th>
                            {comparedCards.map((card) => (
                              <th key={card.id} className="text-center p-4 min-w-[200px]">
                                {card.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Age Requirement</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">{card.ageRequirement}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Income Requirement</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">{card.incomeRequirement}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-4 font-medium">Feature</th>
                            {comparedCards.map((card) => (
                              <th key={card.id} className="text-center p-4 min-w-[200px]">
                                {card.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-4 font-medium">Insurance Coverage</td>
                            {comparedCards.map((card) => (
                              <td key={card.id} className="p-4 text-center">
                                <Badge variant={card.benefits.insurance !== "None" ? "default" : "secondary"}>
                                  {card.benefits.insurance}
                                </Badge>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparedCards.map((card) => (
                <Card key={card.id} className="shadow-card">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold text-foreground mb-2">{card.name}</h4>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Apply Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, ArrowRight } from "lucide-react";

const BeatMyCard = () => {
  const [selectedCard, setSelectedCard] = useState("");
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Beat My Card
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find out which card would save you more money compared to your current card
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Select Your Current Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select value={selectedCard} onValueChange={setSelectedCard}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your current credit card" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hdfc-regalia">HDFC Regalia Credit Card</SelectItem>
                  <SelectItem value="sbi-simply-click">SBI SimplyCLICK Credit Card</SelectItem>
                  <SelectItem value="icici-amazon-pay">Amazon Pay ICICI Credit Card</SelectItem>
                  <SelectItem value="axis-neo">Axis Bank Neo Credit Card</SelectItem>
                </SelectContent>
              </Select>

              {selectedCard && (
                <div className="text-center animate-fade-in">
                  <Button 
                    size="lg"
                    onClick={() => setShowComparison(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Start Comparison Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {showComparison && (
                <div className="mt-8 p-6 bg-muted/30 rounded-lg animate-slide-up">
                  <h3 className="text-lg font-semibold mb-4">Comparison Analysis</h3>
                  <p className="text-muted-foreground">
                    Analysis will be shown here after implementing the Card Genius questions flow.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeatMyCard;
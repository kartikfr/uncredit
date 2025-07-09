
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const SearchHeader = ({ searchQuery, onSearchChange }: SearchHeaderProps) => {
  return (
    <section className="bg-gradient-subtle py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            All Credit Cards
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the perfect credit card for your needs with AI-powered insights
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for cards or banks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 text-base border-2 border-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

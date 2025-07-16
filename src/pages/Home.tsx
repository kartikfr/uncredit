
import { HeroSection } from "@/components/home/HeroSection";
import { USPFeaturesSection } from "@/components/home/USPFeaturesSection";
import { FeaturedCategoriesSection } from "@/components/home/FeaturedCategoriesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <HeroSection />
      <USPFeaturesSection />
      <FeaturedCategoriesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};

export default Home;

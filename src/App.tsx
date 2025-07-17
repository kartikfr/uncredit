
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import AllCards from "./pages/AllCards";
import CardDetail from "./pages/CardDetail";
import Calculator from "./pages/Calculator";
import CardGenius from "./pages/CardGenius";
import Compare from "./pages/Compare";
import BeatMyCard from "./pages/BeatMyCard";
import NotFound from "./pages/NotFound";
import CreateContent from "./pages/CreateContent";

const queryClient = new QueryClient();

// Environment check for debugging
console.log('🔧 App.tsx: Environment check:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
  VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? 'Set' : 'Not set'
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/all-cards" element={<AllCards />} />
          <Route path="/card/:id" element={<CardDetail />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/genius" element={<CardGenius />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/beat-my-card" element={<BeatMyCard />} />
          <Route path="/create-content" element={<CreateContent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

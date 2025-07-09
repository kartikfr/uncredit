
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

const queryClient = new QueryClient();

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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  CreditCard, 
  Search, 
  Menu, 
  X, 
  Calculator, 
  Sparkles, 
  GitCompare, 
  Trophy, 
  Home,
  BarChart3,
  Target,
  Zap,
  Crown,
  TrendingUp,
  Award,
  Shield,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Enhanced navigation items with better icons and descriptions
  const navigationItems = [
    { 
      name: "All Cards", 
      path: "/all-cards", 
      icon: CreditCard,
      description: "Browse all credit cards",
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700"
    },
    { 
      name: "Calculator", 
      path: "/calculator", 
      icon: Calculator,
      description: "Calculate your savings",
      color: "from-emerald-500 to-teal-600",
      hoverColor: "from-emerald-600 to-teal-700"
    },
    { 
      name: "Card Genius", 
      path: "/genius", 
      icon: Sparkles,
      description: "AI-powered recommendations",
      color: "from-purple-500 to-indigo-600",
      hoverColor: "from-purple-600 to-indigo-700"
    },
    { 
      name: "Compare", 
      path: "/all-cards?mode=compare", 
      icon: GitCompare,
      description: "Compare credit cards",
      color: "from-orange-500 to-red-600",
      hoverColor: "from-orange-600 to-red-700"
    },
    { 
      name: "Beat My Card", 
      path: "/beat-my-card", 
      icon: Trophy,
      description: "Find better alternatives",
      color: "from-yellow-500 to-amber-600",
      hoverColor: "from-yellow-600 to-amber-700"
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-100'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Enhanced Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-2 w-2 text-white" />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CardGenius
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                AI-Powered Credit Cards
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isItemActive = isActive(item.path);
              
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`group relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isItemActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-all duration-300 ${
                      isItemActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    <span>{item.name}</span>
                    
                    {/* Hover effect */}
                    {!isItemActive && (
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${item.hoverColor} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        initial={false}
                      />
                    )}
                    
                    {/* Active indicator */}
                    {isItemActive && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Enhanced Search */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Toggle Button */}
            <motion.button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="h-5 w-5 text-gray-600" />
            </motion.button>

            {/* Enhanced CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="sm" 
                className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link to="/all-cards" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Find Best Card</span>
                </Link>
              </Button>
            </motion.div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <motion.button
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </motion.button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px] bg-white/95 backdrop-blur-md">
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      CardGenius
                    </span>
                  </div>

                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navigationItems.map((item, index) => {
                      const Icon = item.icon;
                      const isItemActive = isActive(item.path);
                      
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Link
                            to={item.path}
                            className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                              isItemActive
                                ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isItemActive 
                                ? 'bg-white/20' 
                                : `bg-gradient-to-r ${item.color} bg-opacity-10`
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                isItemActive ? 'text-white' : `text-gray-600`
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{item.name}</div>
                              <div className={`text-xs ${
                                isItemActive ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Mobile CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                      asChild
                    >
                      <Link to="/all-cards" className="flex items-center justify-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Find Best Card</span>
                      </Link>
                    </Button>
                  </motion.div>

                  {/* Mobile Badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    className="text-center"
                  >
                    <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI-Powered
                    </Badge>
                  </motion.div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
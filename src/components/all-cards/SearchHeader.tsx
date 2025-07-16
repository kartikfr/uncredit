
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Target, TrendingUp, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void; // <-- add this
}

export const SearchHeader = ({ searchQuery, onSearchChange, onSearchSubmit }: SearchHeaderProps) => {
  // Handler for Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Content */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium text-white/90">AI-Powered Card Discovery</span>
          </motion.div>
          
          <motion.h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Discover Your Perfect
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Credit Card
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Explore 53+ credit cards with intelligent filtering, AI-powered insights, and personalized recommendations
          </motion.p>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-2">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  placeholder="Search cards, banks, features, networks, fees, or categories..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-gray-900 placeholder-gray-500 text-base focus:ring-0 focus:outline-none h-12"
                  onKeyDown={handleKeyDown}
                />
                <div className="flex-shrink-0 pr-3">
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onSearchSubmit}
                  >
                    <Target className="h-4 w-4 text-white" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div 
            className="text-center group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Smart Filtering</h3>
            <p className="text-white/70 text-sm">Advanced filters for fees, rewards, and eligibility</p>
          </motion.div>
          
          <motion.div 
            className="text-center group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">AI Insights</h3>
            <p className="text-white/70 text-sm">Get personalized recommendations and insights</p>
          </motion.div>
          
          <motion.div 
            className="text-center group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Quick Compare</h3>
            <p className="text-white/70 text-sm">Compare up to 3 cards side by side</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

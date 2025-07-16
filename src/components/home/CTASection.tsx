
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Target, ArrowRight, CheckCircle, Crown, Star, TrendingUp, Sparkles as SparklesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const CTASection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute top-20 right-20 w-24 h-24 bg-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-40 h-40 bg-white/5 rounded-full"
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-20 h-20 bg-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 mb-6 backdrop-blur-sm">
              <Crown className="w-4 h-4 mr-2" />
              Start Your Journey Today
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Ready to Find Your Perfect 
            <span className="text-yellow-300"> Credit Card?</span>
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Join thousands of creators who've saved millions with AI-powered recommendations
          </motion.p>
          
          {/* Features List */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div 
              className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm p-3 rounded-lg"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm font-medium">AI-Powered</span>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm p-3 rounded-lg"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <TrendingUp className="h-5 w-5 text-blue-300" />
              <span className="text-sm font-medium">Save ₹50K/year</span>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm p-3 rounded-lg"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <Star className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium">95% Success</span>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg px-8 py-4 group shadow-lg"
                asChild
              >
                <Link to="/genius">
                  <SparklesIcon className="mr-2 h-5 w-5" />
                  Find Your Perfect Card
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/50 text-white hover:bg-white/20 backdrop-blur-sm font-semibold text-lg px-8 py-4 shadow-lg bg-white/5"
                asChild
              >
                <Link to="/all-cards">
                  <Zap className="mr-2 h-5 w-5" />
                  Browse All Cards
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div 
            className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm opacity-80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle className="h-4 w-4 text-green-300" />
              <span>Free to Use</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle className="h-4 w-4 text-green-300" />
              <span>No Credit Check</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle className="h-4 w-4 text-green-300" />
              <span>Instant Results</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

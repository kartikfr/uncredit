import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Lightbulb, Wand2, Copy, Check, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { contentCreationService, GeneratedContent } from '@/services/contentCreation';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptGeneratorProps {
  platforms: string[];
  selectedCards: string[];
  tone: string;
  selectedFormat?: any;
  onContentGenerated: (content: GeneratedContent) => void;
}

const getPromptSuggestions = (format: any) => {
  const baseSuggestions = {
    'full-post': [
      'Compare the best credit cards for dining rewards',
      'Which card offers better travel benefits?',
      'How to maximize credit card rewards',
      'Review of premium credit cards',
      'Understanding credit card rewards programs'
    ],
    'carousel': [
      'Top 5 credit cards for travel in 2024',
      'Credit card comparison: Cashback vs Points',
      'Best credit cards by spending category',
      'Credit card fees breakdown',
      'How to choose your first credit card'
    ],
    'single-tweet': [
      'Best credit card for dining?',
      'Travel credit card comparison',
      'Credit card rewards tips',
      'Annual fee worth it?',
      'Credit score impact'
    ],
    'thread': [
      'Credit card comparison thread',
      'How to maximize rewards',
      'Credit card myths debunked',
      'Travel hacking with credit cards',
      'Credit card security tips'
    ],
    'caption': [
      'Credit card comparison guide',
      'Best rewards cards revealed',
      'Credit card tips and tricks',
      'Travel benefits comparison',
      'Credit card selection guide'
    ],
    'reel': [
      'Credit card comparison in 60 seconds',
      'Quick credit card tips',
      'Credit card myths busted',
      'Travel rewards explained',
      'Credit card selection guide'
    ],
    'full-video': [
      'Complete credit card comparison guide',
      'How to choose the best credit card',
      'Credit card rewards explained',
      'Travel credit cards deep dive',
      'Credit card fees and benefits analysis'
    ],
    'shorts': [
      'Credit card comparison quick tip',
      'Best credit card for travel',
      'Credit card rewards hack',
      'Credit card selection tip',
      'Credit card benefits explained'
    ]
  };

  return baseSuggestions[format?.id] || baseSuggestions['full-post'];
};

export default function PromptGenerator({ 
  platforms, 
  selectedCards, 
  tone, 
  selectedFormat,
  onContentGenerated 
}: PromptGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const generateContent = async () => {
    console.log('🚀 PromptGenerator: Starting content generation...');
    console.log('📋 Current state:', {
      prompt: prompt.trim(),
      selectedCards: selectedCards,
      platforms: platforms,
      tone: tone
    });

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (selectedCards.length === 0) {
      setError('Please select at least one credit card');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🤖 PromptGenerator: Calling contentCreationService.generateContent...');
      
      const content = await contentCreationService.generateContent({
        platforms,
        selectedCards,
        tone,
        prompt: prompt.trim(),
        selectedFormat
      });

      console.log('✅ PromptGenerator: Content generated successfully:', {
        id: content.id,
        platforms: content.platforms,
        contentKeys: Object.keys(content.content),
        contentPreview: Object.entries(content.content).map(([platform, text]) => ({
          platform,
          length: text.length,
          preview: text.substring(0, 100) + '...'
        })),
        fullContentStructure: content.content
      });

      // Debug: Log the actual content for verification
      Object.entries(content.content).forEach(([platform, text]) => {
        console.log(`📄 ${platform} Content (${text.length} chars):`, text);
      });

      setGeneratedContent(content);
      setShowSuccess(true);
      
      console.log('📤 PromptGenerator: Calling onContentGenerated callback...');
      onContentGenerated(content);
      
      // Auto-progress to editor after a short delay
      setTimeout(() => {
        console.log('🔄 PromptGenerator: Auto-progressing to editor...');
        onContentGenerated(content);
      }, 2000);
    } catch (err) {
      console.error('❌ PromptGenerator: Content generation error:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Generate content on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generateContent();
    }
    // Also allow just Enter for quick generation
    else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateContent();
    }
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const regenerateContent = async () => {
    if (generatedContent) {
      setGeneratedContent(null);
      setShowSuccess(false);
      await generateContent();
    }
  };

  const useSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    setError(null);
    // Focus back to textarea after selecting suggestion
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            Content Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Describe what content you want to create
            </label>
            <Textarea
              ref={textareaRef}
              placeholder="e.g., Create a comparison post about the best credit cards for dining rewards, highlighting the key benefits and helping readers choose the right card for their spending habits..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px] resize-none"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Press Enter or Ctrl+Enter to generate</span>
              <span>{prompt.length} characters</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Selected Cards: {selectedCards.length}</span>
              <span>•</span>
              <span>Platforms: {platforms.join(', ')}</span>
              <span>•</span>
              <span>Tone: {tone}</span>
            </div>
            <Button
              onClick={generateContent}
              disabled={isGenerating || !prompt.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Need inspiration? Try one of these popular prompt templates:
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">
                Suggested Prompts for {selectedFormat?.name || 'Content'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {getPromptSuggestions(selectedFormat).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => useSuggestion(suggestion)}
                    className="text-xs h-auto py-2 px-3 text-left"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">Content generated successfully!</p>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Redirecting to editor in a few seconds...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    Generated Content
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={regenerateContent}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button
                      onClick={() => onContentGenerated(generatedContent)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Continue to Editor
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {platforms.map((platform) => {
                  const content = generatedContent.content[platform.toLowerCase()] || 
                                 generatedContent.content[platform] ||
                                 'Content not available for this platform';
                  
                  return (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {platform}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {content.length} characters
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(content, platform)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedPlatform === platform ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="bg-gray-50 border rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm font-sans">
                          {content}
                        </pre>
                      </div>
                    </div>
                  );
                })}

                {/* References */}
                {generatedContent.references && generatedContent.references.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-800 mb-2">References</h4>
                    <div className="space-y-1">
                      {generatedContent.references.map((ref, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {ref.text} ({ref.source})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Tips for Better Content</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be specific about what you want to highlight</li>
                <li>• Mention your target audience</li>
                <li>• Include any specific requirements or preferences</li>
                <li>• Ask for specific formats (comparison, review, tips, etc.)</li>
                <li>• Press Enter or Ctrl+Enter to quickly generate content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
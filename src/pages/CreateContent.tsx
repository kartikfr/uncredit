import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight,
  ArrowLeft,
  Users,
  TrendingUp,
  Calendar,
  History,
  Settings,
  Plus,
  CheckCircle,
  AlertCircle,
  Play,
  Image,
  FileText,
  MessageSquare,
  Video,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import CardSelector from "@/components/content-creation/CardSelector";
import ProfileIngestion from "@/components/content-creation/ProfileIngestion";
import PromptGenerator from "@/components/content-creation/PromptGenerator";
import ContentEditor from "@/components/content-creation/ContentEditor";
import ContentScheduler from "@/components/content-creation/ContentScheduler";
import ContentHistory from "@/components/content-creation/ContentHistory";
import StepIndicator from "@/components/content-creation/StepIndicator";
import { contentCreationService, GeneratedContent } from "@/services/contentCreation";


// Platform and format definitions
const platforms = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'from-blue-600 to-blue-700',
    description: 'Professional networking platform',
    formats: [
      { id: 'full-post', name: 'Full Post', icon: FileText, description: 'Long-form professional content', maxChars: 3000 },
      { id: 'carousel', name: 'Carousel', icon: Image, description: 'Multi-slide visual content', maxChars: 3000 },
      { id: 'article', name: 'Article', icon: FileText, description: 'Detailed long-form article', maxChars: 100000 },
      { id: 'story', name: 'Story', icon: Play, description: 'Short-lived visual content', maxChars: 1000 }
    ]
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'from-black to-gray-800',
    description: 'Real-time microblogging',
    formats: [
      { id: 'single-tweet', name: 'Single Tweet', icon: MessageSquare, description: 'One concise message', maxChars: 280 },
      { id: 'thread', name: 'Thread', icon: MessageSquare, description: 'Connected series of tweets', maxChars: 280 }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'from-purple-600 to-pink-600',
    description: 'Visual storytelling platform',
    formats: [
      { id: 'caption', name: 'Caption', icon: FileText, description: 'Post description text', maxChars: 2200 },
      { id: 'story', name: 'Story', icon: Play, description: 'Short-lived visual content', maxChars: 1000 },
      { id: 'reel', name: 'Reel', icon: Video, description: 'Short-form video content', maxChars: 2200 },
      { id: 'carousel', name: 'Carousel', icon: Image, description: 'Multi-image post', maxChars: 2200 }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'from-red-600 to-red-700',
    description: 'Video content platform',
    formats: [
      { id: 'full-video', name: 'Full Video', icon: Video, description: 'Long-form video content', maxChars: 5000 },
      { id: 'shorts', name: 'Shorts', icon: Video, description: 'Short-form vertical video', maxChars: 1000 }
    ]
  }
];

export default function CreateContent() {
  const [currentStep, setCurrentStep] = useState<'dashboard' | 'platform' | 'cards' | 'tone' | 'prompt' | 'editor' | 'schedule' | 'history'>('dashboard');
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [detectedTone, setDetectedTone] = useState<string>('professional');
  const [profileData, setProfileData] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [contentHistory, setContentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);


  useEffect(() => {
    loadContentHistory();
  }, []);

  const loadContentHistory = async () => {
    try {
      const history = await contentCreationService.getContentHistory();
      setContentHistory(history);
    } catch (error) {
      console.error('Failed to load content history:', error);
    }
  };

  const handlePlatformSelect = (platform: any) => {
    setSelectedPlatform(platform);
    setCurrentStep('platform');
    setCompletedSteps(prev => [...new Set([...prev, 'dashboard'])]);
    scrollToTop();
  };

  const handleFormatSelect = (format: any) => {
    setSelectedFormat(format);
    setCurrentStep('cards');
    setCompletedSteps(prev => [...new Set([...prev, 'platform'])]);
    scrollToTop();
  };

  const handleContentGenerated = (content: GeneratedContent) => {
    console.log('📥 CreateContent: handleContentGenerated called with:', {
      id: content.id,
      platforms: content.platforms,
      contentKeys: Object.keys(content.content),
      contentPreview: Object.entries(content.content).map(([platform, text]) => ({
        platform,
        length: text.length,
        preview: text.substring(0, 50) + '...'
      }))
    });
    
    setGeneratedContent(content);
    setCurrentStep('editor');
    setCompletedSteps(prev => [...new Set([...prev, 'prompt'])]);
    scrollToTop();
    
    console.log('✅ CreateContent: Content set and step changed to editor');
  };

  const handleStepClick = (stepId: string) => {
    // Only allow navigation to current or previous steps
    const stepOrder = ['dashboard', 'platform', 'cards', 'tone', 'prompt', 'editor', 'schedule', 'history'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(stepId);
    
    if (targetIndex <= currentIndex) {
      setCurrentStep(stepId as any);
      scrollToTop();
    }
  };

  const handleContentUpdate = (updatedContent: GeneratedContent) => {
    setGeneratedContent(updatedContent);
  };

  const handleSaveContent = async () => {
    if (generatedContent) {
      try {
        await contentCreationService.saveDraft(generatedContent);
        await loadContentHistory();
      } catch (error) {
        console.error('Failed to save content:', error);
      }
    }
  };

  const handleScheduleContent = async (scheduledFor: Date) => {
    if (generatedContent) {
      try {
        await contentCreationService.scheduleContent(generatedContent.id, scheduledFor);
        await loadContentHistory();
      } catch (error) {
        console.error('Failed to schedule content:', error);
      }
    }
  };

  const handlePublishContent = async () => {
    if (generatedContent) {
      try {
        await contentCreationService.publishContent(generatedContent.id);
        await loadContentHistory();
      } catch (error) {
        console.error('Failed to publish content:', error);
      }
    }
  };

  const handleExportContent = async (format: 'txt' | 'json' | 'pdf') => {
    if (generatedContent) {
      try {
        const exported = await contentCreationService.exportContent(generatedContent, format);
        // Handle download
        const blob = new Blob([exported], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-export.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export content:', error);
      }
    }
  };



  const canProceedToNext = () => {
    switch (currentStep) {
      case 'dashboard': return selectedPlatform !== null;
      case 'platform': return selectedFormat !== null;
      case 'cards': return selectedCards.length > 0;
      case 'tone': return detectedTone !== '';
      case 'prompt': return generatedContent !== null;
      default: return true;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'dashboard':
        if (selectedPlatform) {
          setCurrentStep('platform');
          setCompletedSteps(prev => [...new Set([...prev, 'dashboard'])]);
          scrollToTop();
        }
        break;
      case 'platform':
        if (selectedFormat) {
          setCurrentStep('cards');
          setCompletedSteps(prev => [...new Set([...prev, 'platform'])]);
          scrollToTop();
        }
        break;
      case 'cards':
        setCurrentStep('tone');
        setCompletedSteps(prev => [...new Set([...prev, 'cards'])]);
        scrollToTop();
        break;
      case 'tone':
        setCurrentStep('prompt');
        setCompletedSteps(prev => [...new Set([...prev, 'tone'])]);
        scrollToTop();
        break;
      case 'prompt':
        if (generatedContent) {
          setCurrentStep('editor');
          setCompletedSteps(prev => [...new Set([...prev, 'prompt'])]);
          scrollToTop();
        }
        break;
      case 'editor':
        setCurrentStep('schedule');
        setCompletedSteps(prev => [...new Set([...prev, 'editor'])]);
        scrollToTop();
        break;
      case 'schedule':
        setCurrentStep('history');
        setCompletedSteps(prev => [...new Set([...prev, 'schedule'])]);
        scrollToTop();
        break;
    }
  };

  const handlePrevious = () => {
    switch (currentStep) {
      case 'platform':
        setCurrentStep('dashboard');
        scrollToTop();
        break;
      case 'cards':
        setCurrentStep('platform');
        scrollToTop();
        break;
      case 'tone':
        setCurrentStep('cards');
        scrollToTop();
        break;
      case 'prompt':
        setCurrentStep('tone');
        scrollToTop();
        break;
      case 'editor':
        setCurrentStep('prompt');
        scrollToTop();
        break;
      case 'schedule':
        setCurrentStep('editor');
        scrollToTop();
        break;
      case 'history':
        setCurrentStep('schedule');
        scrollToTop();
        break;
    }
  };

  const resetFlow = () => {
    setSelectedPlatform(null);
    setSelectedFormat(null);
    setSelectedCards([]);
    setDetectedTone('professional');
    setProfileData(null);
    setGeneratedContent(null);
    setCurrentStep('dashboard');
    setCompletedSteps([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Content Creator Studio
              </h1>
              <p className="text-gray-600">AI-powered content creation for credit card creators</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setCurrentStep('history')}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="outline" onClick={resetFlow}>
              <Plus className="h-4 w-4 mr-2" />
              New Content
            </Button>
          </div>
        </div>

        {/* Step Indicator */}
        {currentStep !== 'dashboard' && (
          <StepIndicator
            currentStep={currentStep}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />
        )}

        {/* Dashboard View */}
        {currentStep === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Platform Selection */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Platform</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <motion.div
                      key={platform.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-emerald-300"
                        onClick={() => handlePlatformSelect(platform)}
                      >
                        <CardHeader className="text-center pb-4">
                          <div className={`w-16 h-16 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <CardTitle className="text-xl">{platform.name}</CardTitle>
                          <p className="text-gray-600 text-sm">{platform.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Available Formats:</p>
                            <div className="flex flex-wrap gap-1">
                              {platform.formats.slice(0, 2).map((format) => (
                                <Badge key={format.id} variant="secondary" className="text-xs">
                                  {format.name}
                                </Badge>
                              ))}
                              {platform.formats.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{platform.formats.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Content Created</p>
                      <p className="text-2xl font-bold text-blue-800">{contentHistory.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Platforms</p>
                      <p className="text-2xl font-bold text-green-800">{platforms.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">AI Powered</p>
                      <p className="text-2xl font-bold text-purple-800">100%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Platform Format Selection */}
        {currentStep === 'platform' && selectedPlatform && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Choose Your Content Format
              </h2>
              <p className="text-gray-600">
                Select the type of content you want to create for {selectedPlatform.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedPlatform.formats.map((format: any) => {
                const Icon = format.icon;
                return (
                  <motion.div
                    key={format.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-emerald-300"
                      onClick={() => handleFormatSelect(format)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{format.name}</CardTitle>
                        <p className="text-gray-600 text-sm">{format.description}</p>
                      </CardHeader>
                      <CardContent className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {format.maxChars.toLocaleString()} chars max
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Card Selection */}
        {currentStep === 'cards' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <CardSelector
              selectedCards={selectedCards}
              onSelectionChange={(cards) => {
                setSelectedCards(cards);
                if (cards.length > 0) {
                  setCompletedSteps(prev => [...new Set([...prev, 'cards'])]);
                }
              }}
            />
          </motion.div>
        )}

        {/* Tone Detection */}
        {currentStep === 'tone' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ProfileIngestion
              onToneDetected={(tone) => {
                setDetectedTone(tone);
                if (tone) {
                  setCompletedSteps(prev => [...new Set([...prev, 'tone'])]);
                }
              }}
              onProfileData={setProfileData}
              selectedPlatform={selectedPlatform}
            />
          </motion.div>
        )}

        {/* Content Generation */}
        {currentStep === 'prompt' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <PromptGenerator
              platforms={[selectedPlatform?.name || 'LinkedIn']}
              selectedCards={selectedCards}
              tone={detectedTone}
              selectedFormat={selectedFormat}
              onContentGenerated={handleContentGenerated}
            />
          </motion.div>
        )}

        {/* Content Editor */}
        {currentStep === 'editor' && generatedContent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ContentEditor
              content={generatedContent}
              onContentUpdate={handleContentUpdate}
              onSave={handleSaveContent}
              selectedFormat={selectedFormat}
            />
          </motion.div>
        )}

        {/* Scheduling */}
        {currentStep === 'schedule' && generatedContent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ContentScheduler
              content={generatedContent}
              onSchedule={handleScheduleContent}
              onPublish={handlePublishContent}
              onExport={handleExportContent}
              onNavigateToHistory={() => setCurrentStep('history')}
            />
          </motion.div>
        )}

        {/* History */}
        {currentStep === 'history' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ContentHistory
              onEditContent={(content) => {
                setGeneratedContent(content);
                setCurrentStep('editor');
                scrollToTop();
              }}
              onDeleteContent={(contentId) => {
                // Remove from history
                setContentHistory(prev => prev.filter(item => item.id !== contentId));
              }}
              onExportContent={(content, format) => {
                handleExportContent(format);
              }}
            />
          </motion.div>
        )}

        {/* Navigation */}
        {currentStep !== 'dashboard' && currentStep !== 'history' && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation for History page - only Previous button */}
        {currentStep === 'history' && (
          <div className="flex justify-start mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
          </div>
        )}


      </div>
    </div>
  );
} 
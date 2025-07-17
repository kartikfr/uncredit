import React, { useState, useCallback, useEffect } from 'react';
import { Linkedin, Upload, FileText, User, Sparkles, AlertCircle, CheckCircle, Instagram, Twitter, Youtube, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDropzone } from 'react-dropzone';
import { contentCreationService } from '@/services/contentCreation';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileIngestionProps {
  onToneDetected: (tone: string) => void;
  onProfileData: (data: any) => void;
  selectedPlatform?: any; // Add platform prop
}

// Platform-specific configuration
const platformConfig = {
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    placeholder: 'https://linkedin.com/in/your-profile',
    description: 'Analyze your LinkedIn posts and profile to detect your professional tone',
    scrapingFunction: 'scrapeLinkedInProfile',
    urlPatterns: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
      /^https?:\/\/(www\.)?linkedin\.com\/company\/[a-zA-Z0-9-]+\/?$/
    ],
    errorMessage: 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)'
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    placeholder: 'https://instagram.com/your-username',
    description: 'Analyze your Instagram captions and posts to detect your visual storytelling tone',
    scrapingFunction: 'scrapeInstagramProfile',
    urlPatterns: [
      /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
      /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?\?hl=[a-zA-Z]+$/
    ],
    errorMessage: 'Please enter a valid Instagram profile URL (e.g., https://instagram.com/username)'
  },
  twitter: {
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'text-black',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    placeholder: 'https://twitter.com/your-username',
    description: 'Analyze your Twitter posts and threads to detect your conversational tone',
    scrapingFunction: 'scrapeTwitterProfile',
    urlPatterns: [
      /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/,
      /^https?:\/\/(www\.)?x\.com\/[a-zA-Z0-9_]+\/?$/
    ],
    errorMessage: 'Please enter a valid Twitter/X profile URL (e.g., https://twitter.com/username)'
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    placeholder: 'https://youtube.com/@your-channel',
    description: 'Analyze your YouTube video descriptions and comments to detect your video content tone',
    scrapingFunction: 'scrapeYouTubeProfile',
    urlPatterns: [
      /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9._-]+\/?$/,
      /^https?:\/\/(www\.)?youtube\.com\/channel\/[a-zA-Z0-9_-]+\/?$/,
      /^https?:\/\/(www\.)?youtube\.com\/c\/[a-zA-Z0-9._-]+\/?$/
    ],
    errorMessage: 'Please enter a valid YouTube channel URL (e.g., https://youtube.com/@channelname)'
  }
};

export default function ProfileIngestion({ onToneDetected, onProfileData, selectedPlatform }: ProfileIngestionProps) {
  const [profileUrl, setProfileUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analyzedTone, setAnalyzedTone] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    message: string;
    wrongPlatform?: string;
  } | null>(null);

  // Get platform configuration
  const platform = selectedPlatform ? platformConfig[selectedPlatform.id as keyof typeof platformConfig] : platformConfig.linkedin;
  const PlatformIcon = platform.icon;

  // Clear validation when platform changes
  useEffect(() => {
    setUrlValidation(null);
    setError(null);
    if (profileUrl) {
      validateUrlInRealTime(profileUrl);
    }
  }, [selectedPlatform?.id]);

  // URL validation function
  const validatePlatformUrl = (url: string, platformId: string): boolean => {
    const platform = platformConfig[platformId as keyof typeof platformConfig];
    if (!platform) return false;
    
    return platform.urlPatterns.some(pattern => pattern.test(url));
  };

  // Detect wrong platform URL
  const detectWrongPlatform = (url: string): string | null => {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('linkedin.com') && selectedPlatform?.id !== 'linkedin') {
      return 'LinkedIn';
    }
    if ((urlLower.includes('instagram.com') || urlLower.includes('ig.com')) && selectedPlatform?.id !== 'instagram') {
      return 'Instagram';
    }
    if ((urlLower.includes('twitter.com') || urlLower.includes('x.com')) && selectedPlatform?.id !== 'twitter') {
      return 'X (Twitter)';
    }
    if (urlLower.includes('youtube.com') && selectedPlatform?.id !== 'youtube') {
      return 'YouTube';
    }
    
    return null;
  };

  // Real-time URL validation
  const validateUrlInRealTime = (url: string) => {
    if (!url.trim()) {
      setUrlValidation(null);
      return;
    }

    const wrongPlatform = detectWrongPlatform(url);
    if (wrongPlatform) {
      setUrlValidation({
        isValid: false,
        message: `This looks like a ${wrongPlatform} URL`,
        wrongPlatform
      });
      return;
    }

    if (!validatePlatformUrl(url, selectedPlatform?.id || 'linkedin')) {
      setUrlValidation({
        isValid: false,
        message: platform.errorMessage
      });
      return;
    }

    setUrlValidation({
      isValid: true,
      message: `Valid ${platform.name} URL`
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const scrapeProfile = async () => {
    if (!profileUrl.trim()) {
      setError(`Please enter a ${platform.name} profile URL`);
      return;
    }

    // Validate URL format for the selected platform
    if (!validatePlatformUrl(profileUrl, selectedPlatform?.id || 'linkedin')) {
      setError(platform.errorMessage);
      return;
    }

    // Check if user entered URL for wrong platform
    const wrongPlatform = detectWrongPlatform(profileUrl);
    if (wrongPlatform) {
      setError(`This looks like a ${wrongPlatform} URL, but you've selected ${platform.name}. Please enter a valid ${platform.name} profile URL.`);
      return;
    }

    try {
      setIsScraping(true);
      setError(null);
      
      // Use the appropriate scraping function based on platform
      let profileData;
      switch (platform.scrapingFunction) {
        case 'scrapeLinkedInProfile':
          profileData = await contentCreationService.scrapeLinkedInProfile(profileUrl);
          break;
        case 'scrapeInstagramProfile':
          profileData = await contentCreationService.scrapeInstagramProfile(profileUrl);
          break;
        case 'scrapeTwitterProfile':
          profileData = await contentCreationService.scrapeTwitterProfile(profileUrl);
          break;
        case 'scrapeYouTubeProfile':
          profileData = await contentCreationService.scrapeYouTubeProfile(profileUrl);
          break;
        default:
          profileData = await contentCreationService.scrapeLinkedInProfile(profileUrl);
      }
      
      setScrapedData(profileData);
      onProfileData(profileData);
      
      // Analyze tone from scraped content
      if (profileData.posts && profileData.posts.length > 0) {
        await analyzeToneFromText(profileData.posts.join(' '));
      }
      
    } catch (err) {
      setError(`Failed to scrape ${platform.name} profile. Please check the URL and try again.`);
      console.error(`${platform.name} scraping error:`, err);
    } finally {
      setIsScraping(false);
    }
  };

  const analyzeToneFromText = async (text: string) => {
    try {
      setIsAnalyzing(true);
      const analysis = await contentCreationService.analyzeTone(text);
      setAnalyzedTone(analysis.tone);
      onToneDetected(analysis.tone);
    } catch (err) {
      console.error('Tone analysis error:', err);
      setError('Failed to analyze tone from text');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeUploadedFiles = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload files to analyze');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // For now, we'll simulate OCR and tone analysis
      // In a real implementation, you would use Tesseract.js for OCR
      const combinedText = uploadedFiles.map(file => 
        `Sample text extracted from ${file.name}`
      ).join(' ');

      await analyzeToneFromText(combinedText);
    } catch (err) {
      setError('Failed to analyze uploaded files');
      console.error('File analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word') || file.type.includes('document')) return '📝';
    return '📁';
  };

  return (
    <div className="space-y-6">
      {/* Platform-specific Profile Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlatformIcon className={`h-5 w-5 ${platform.color}`} />
            {platform.name} Profile Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">{platform.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {platform.name} Profile URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder={platform.placeholder}
                  value={profileUrl}
                  onChange={(e) => {
                    setProfileUrl(e.target.value);
                    validateUrlInRealTime(e.target.value);
                    setError(null); // Clear previous errors
                  }}
                  className={`${
                    urlValidation?.isValid === true 
                      ? 'border-green-500 focus:border-green-500' 
                      : urlValidation?.isValid === false 
                      ? 'border-red-500 focus:border-red-500' 
                      : ''
                  }`}
                />
                {/* Real-time validation feedback */}
                {urlValidation && (
                  <div className={`mt-1 text-xs flex items-center gap-1 ${
                    urlValidation.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {urlValidation.isValid ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {urlValidation.message}
                    {urlValidation.wrongPlatform && (
                      <span className="text-gray-500">
                        - You selected {platform.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={scrapeProfile}
                disabled={isScraping || !profileUrl.trim() || urlValidation?.isValid === false}
                className={`${platform.bgColor} ${platform.textColor} hover:opacity-90`}
              >
                {isScraping ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          {scrapedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${platform.bgColor} border ${platform.borderColor} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className={`h-5 w-5 ${platform.color}`} />
                <h4 className={`font-semibold ${platform.textColor}`}>Profile Analyzed Successfully</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Posts Analyzed:</span>
                  <p className="font-medium">{scrapedData.posts?.length || 0}</p>
                </div>
                <div>
                  <span className="text-gray-600">Detected Tone:</span>
                  <p className="font-medium capitalize">{scrapedData.tone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Followers:</span>
                  <p className="font-medium">{scrapedData.followers?.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" />
            Upload Content Files
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload your existing content files to analyze your writing tone
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-emerald-600 font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports: PDF, DOC, DOCX, TXT, Images (PNG, JPG)
                </p>
              </div>
            )}
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Uploaded Files:</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file)}</span>
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </motion.div>
                ))}
              </div>
              <Button
                onClick={analyzeUploadedFiles}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Tone from Files
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tone Analysis Results */}
      {analyzedTone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-800">Tone Analysis Complete</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Detected Tone:</span>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 capitalize">
              {analyzedTone}
            </Badge>
          </div>
          <p className="text-sm text-emerald-700 mt-2">
            This tone will be used to generate content that matches your writing style.
          </p>
        </motion.div>
      )}

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

      {/* Manual Tone Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Manual Tone Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            If automatic tone detection doesn't work, you can manually select your preferred tone:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Professional', 'Casual', 'Humorous', 'Educational', 'Promotional', 'Friendly', 'Authoritative', 'Conversational'].map((tone) => (
              <Button
                key={tone}
                variant={analyzedTone === tone.toLowerCase() ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setAnalyzedTone(tone.toLowerCase());
                  onToneDetected(tone.toLowerCase());
                }}
                className="text-xs"
              >
                {tone}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import React, { useState } from 'react';
import { Calendar, Clock, Download, Share2, Eye, AlertCircle, CheckCircle, Globe, Linkedin, Twitter, Instagram, Youtube, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GeneratedContent } from '@/services/contentCreation';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentSchedulerProps {
  content: GeneratedContent;
  onSchedule: (scheduledFor: Date) => void;
  onPublish: () => void;
  onExport: (format: 'txt' | 'json' | 'pdf') => void;
  onNavigateToHistory?: () => void;
}

export default function ContentScheduler({ content, onSchedule, onPublish, onExport, onNavigateToHistory }: ContentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [showPreview, setShowPreview] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(new Set());
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSchedule = async () => {
    setIsScheduling(true);
    try {
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Check if selected time is in the past
      if (scheduledDateTime < new Date()) {
        alert('Selected time is in the past. Please choose a future time.');
        return;
      }
      
      await onSchedule(scheduledDateTime);
    } catch (error) {
      console.error('Scheduling error:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
      
      // Show success popup
      setShowSuccessPopup(true);
      
      // Auto-redirect to history after 2 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
        if (onNavigateToHistory) {
          onNavigateToHistory();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Publishing error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getOptimalPostingTimes = () => {
    const times = [
      { time: '09:00', platform: 'LinkedIn', description: 'Best for professional content' },
      { time: '12:00', platform: 'All', description: 'Lunch break engagement' },
      { time: '17:00', platform: 'All', description: 'End of workday' },
      { time: '19:00', platform: 'Instagram', description: 'Evening social time' },
      { time: '20:00', platform: 'Twitter', description: 'Prime time engagement' }
    ];
    return times;
  };

  const getTimezoneOptions = () => {
    // Common timezones - in a real app, you'd use Intl.supportedValuesOf('timeZone')
    const commonTimezones = [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
      'Asia/Kolkata'
    ];
    
    return commonTimezones.map(tz => ({
      value: tz,
      label: tz.replace(/_/g, ' ')
    }));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'x (twitter)':
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getPlatformAuthUrl = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return 'https://www.linkedin.com/oauth/v2/authorization';
      case 'x (twitter)':
      case 'twitter':
        return 'https://twitter.com/i/oauth2/authorize';
      case 'instagram':
        return 'https://api.instagram.com/oauth/authorize';
      case 'youtube':
        return 'https://accounts.google.com/o/oauth2/auth';
      default:
        return '#';
    }
  };

  const handleConnectPlatform = (platform: string) => {
    console.log(`Connecting to ${platform}...`);
    
    // In a real implementation, this would redirect to the platform's OAuth flow
    // For now, we'll simulate the connection
    const newConnectedPlatforms = new Set(connectedPlatforms);
    newConnectedPlatforms.add(platform);
    setConnectedPlatforms(newConnectedPlatforms);
    
    // Show a success message
    alert(`${platform} connected successfully! (This is a demo - in production, you'd be redirected to ${platform}'s authorization page)`);
  };

  const isPlatformConnected = (platform: string) => {
    return connectedPlatforms.has(platform);
  };

  return (
    <div className="space-y-6">
      {/* Content Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Content Ready for Publishing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{content.platforms.length}</div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(content.content).reduce((total, text) => total + text.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Characters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{content.selectedCards.length}</div>
              <div className="text-sm text-gray-600">Cards Featured</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduling Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Schedule Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Timezone Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getTimezoneOptions().map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optimal Posting Times */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Suggested Times</label>
              <div className="space-y-2">
                {getOptimalPostingTimes().map((time, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTime(time.time)}
                    className="w-full justify-start text-left"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {time.time} - {time.description}
                  </Button>
                ))}
              </div>
            </div>

            {/* Schedule Button */}
            <Button
              onClick={handleSchedule}
              disabled={isScheduling}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isScheduling ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Publishing Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-green-600" />
              Publish Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Media Connections */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Connect Your Social Media</h4>
              <div className="space-y-2">
                {content.platforms.map((platform) => (
                  <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(platform)}
                      <span className="font-medium">{platform}</span>
                    </div>
                    {isPlatformConnected(platform) ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnectPlatform(platform)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Connect {platform}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">Ready to Publish</h4>
              </div>
              <p className="text-sm text-green-700">
                Your content is ready to be published immediately across all selected platforms.
              </p>
            </div>

            <Button
              onClick={handlePublish}
              disabled={isPublishing || content.platforms.some(platform => !isPlatformConnected(platform))}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {isPublishing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  {content.platforms.some(platform => !isPlatformConnected(platform)) 
                    ? 'Connect Platforms First' 
                    : 'Publish Now'}
                </>
              )}
            </Button>

            <Separator />

            {/* Export Options */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Export Content</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => onExport('txt')}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as Text (.txt)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onExport('json')}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON (.json)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onExport('pdf')}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF (.pdf)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Content Preview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {content.platforms.map((platform) => (
                  <div key={platform} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {platform}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {content.content[platform]?.length || 0} characters
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {content.content[platform] || 'No content available'}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Publishing Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Publishing Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Best posting times: 9 AM, 12 PM, 5 PM, 7 PM</li>
                <li>• Consider your audience's timezone</li>
                <li>• Avoid posting on weekends for professional content</li>
                <li>• Use platform-specific hashtags for better reach</li>
                <li>• Engage with comments within the first hour</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Done!</h3>
              <p className="text-gray-600 mb-4">Your post has been scheduled successfully.</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Platforms:</strong> {content.platforms.join(', ')}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Schedule Time:</strong> {new Date().toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-500">Redirecting to history page...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
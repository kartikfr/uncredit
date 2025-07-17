import React, { useState, useEffect } from 'react';
import { 
  History, 
  Calendar, 
  Share2, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Filter,
  Search,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeneratedContent, contentCreationService } from '@/services/contentCreation';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentHistoryProps {
  onEditContent: (content: GeneratedContent) => void;
  onDeleteContent: (contentId: string) => void;
  onExportContent: (content: GeneratedContent, format: 'txt' | 'json' | 'pdf') => void;
}

interface HistoryItem extends Omit<GeneratedContent, 'status'> {
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledFor?: Date;
  publishedAt?: Date;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

export default function ContentHistory({ onEditContent, onDeleteContent, onExportContent }: ContentHistoryProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load content history from service
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await contentCreationService.getContentHistory();
        const historyItems: HistoryItem[] = history.map((item: any) => ({
          ...item,
          status: item.status || 'draft',
          createdAt: new Date(item.createdAt || Date.now()),
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
          scheduledFor: item.scheduledFor ? new Date(item.scheduledFor) : undefined,
          engagement: item.engagement || {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0
          }
        }));
        
        setHistoryItems(historyItems);
        setFilteredItems(historyItems);
      } catch (error) {
        console.error('Failed to load content history:', error);
        // Fallback to mock data if service fails
        const mockHistory: HistoryItem[] = [
          {
            id: 'content-1',
            platforms: ['LinkedIn', 'X (Twitter)'],
            content: {
              'LinkedIn': '🚀 Exciting insights on ICICI MAKEMYTRIP CREDIT CARD! The joining fee is ₹2,500 with amazing travel benefits...',
              'X (Twitter)': '💳 ICICI MAKEMYTRIP CREDIT CARD - Joining fee: ₹2,500! ✈️ Travel perks galore! #CreditCards #Travel'
            },
            references: [],
            tone: 'professional',
            prompt: 'Tell me about the joining fee of this card',
            selectedCards: ['icici-makemytrip'],
            createdAt: new Date('2024-01-15T10:30:00'),
            status: 'published',
            publishedAt: new Date('2024-01-15T11:00:00'),
            engagement: {
              likes: 45,
              comments: 12,
              shares: 8,
              views: 1200
            }
          },
          {
            id: 'content-2',
            platforms: ['Instagram'],
            content: {
              'Instagram': '💳✨ Your credit card upgrade guide is here! Discovering ICICI MAKEMYTRIP CREDIT CARD has been a game-changer! 🚀'
            },
            references: [],
            tone: 'casual',
            prompt: 'Create an engaging Instagram post about this card',
            selectedCards: ['icici-makemytrip'],
            createdAt: new Date('2024-01-14T15:20:00'),
            status: 'scheduled',
            scheduledFor: new Date('2024-01-16T19:00:00'),
            engagement: {
              likes: 0,
              comments: 0,
              shares: 0,
              views: 0
            }
          }
        ];
        setHistoryItems(mockHistory);
        setFilteredItems(mockHistory);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Filter and sort items
  useEffect(() => {
    let filtered = historyItems;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.platforms.some(platform => platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.selectedCards.some(card => card.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.platforms.some(platform => platform.toLowerCase() === platformFilter.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'engagement':
          const aEngagement = a.engagement ? a.engagement.likes + a.engagement.comments + a.engagement.shares : 0;
          const bEngagement = b.engagement ? b.engagement.likes + b.engagement.comments + b.engagement.shares : 0;
          return bEngagement - aEngagement;
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [historyItems, searchTerm, statusFilter, platformFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'draft':
        return <Edit3 className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Edit3 className="h-4 w-4" />;
    }
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTotalEngagement = (engagement: any) => {
    if (!engagement) return 0;
    return engagement.likes + engagement.comments + engagement.shares;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Content History</h1>
          <p className="text-gray-600">Manage and track all your created content</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {filteredItems.length} items
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Platform Filter */}
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="engagement">Most Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedItem(item)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status}</span>
                        </Badge>
                        <div className="flex items-center gap-1">
                          {item.platforms.map((platform) => (
                            <div key={platform} className="flex items-center gap-1 text-gray-600">
                              {getPlatformIcon(platform)}
                              <span className="text-sm">{platform}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                        {item.prompt}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>Created: {formatDate(item.createdAt)}</span>
                        {item.scheduledFor && (
                          <span>Scheduled: {formatDate(item.scheduledFor)}</span>
                        )}
                        {item.publishedAt && (
                          <span>Published: {formatDate(item.publishedAt)}</span>
                        )}
                      </div>

                      {/* Engagement Stats */}
                      {item.engagement && (item.status === 'published' || item.status === 'scheduled') && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <span className="text-green-600">❤️</span>
                            {item.engagement.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-blue-600">💬</span>
                            {item.engagement.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-purple-600">🔄</span>
                            {item.engagement.shares}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-gray-600">👁️</span>
                            {item.engagement.views}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Convert HistoryItem to GeneratedContent for editing
                          const contentForEdit: GeneratedContent = {
                            ...item,
                            status: item.status as 'draft' | 'scheduled' | 'published'
                          };
                          onEditContent(contentForEdit);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Convert HistoryItem to GeneratedContent for export
                          const contentForExport: GeneratedContent = {
                            ...item,
                            status: item.status as 'draft' | 'scheduled' | 'published'
                          };
                          onExportContent(contentForExport, 'txt');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteContent(item.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No content found</h3>
              <p className="text-gray-500">Try adjusting your filters or create new content</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Preview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItem.platforms.map((platform) => (
                <div key={platform} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getPlatformIcon(platform)}
                    <span className="font-medium">{platform}</span>
                    <Badge className={getStatusColor(selectedItem.status)}>
                      {selectedItem.status}
                    </Badge>
                  </div>
                  <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                    {selectedItem.content[platform] || 'No content available'}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 
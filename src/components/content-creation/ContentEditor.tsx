import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Eye, 
  Save, 
  Download, 
  Share2, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Type,
  Smile,
  Image as ImageIcon,
  Link as LinkIcon,
  Copy,
  Trash2,
  Smartphone,
  Monitor,
  Calendar,
  Send,
  Video,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import { GeneratedContent } from '@/services/contentCreation';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentEditorProps {
  content: GeneratedContent;
  onContentUpdate: (updatedContent: GeneratedContent) => void;
  onSave: () => void;
  selectedFormat?: any; // Add format prop to determine if preview should be shown
}

const platformLimits = {
  'LinkedIn': 3000,
  'X (Twitter)': 280,
  'Instagram': 2200,
  'YouTube': 5000
};

// Content types that should show preview (not scripts)
const previewableFormats = [
  'full-post', 'carousel', 'article', 'story', 'single-tweet', 'thread', 
  'caption', 'reel', 'full-video', 'shorts'
];

// Script formats that shouldn't show preview
const scriptFormats = [
  'reel-script', 'video-script', 'short-script'
];

export default function ContentEditor({ content, onContentUpdate, onSave, selectedFormat }: ContentEditorProps) {
  console.log('🎨 ContentEditor: Component rendered with:', {
    contentId: content.id,
    platforms: content.platforms,
    contentKeys: Object.keys(content.content),
    selectedFormat: selectedFormat?.name,
    shouldShowPreview: selectedFormat && previewableFormats.includes(selectedFormat.id)
  });

  const [activePlatform, setActivePlatform] = useState(content.platforms[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start editing your content...' }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      FontFamily.configure({
        types: ['textStyle'],
      })
    ],
    content: content.content[activePlatform] || '',
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML(); // Use HTML to preserve formatting
      const updatedContent = {
        ...content,
        content: {
          ...content.content,
          [activePlatform]: newContent
        }
      };
      onContentUpdate(updatedContent);
      setHasUnsavedChanges(true);
      calculateReadability(editor.getText());
    }
  });

  // Add a state to hold the current editor content for preview
  const [editorContent, setEditorContent] = useState<string>(content.content[activePlatform] || '');

  // Update editorContent whenever the editor changes
  useEffect(() => {
    if (editor) {
      setEditorContent(editor.getHTML());
    }
  }, [editor, activePlatform]);

  // Update editorContent on every editor update
  useEffect(() => {
    if (!editor) return;
    const updateHandler = () => setEditorContent(editor.getHTML());
    editor.on('update', updateHandler);
    return () => {
      editor.off('update', updateHandler);
      return undefined;
    };
  }, [editor]);

  // Check if preview should be shown based on format
  const shouldShowPreview = selectedFormat && previewableFormats.includes(selectedFormat.id);
  const isScriptFormat = selectedFormat && scriptFormats.includes(selectedFormat.id);

  console.log('🎨 ContentEditor: Preview settings:', {
    shouldShowPreview,
    isScriptFormat,
    activePlatform,
    previewMode
  });

  // Set editor content when component mounts or content changes
  useEffect(() => {
    if (editor) {
      const platformContent = content.content[activePlatform] || '';
      console.log('🎨 ContentEditor: Setting editor content for', activePlatform, ':', {
        contentLength: platformContent.length,
        contentPreview: platformContent.substring(0, 100) + '...',
        allContentKeys: Object.keys(content.content),
        allContentValues: Object.entries(content.content).map(([key, value]) => ({
          key,
          length: value.length,
          preview: value.substring(0, 50) + '...'
        }))
      });
      editor.commands.setContent(platformContent);
    }
  }, [activePlatform, content.content, editor]);

  // Additional effect to handle initial content loading
  useEffect(() => {
    if (editor && Object.keys(content.content).length > 0) {
      const platformContent = content.content[activePlatform] || '';
      if (platformContent && editor.isEmpty) {
        console.log('🎨 ContentEditor: Loading initial content for', activePlatform);
        editor.commands.setContent(platformContent);
      }
    }
  }, [editor, content.content, activePlatform]);

  const calculateReadability = (text: string) => {
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const syllables = text.toLowerCase().replace(/[^a-z]/g, '').length * 0.4;
    
    if (sentences > 0 && words > 0) {
      const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
      setReadabilityScore(Math.max(0, Math.min(100, score)));
    }
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 80) return 'Easy to read';
    if (score >= 60) return 'Moderate';
    return 'Difficult';
  };

  const getCharacterCount = (platform: string) => {
    const text = content.content[platform] || '';
    // Strip HTML tags for character count
    const plainText = text.replace(/<[^>]*>/g, '');
    return plainText.length;
  };

  const isOverLimit = (platform: string) => {
    const count = getCharacterCount(platform);
    const limit = platformLimits[platform as keyof typeof platformLimits];
    return limit ? count > limit : false;
  };

  const handleSave = () => {
    onSave();
    setHasUnsavedChanges(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/<[^>]*>/g, ''));
  };

  const clearContent = () => {
    if (editor) {
      editor.commands.clearContent();
    }
  };

  const renderFormattingToolbar = () => (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b rounded-t-lg">
      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={editor?.isActive('bold') ? 'bg-blue-100 text-blue-700' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={editor?.isActive('italic') ? 'bg-blue-100 text-blue-700' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={editor?.isActive('underline') ? 'bg-blue-100 text-blue-700' : ''}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className={editor?.isActive('strike') ? 'bg-blue-100 text-blue-700' : ''}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Font Styles */}
      <Select onValueChange={(value) => {
        if (value === 'normal') editor?.chain().focus().unsetFontFamily().run();
        else editor?.chain().focus().setFontFamily(value).run();
      }}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="serif">Serif</SelectItem>
          <SelectItem value="monospace">Monospace</SelectItem>
          <SelectItem value="cursive">Cursive</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* Actions */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copyToClipboard(content.content[activePlatform] || '')}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={clearContent}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderLinkedInPreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const isLongContent = plainText.length > 200;
    const displayText = isLongContent ? plainText.substring(0, 200) + '...' : plainText;

    return (
      <div className="bg-white border border-gray-200 rounded-lg max-w-md shadow-sm">
        {/* Profile Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">JD</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">John Doe</div>
            <div className="text-sm text-gray-600">Financial Content Creator</div>
            <div className="text-xs text-gray-500">2h • 🌐</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {displayText}
          </div>
          
          {/* Show "See more" if content is truncated */}
          {isLongContent && (
            <button className="text-blue-600 font-medium text-sm mt-2 hover:underline">
              ...see more
            </button>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>👍 24</span>
              <span>💬 8</span>
              <span>🔄 3</span>
            </div>
            <span>👁️ 1.2k views</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around p-3 border-t border-gray-100">
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
            👍 Like
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
            💬 Comment
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
            🔄 Repost
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
            📤 Send
          </button>
        </div>
      </div>
    );
  };

  const renderTwitterPreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const isOverLimit = plainText.length > 280;
    const displayText = isOverLimit ? plainText.substring(0, 280) + '...' : plainText;

    return (
      <div className="bg-white border border-gray-200 rounded-lg max-w-md shadow-sm">
        {/* Profile Header */}
        <div className="flex items-center gap-3 p-4">
          <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">JD</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">John Doe</span>
              <span className="text-blue-500">@johndoe</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm">2h</span>
            </div>
            <div className="text-sm text-gray-600">Financial Content Creator</div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className={`text-gray-900 leading-relaxed whitespace-pre-wrap ${
            isOverLimit ? 'text-red-600' : ''
          }`}>
            {displayText}
          </div>
          
          {isOverLimit && (
            <div className="text-red-500 text-sm mt-2">
              ⚠️ {plainText.length - 280} characters over limit
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-around px-4 py-3 border-t border-gray-100">
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 text-sm">
            💬 8
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 text-sm">
            🔄 3
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 text-sm">
            ❤️ 24
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 text-sm">
            📤
          </button>
        </div>
      </div>
    );
  };

  const renderInstagramPreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const isOverLimit = plainText.length > 2200;
    const displayText = isOverLimit ? plainText.substring(0, 2200) + '...' : plainText;

    return (
      <div className="bg-white border border-gray-200 rounded-lg max-w-sm shadow-sm">
        {/* Profile Header */}
        <div className="flex items-center gap-3 p-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">JD</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">johndoe</div>
            <div className="text-xs text-gray-500">Financial Creator</div>
          </div>
          <button className="text-gray-600">⋯</button>
        </div>

        {/* Image Placeholder */}
        <div className="bg-gray-100 h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">Image would appear here</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 p-4">
          <button className="text-2xl">❤️</button>
          <button className="text-2xl">💬</button>
          <button className="text-2xl">📤</button>
          <button className="text-2xl ml-auto">🔖</button>
        </div>

        {/* Likes */}
        <div className="px-4 pb-2">
          <div className="font-semibold text-gray-900 text-sm">24 likes</div>
        </div>

        {/* Caption */}
        <div className="px-4 pb-4">
          <div className="text-sm">
            <span className="font-semibold text-gray-900">johndoe</span>
            <span className="text-gray-900 ml-2">
              {displayText}
            </span>
            {isOverLimit && (
              <div className="text-red-500 text-xs mt-1">
                ⚠️ {plainText.length - 2200} characters over limit
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="px-4 pb-4 border-t border-gray-100 pt-2">
          <div className="text-sm text-gray-500">View all 8 comments</div>
        </div>

        {/* Add Comment */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">😊</span>
            <input 
              type="text" 
              placeholder="Add a comment..." 
              className="flex-1 text-sm border-none outline-none"
            />
            <button className="text-blue-500 font-semibold text-sm">Post</button>
          </div>
        </div>
      </div>
    );
  };

  const renderYouTubePreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const isOverLimit = plainText.length > 5000;
    const displayText = isOverLimit ? plainText.substring(0, 5000) + '...' : plainText;

    return (
      <div className="bg-white border border-gray-200 rounded-lg max-w-md shadow-sm">
        {/* Video Thumbnail */}
        <div className="bg-gray-100 h-48 flex items-center justify-center relative">
          <div className="text-center text-gray-500">
            <Video className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">Video thumbnail</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Credit Card Comparison Guide 2024
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>1.2K views</span>
            <span>•</span>
            <span>2 hours ago</span>
          </div>

          {/* Channel Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">JD</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">John Doe Finance</div>
              <div className="text-sm text-gray-600">50K subscribers</div>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Subscribe
            </button>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-900 whitespace-pre-wrap">
              {displayText}
            </div>
            {isOverLimit && (
              <div className="text-red-500 text-xs mt-2">
                ⚠️ {plainText.length - 5000} characters over limit
              </div>
            )}
            <button className="text-blue-600 font-medium text-sm mt-2 hover:underline">
              Show more
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around px-4 py-3 border-t border-gray-100">
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
            👍 1.2K
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
            👎
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
            💬 89
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
            📤 Share
          </button>
        </div>
      </div>
    );
  };

  // Update renderPreview to use editorContent for the active platform
  const renderPreview = (platform: string) => {
    // Use the live editor content for the active platform
    const platformContent = platform === activePlatform ? editorContent : (content.content[platform] || '');
    
    switch (platform) {
      case 'LinkedIn':
        return renderLinkedInPreview(platformContent);
      case 'X (Twitter)':
        return renderTwitterPreview(platformContent);
      case 'Instagram':
        return renderInstagramPreview(platformContent);
      case 'YouTube':
        return renderYouTubePreview(platformContent);
      default:
        return (
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="text-sm text-gray-600">
              {platformContent || 'No content for this platform'}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Content Editor</h3>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                Unsaved Changes
              </Badge>
            )}
            <Badge variant="secondary">
              {content.platforms.length} Platform{content.platforms.length !== 1 ? 's' : ''}
            </Badge>
            {isScriptFormat && (
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                Script Format
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(content.content[activePlatform] || '')}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Platform Tabs */}
      <Tabs value={activePlatform} onValueChange={setActivePlatform}>
        <TabsList className="grid w-full grid-cols-3">
          {content.platforms.map((platform) => (
            <TabsTrigger key={platform} value={platform} className="flex items-center gap-2">
              {platform}
              {isOverLimit(platform) && (
                <AlertCircle className="h-3 w-3 text-red-600" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {content.platforms.map((platform) => (
          <TabsContent key={platform} value={platform} className="space-y-4">
            <div className={`grid gap-6 ${shouldShowPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Editor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-blue-600" />
                      Rich Text Editor
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {getCharacterCount(platform)} characters
                      </span>
                      {platformLimits[platform as keyof typeof platformLimits] && (
                        <span className={`text-sm ${
                          isOverLimit(platform) ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          / {platformLimits[platform as keyof typeof platformLimits]}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Formatting Toolbar */}
                  {renderFormattingToolbar()}
                  
                  {/* Editor Content */}
                  <div className="border rounded-b-lg p-4 bg-white min-h-[200px]">
                    <EditorContent editor={editor} />
                  </div>
                  
                  {/* Readability Score */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Readability Score:</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${getReadabilityColor(readabilityScore)}`}>
                          {Math.round(readabilityScore)}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({getReadabilityLabel(readabilityScore)})
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          readabilityScore >= 80 ? 'bg-green-500' :
                          readabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${readabilityScore}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview - Only show for non-script formats */}
              {shouldShowPreview && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-purple-600" />
                        {platform} Preview
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={previewMode === 'mobile' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewMode('mobile')}
                        >
                          <Smartphone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={previewMode === 'desktop' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPreviewMode('desktop')}
                        >
                          <Monitor className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`${previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-md'}`}>
                      {renderPreview(platform)}
                    </div>
                    
                    {/* Platform Guidelines */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Platform Guidelines</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {platform === 'LinkedIn' && (
                          <>
                            <li>• Professional tone recommended</li>
                            <li>• Include relevant hashtags</li>
                            <li>• Focus on business value</li>
                          </>
                        )}
                        {platform === 'X (Twitter)' && (
                          <>
                            <li>• Keep it concise and engaging</li>
                            <li>• Use abbreviations when needed</li>
                            <li>• Include a clear call-to-action</li>
                          </>
                        )}
                        {platform === 'Instagram' && (
                          <>
                            <li>• Visual-friendly content</li>
                            <li>• Use emojis appropriately</li>
                            <li>• Focus on lifestyle benefits</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Script Format Notice */}
              {isScriptFormat && (
                <Card className="lg:col-span-2">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Type className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Script Editor Mode
                      </h3>
                      <p className="text-gray-600 mb-4">
                        This is a script format ({selectedFormat?.name}). Use the rich text editor above to format your script content.
                        Preview is not available for script formats as they are not meant for direct social media posting.
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <Button variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Script
                        </Button>
                        <Button>
                          <Send className="h-4 w-4 mr-2" />
                          Export Script
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Content Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Content Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {content.platforms.length}
              </div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(content.content).reduce((total, text) => total + text.replace(/<[^>]*>/g, '').length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Characters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {content.references?.length || 0}
              </div>
              <div className="text-sm text-gray-600">References</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(readabilityScore)}
              </div>
              <div className="text-sm text-gray-600">Readability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
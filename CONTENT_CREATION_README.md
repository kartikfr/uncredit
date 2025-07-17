# Content Creation Platform - UnCredit

A comprehensive AI-powered content creation platform for credit card creators, influencers, and financial content marketers.

## 🚀 Features

### Core Functionality
- **Multi-Platform Content Generation**: Create content for LinkedIn, X (Twitter), and Instagram
- **Credit Card Integration**: Seamlessly integrate with BankKaro API for card data
- **AI-Powered Content**: OpenAI GPT-4 integration for intelligent content generation
- **Tone Analysis**: Automatic tone detection from LinkedIn profiles and uploaded content
- **Rich Text Editor**: Advanced editing with Tiptap editor
- **Content Scheduling**: Plan and schedule your content
- **Export Options**: Export content in TXT, JSON, and PDF formats

### Advanced Features
- **LinkedIn Profile Scraping**: Analyze your writing style from LinkedIn posts
- **File Upload & OCR**: Upload documents and images for tone analysis
- **Smart Suggestions**: AI-powered prompt suggestions for better content
- **Platform-Specific Guidelines**: Automatic formatting for each social platform
- **Readability Scoring**: Real-time content readability analysis
- **Content History**: Track and manage your content drafts

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/
│   └── content-creation/
│       ├── CardSelector.tsx          # Credit card selection component
│       ├── ProfileIngestion.tsx      # LinkedIn scraping & file upload
│       ├── PromptGenerator.tsx       # AI content generation
│       └── ContentEditor.tsx         # Rich text editor
├── services/
│   └── contentCreation.ts            # Content creation service
└── pages/
    └── CreateContent.tsx             # Main content creation page
```

## 🔧 API Integration

### BankKaro API
The platform integrates with the BankKaro API to fetch credit card information:
- Card details and features
- Bank information
- Fee structures
- Ratings and reviews

### OpenAI API
- GPT-4 for content generation
- Tone analysis
- Smart prompt suggestions
- Content optimization

## 🎯 Usage Guide

### Step 1: Platform Selection
Choose which social media platforms you want to create content for:
- LinkedIn (Professional content, 1000-3000 characters)
- X/Twitter (Concise content, 280 characters max)
- Instagram (Visual-friendly content, 200-2200 characters)

### Step 2: Card Selection
- Browse and search through available credit cards
- Filter by bank, network, or features
- Select multiple cards for comparison content

### Step 3: Profile Analysis
- **LinkedIn Scraping**: Enter your LinkedIn profile URL for automatic tone analysis
- **File Upload**: Upload documents, images, or text files for OCR and tone detection
- **Manual Selection**: Choose your preferred tone manually

### Step 4: Content Generation
- Write a detailed prompt describing your content needs
- Use smart suggestions for inspiration
- Generate platform-specific content with AI

### Step 5: Content Editing
- Use the rich text editor to refine your content
- Preview content as it will appear on each platform
- Check character limits and readability scores
- Export content in various formats

### Step 6: Scheduling & Publishing
- Schedule content for later publication
- Export content for manual posting
- Save drafts for future editing

## 🔒 Security & Privacy

- **API Key Security**: OpenAI API keys are stored securely in environment variables
- **Data Privacy**: User content and profile data are not stored permanently
- **LinkedIn Compliance**: LinkedIn scraping follows platform guidelines

## 🚧 Limitations & Notes

### Current Limitations
- LinkedIn scraping requires manual authentication
- OCR functionality is simulated (requires Tesseract.js integration)
- Content scheduling requires backend implementation
- Social media publishing requires platform API integration

### Future Enhancements
- Real LinkedIn scraping with proper authentication
- Advanced OCR with Tesseract.js
- Social media API integration for direct publishing
- Team collaboration features
- Analytics and performance tracking

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Ensure your API key is valid and has sufficient credits
   - Check rate limits and usage quotas

2. **Card Loading Issues**
   - Verify BankKaro API connectivity
   - Check network connection

3. **Content Generation Failures**
   - Ensure prompt is clear and specific
   - Check selected cards and platforms
   - Verify tone selection

### Debug Mode
Enable debug logging by setting:
```env
VITE_DEBUG=true
```

## 📞 Support

For technical support or feature requests:
- Check the existing issues on GitHub
- Create a new issue with detailed information
- Include error messages and steps to reproduce

## 📄 License

This project is part of the UnCredit platform and follows the same licensing terms.

---

**Note**: This is a beta version of the content creation platform. Some features may be limited or require additional backend implementation. 
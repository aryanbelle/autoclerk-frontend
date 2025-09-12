# AutoClerk Frontend 🚀

A modern, AI-powered document analysis and automation platform built with React, TypeScript, and cutting-edge UI design.

## ✨ Features

### 🎨 **Beautiful UI/UX**
- **Space-themed design** with elegant gradients and glow effects
- **Sleek chat interface** with typing animations
- **Responsive design** that works on all devices
- **Professional landing page** with smooth interactions

### 📄 **Advanced Document Analysis**
- **Multi-format support**: PDF, DOCX, and TXT files
- **Smart file validation** with size and type checking
- **Visual file attachment** with drag-and-drop interface
- **Real-time document processing** with AI-powered analysis

### 💬 **Intelligent Chat System**
- **Session management** with persistent chat history
- **Auto-response handling** for landing page prompts
- **Typing indicators** and smooth message animations
- **Context-aware conversations** with document integration

### 🎯 **Modern Architecture**
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development
- **TailwindCSS** for utility-first styling
- **Carbon Design System** for professional components

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, Carbon Design System
- **State Management**: React Context API
- **Icons**: Lucide React, Carbon Icons
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Markdown**: ReactMarkdown with GFM support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend server running on `http://localhost:8000`

### Installation

```bash
# Clone the repository
git clone https://github.com/aryanbelle/autoclerk-frontend.git
cd autoclerk-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── ChatInterface.tsx # Main chat interface
│   ├── ChatSidebar.tsx   # Navigation sidebar
│   ├── LandingPage.tsx   # Welcome screen
│   └── MainInterface.tsx # App layout
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── services/            # API services
├── lib/                 # Utility functions
└── pages/               # Route pages
```

## 🎨 UI Features

### Landing Page
- **Animated status indicator** with pulsing effects
- **Gradient backgrounds** with radial glow effects
- **Smart input area** with document type selector
- **Suggestion buttons** for quick actions

### Chat Interface
- **Message bubbles** with proper styling and spacing
- **File attachment display** with size and type info
- **Typing indicators** with smooth animations
- **Action buttons** for message interactions

### Document Analysis
- **Visual file picker** with validation feedback
- **Progress indicators** during processing
- **Rich AI responses** with markdown support
- **Context preservation** across conversations

## 🔧 Configuration

### API Endpoint
Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

### Styling
Customize the theme in `src/index.css` and `tailwind.config.ts`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the future of document automation**

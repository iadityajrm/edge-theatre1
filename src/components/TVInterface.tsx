
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Mic, MicOff, Settings, Search, X } from 'lucide-react';
import { AppGrid } from './AppGrid';
import { HeroSection } from './HeroSection';
import { VoiceOverlay } from './VoiceOverlay';
import { NavigationHandler } from './NavigationHandler';
import { callGeminiAI, extractAppCommand } from '@/lib/gemini';
import { wakeWordService } from '@/lib/wakeWordService';

interface TVInterfaceProps {}

export const TVInterface: React.FC<TVInterfaceProps> = () => {
  const [isListening, setIsListening] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [focusedSection, setFocusedSection] = useState<'hero' | 'apps' | 'header'>('hero');
  const [focusedHeaderItem, setFocusedHeaderItem] = useState(0);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showAiResponse, setShowAiResponse] = useState(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [wakeWordError, setWakeWordError] = useState<string>('');

  // Available apps data
  const apps = [
    { id: 'netflix', name: 'Netflix', url: 'https://www.netflix.com' },
    { id: 'primevideo', name: 'Prime Video', url: 'https://www.primevideo.com' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com' },
    { id: 'disney', name: 'Disney+', url: 'https://www.disneyplus.com' },
    { id: 'hulu', name: 'Hulu', url: 'https://www.hulu.com' },
    { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com' },
    { id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv' },
    { id: 'hbomax', name: 'HBO Max', url: 'https://www.hbomax.com' }
  ];

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Initialize wake word detection
  useEffect(() => {
    const initializeWakeWord = async () => {
      try {
        setWakeWordError('');
        console.log('Initializing wake word detection...');
        
        // Set up callbacks
        wakeWordService.setWakeWordCallback(handleWakeWord);
        wakeWordService.setCommandCallback(handleVoiceCommand);
        
        // Initialize and start the service
        await wakeWordService.initialize();
        await wakeWordService.start();
        
        setIsListening(true);
        console.log('Wake word detection active');
      } catch (error) {
        console.error('Failed to initialize wake word detection:', error);
        setWakeWordError('Failed to initialize voice detection. Please check microphone permissions.');
        setIsListening(false);
      }
    };

    initializeWakeWord();

    // Cleanup on unmount
    return () => {
      wakeWordService.destroy();
    };
  }, []);

  const handleWakeWord = useCallback(() => {
    console.log('Wake word detected!');
    setShowVoiceOverlay(true);
    wakeWordService.startCommandListening();
    
    // Auto-hide after 5 seconds if no interaction
    setTimeout(() => {
      setShowVoiceOverlay(false);
      wakeWordService.stopCommandListening();
    }, 5000);
  }, []);

  const handleVoiceCommand = async (command: string) => {
    console.log('Voice command:', command);
    setIsProcessingCommand(true);
    setShowVoiceOverlay(false);
    wakeWordService.stopCommandListening();

    try {
      // Check if it's an app opening command
      const appId = extractAppCommand(command);
      
      if (appId) {
        const app = apps.find(a => a.id === appId);
        if (app) {
          setAiResponse(`Opening ${app.name}...`);
          setShowAiResponse(true);
          
          // Open the app after a short delay
          setTimeout(() => {
            window.open(app.url, '_blank');
            setShowAiResponse(false);
          }, 2000);
        } else {
          setAiResponse("I couldn't find that app. Try saying 'Open Netflix' or 'Open YouTube'.");
          setShowAiResponse(true);
          setTimeout(() => setShowAiResponse(false), 4000);
        }
      } else {
        // Send to Gemini AI for general questions
        const response = await callGeminiAI(command);
        setAiResponse(response);
        setShowAiResponse(true);
        
        // Auto-hide after 8 seconds
        setTimeout(() => setShowAiResponse(false), 8000);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      setAiResponse("I'm sorry, I encountered an error processing your request.");
      setShowAiResponse(true);
      setTimeout(() => setShowAiResponse(false), 4000);
    } finally {
      setIsProcessingCommand(false);
      // Resume wake word detection after processing command
      setTimeout(() => {
        wakeWordService.start();
      }, 1000);
    }
  };

  return (
    <div className={`min-h-screen bg-tv-darker relative overflow-hidden ${showVoiceOverlay ? 'voice-listening' : ''}`}>
      {/* Navigation Handler for keyboard controls */}
      <NavigationHandler 
        focusedSection={focusedSection}
        setFocusedSection={setFocusedSection}
        focusedHeaderItem={focusedHeaderItem}
        setFocusedHeaderItem={setFocusedHeaderItem}
      />

      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-gradient-to-r from-tv-darker to-transparent z-10 relative">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-primary">WorkingEDGE</div>
          <div className="text-sm text-gray-400">AI TV</div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-lg font-medium">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-400">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isListening ? 'bg-green-600' : 'bg-gray-600'}`}>
              {isListening ? <Mic size={16} /> : <MicOff size={16} />}
            </div>
            <button className={`p-2 rounded-full transition-colors ${
              focusedSection === 'header' && focusedHeaderItem === 0 
                ? 'bg-primary ring-2 ring-primary/50' 
                : 'bg-gray-700'
            }`}>
              <Search size={16} />
            </button>
            <button className={`p-2 rounded-full transition-colors ${
              focusedSection === 'header' && focusedHeaderItem === 1 
                ? 'bg-primary ring-2 ring-primary/50' 
                : 'bg-gray-700'
            }`}>
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Wake Word Error Display */}
      {wakeWordError && (
        <div className="mx-6 mb-4 p-4 bg-red-900/50 border border-red-700/50 rounded-lg">
          <p className="text-red-300 text-sm">{wakeWordError}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="px-6 pb-6">
        {/* Hero Section */}
        <div className="hero-section">
          <HeroSection focused={focusedSection === 'hero'} />
        </div>
        
        {/* Apps Section */}
        <section className="mt-12 apps-section">
          <h2 className="text-2xl font-bold mb-6 text-white">Your Apps</h2>
          <AppGrid focused={focusedSection === 'apps'} />
        </section>
      </main>

      {/* Voice Overlay */}
      {showVoiceOverlay && (
        <VoiceOverlay 
          onCommand={handleVoiceCommand}
          onClose={() => {
            setShowVoiceOverlay(false);
            wakeWordService.stopCommandListening();
          }}
        />
      )}

      {/* Wake word indicator */}
      {showVoiceOverlay && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 border-4 border-primary rounded-lg animate-glow-pulse"></div>
        </div>
      )}

      {/* AI Response Display */}
      {showAiResponse && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Atlas</h3>
                    <p className="text-sm text-gray-400">AI Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiResponse(false)}
                  className="p-2 rounded-full bg-gray-800/60 hover:bg-gray-700/60 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="text-lg text-white leading-relaxed">
                {isProcessingCommand ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Processing your request...</span>
                  </div>
                ) : (
                  aiResponse
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

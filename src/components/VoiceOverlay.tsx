
import React, { useState, useEffect } from 'react';
import { Mic, Volume2, X } from 'lucide-react';
import { wakeWordService } from '@/lib/wakeWordService';

interface VoiceOverlayProps {
  onCommand: (command: string) => void;
  onClose: () => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ onCommand, onClose }) => {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [suggestions] = useState([
    'Open Netflix',
    'Play music',
    'Show weather',
    'Search for movies',
    'What can you do?'
  ]);

  useEffect(() => {
    // Set up command callback for this overlay session
    wakeWordService.setCommandCallback((command: string) => {
      setTranscript(command);
      setIsListening(false);
      onCommand(command);
    });

    // Start listening for commands
    wakeWordService.startCommandListening();

    return () => {
      wakeWordService.stopCommandListening();
    };
  }, [onCommand]);

  const handleSuggestionClick = (suggestion: string) => {
    setTranscript(suggestion);
    setIsListening(false);
    onCommand(suggestion);
  };

  const handleClose = () => {
    wakeWordService.stopCommandListening();
    onClose();
  };

  return (
    <div className="voice-overlay">
      <div className="max-w-4xl mx-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Voice Interface */}
        <div className="text-center mb-8">
          {/* Atlas Branding */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-primary mb-2">Atlas</h1>
            <p className="text-xl text-gray-300">Your AI Assistant</p>
            <p className="text-sm text-gray-500 mt-2">Powered by Vosk + VAD</p>
          </div>

          {/* Voice Indicator */}
          <div className="flex justify-center mb-6">
            <div className={`p-6 rounded-full ${isListening ? 'bg-primary' : 'bg-gray-600'} transition-all duration-300`}>
              {isListening ? (
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-8 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-6 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-1 h-10 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-1 h-4 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-1 h-7 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '400ms' }}></div>
                </div>
              ) : (
                <Mic size={32} />
              )}
            </div>
          </div>

          {/* Status Text */}
          <div className="mb-8">
            {isListening ? (
              <div>
                <p className="text-lg text-white mb-2">Listening with Vosk...</p>
                {transcript && (
                  <p className="text-gray-400 italic">"{transcript}"</p>
                )}
              </div>
            ) : (
              <p className="text-lg text-gray-400">Command received</p>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-full mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">Try saying:</h3>
          </div>
          
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-4 bg-gray-800/60 rounded-lg border border-gray-700/50 hover:border-primary/50 hover:bg-gray-700/60 transition-all duration-200 text-left"
            >
              <div className="flex items-center">
                <Volume2 size={16} className="mr-3 text-primary" />
                <span className="text-white">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Capabilities */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Atlas can help you navigate your TV, open apps, search for content, and more.
            Now with offline wake word detection using Vosk and VAD.
          </p>
        </div>
      </div>
    </div>
  );
};

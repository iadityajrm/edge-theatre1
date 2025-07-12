
import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface App {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
  category: string;
}

interface AppGridProps {
  focused: boolean;
}

export const AppGrid: React.FC<AppGridProps> = ({ focused }) => {
  const [focusedApp, setFocusedApp] = useState(0);

  const apps: App[] = [
    {
      id: 'netflix',
      name: 'Netflix',
      icon: '🎬',
      url: 'https://www.netflix.com',
      color: 'bg-red-600',
      category: 'Entertainment'
    },
    {
      id: 'primevideo',
      name: 'Prime Video',
      icon: '📺',
      url: 'https://www.primevideo.com',
      color: 'bg-blue-600',
      category: 'Entertainment'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📹',
      url: 'https://www.youtube.com',
      color: 'bg-red-500',
      category: 'Entertainment'
    },
    {
      id: 'disney',
      name: 'Disney+',
      icon: '🏰',
      url: 'https://www.disneyplus.com',
      color: 'bg-blue-800',
      category: 'Entertainment'
    },
    {
      id: 'hulu',
      name: 'Hulu',
      icon: '🎭',
      url: 'https://www.hulu.com',
      color: 'bg-green-500',
      category: 'Entertainment'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      url: 'https://open.spotify.com',
      color: 'bg-green-600',
      category: 'Music'
    },
    {
      id: 'twitch',
      name: 'Twitch',
      icon: '🎮',
      url: 'https://www.twitch.tv',
      color: 'bg-purple-600',
      category: 'Gaming'
    },
    {
      id: 'hbomax',
      name: 'HBO Max',
      icon: '🎪',
      url: 'https://www.hbomax.com',
      color: 'bg-purple-700',
      category: 'Entertainment'
    }
  ];

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!focused) return;

      const gridCols = 4; // Number of columns in the grid
      const totalApps = apps.length;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setFocusedApp(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'ArrowRight':
          event.preventDefault();
          setFocusedApp(prev => prev < totalApps - 1 ? prev + 1 : prev);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedApp(prev => prev >= gridCols ? prev - gridCols : prev);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedApp(prev => prev + gridCols < totalApps ? prev + gridCols : prev);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleAppClick(apps[focusedApp]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focused, apps, focusedApp]);

  const handleAppClick = (app: App) => {
    console.log(`Opening ${app.name}...`);
    window.open(app.url, '_blank');
  };

  return (
    <div className="app-grid">
      {apps.map((app, index) => (
        <div
          key={app.id}
          className={`tv-card p-6 cursor-pointer group ${
            focused && index === focusedApp ? 'focused' : ''
          }`}
          onClick={() => handleAppClick(app)}
        >
          {/* App Icon */}
          <div className={`w-16 h-16 ${app.color} rounded-2xl flex items-center justify-center mb-4 text-2xl transition-transform`}>
            {app.icon}
          </div>
          
          {/* App Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{app.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{app.category}</p>
            
            {/* Action Indicator */}
            <div className="flex items-center text-xs text-gray-500">
              <ExternalLink size={12} className="mr-1" />
              <span>Open App</span>
            </div>
          </div>

          {/* Focus Indicator */}
          {focused && index === focusedApp && (
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/30 rounded-xl -z-10"></div>
          )}
        </div>
      ))}
    </div>
  );
};

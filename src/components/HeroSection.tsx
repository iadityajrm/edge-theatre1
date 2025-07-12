
import React from 'react';
import { Play, Info, Star } from 'lucide-react';

interface HeroSectionProps {
  focused: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ focused }) => {
  const featuredContent = {
    title: "WorkingEDGE Originals",
    subtitle: "Discover Amazing Content",
    description: "Experience the future of entertainment with AI-powered recommendations and seamless streaming across all your favorite platforms.",
    rating: "4.8",
    year: "2024",
    duration: "Premium Experience"
  };

  return (
    <section className={`relative h-96 rounded-2xl overflow-hidden transition-all duration-300 ${focused ? 'ring-4 ring-primary/50' : ''}`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 hero-gradient"></div>
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent">
        <div className="flex flex-col justify-center h-full px-12">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-primary px-3 py-1 rounded-full text-sm font-semibold">
                FEATURED
              </span>
              <div className="flex items-center space-x-2 text-gray-300">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{featuredContent.rating}</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{featuredContent.year}</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{featuredContent.duration}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl font-bold mb-4 text-white">
              {featuredContent.title}
            </h1>
            
            {/* Subtitle */}
            <h2 className="text-xl font-medium mb-4 text-gray-200">
              {featuredContent.subtitle}
            </h2>
            
            {/* Description */}
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              {featuredContent.description}
            </p>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button className="flex items-center space-x-3 bg-white text-black px-8 py-3 rounded-lg font-semibold transition-colors">
                <Play size={20} className="fill-black" />
                <span>Get Started</span>
              </button>
              
              <button className="flex items-center space-x-3 bg-gray-700/80 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                <Info size={20} />
                <span>Learn More</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>
      
      <div className="absolute bottom-4 right-4 text-xs text-gray-400">
        Powered by WorkingEDGE AI
      </div>
    </section>
  );
};


import React, { useEffect } from 'react';

interface NavigationHandlerProps {
  focusedSection: 'hero' | 'apps' | 'header';
  setFocusedSection: (section: 'hero' | 'apps' | 'header') => void;
  focusedHeaderItem: number;
  setFocusedHeaderItem: (item: number) => void;
}

export const NavigationHandler: React.FC<NavigationHandlerProps> = ({
  focusedSection,
  setFocusedSection,
  focusedHeaderItem,
  setFocusedHeaderItem
}) => {
  useEffect(() => {
    const handleGlobalKeyPress = (event: KeyboardEvent) => {
      // Handle global navigation between sections
      switch (event.key) {
        case 'ArrowUp':
          if (focusedSection === 'apps') {
            event.preventDefault();
            setFocusedSection('hero');
            // Scroll to hero section
            document.querySelector('.hero-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (focusedSection === 'hero') {
            event.preventDefault();
            setFocusedSection('header');
            setFocusedHeaderItem(0);
          }
          break;
        case 'ArrowDown':
          if (focusedSection === 'hero') {
            event.preventDefault();
            setFocusedSection('apps');
            // Scroll to apps section
            document.querySelector('.apps-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (focusedSection === 'header') {
            event.preventDefault();
            setFocusedSection('hero');
          }
          break;
        case 'ArrowLeft':
          if (focusedSection === 'header' && focusedHeaderItem > 0) {
            event.preventDefault();
            setFocusedHeaderItem(focusedHeaderItem - 1);
          }
          break;
        case 'ArrowRight':
          if (focusedSection === 'header' && focusedHeaderItem < 1) {
            event.preventDefault();
            setFocusedHeaderItem(focusedHeaderItem + 1);
          }
          break;
        case 'Enter':
        case ' ':
          if (focusedSection === 'header') {
            event.preventDefault();
            if (focusedHeaderItem === 0) {
              console.log('Search activated');
              // Add search functionality here
            } else if (focusedHeaderItem === 1) {
              console.log('Settings activated');
              // Add settings functionality here
            }
          }
          break;
        case 'Home':
          event.preventDefault();
          setFocusedSection('hero');
          document.querySelector('.hero-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        case 'Escape':
          event.preventDefault();
          setFocusedSection('hero');
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress, true);
  }, [focusedSection, setFocusedSection, focusedHeaderItem, setFocusedHeaderItem]);

  return null; // This component doesn't render anything
};

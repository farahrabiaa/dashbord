import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function Logo({ size = 'md', withText = true, className = '' }) {
  const { settings } = useSettings();
  
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizes[size]} rounded-lg shadow-lg flex items-center justify-center bg-blue-600 text-white`}>
        <span className="text-xl">🛒</span>
      </div>
      {withText && (
        <h2 className={`mr-2 font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent ${textSizes[size]}`}>
          {settings.store.name}
        </h2>
      )}
    </div>
  );
}
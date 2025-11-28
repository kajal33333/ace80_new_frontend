"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatLastSeen } from '@/lib/chatUtils';

const OnlineStatus = ({ 
  isOnline, 
  lastSeen, 
  showDot = true,
  showText = true,
  className = ""
}) => {
  if (!showDot && !showText) return null;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Online Dot */}
      {showDot && (
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
      
      {/* Status Text */}
      {showText && (
        <span className={`text-xs ${
          isOnline ? 'text-green-600' : 'text-gray-500'
        }`}>
          {isOnline ? 'Online' : formatLastSeen(lastSeen)}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;

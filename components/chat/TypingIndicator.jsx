"use client";

import React from 'react';

const TypingIndicator = ({ userName, isVisible = true }) => {
  if (!isVisible || !userName) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
      <span>{userName} is typing</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;

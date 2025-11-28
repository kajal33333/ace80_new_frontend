"use client";

import { useEffect, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { playNotificationSound, showNotification } from '@/lib/chatUtils';

/**
 * Custom hook for managing chat-related Socket.IO events
 * Provides centralized event handling for all chat components
 */
export const useChatEvents = ({
  onNewMessage,
  onNotificationNewMessage,
  onTypingStart,
  onTypingStop,
  onMessageReadReceipt,
  onConversationAllRead,
  onUserOnline,
  onUserOffline,
  onError,
  enableNotifications = true,
  enableSounds = true
}) => {
  const { on, off, isConnected } = useSocket();

  // Handle new message event
  const handleNewMessage = useCallback((data) => {
    console.log('New message received:', data);
    if (onNewMessage) {
      onNewMessage(data);
    }
  }, [onNewMessage]);

  // Handle notification for new message (when not in conversation)
  const handleNotificationNewMessage = useCallback((data) => {
    console.log('New message notification:', data);
    
    if (enableSounds) {
      playNotificationSound();
    }
    
    if (enableNotifications) {
      showNotification(
        `New message from ${data.sender?.name || 'Unknown'}`,
        {
          body: data.message?.content || 'New message',
          tag: `conversation-${data.conversationId}`,
          requireInteraction: false
        }
      );
    }
    
    if (onNotificationNewMessage) {
      onNotificationNewMessage(data);
    }
  }, [onNotificationNewMessage, enableSounds, enableNotifications]);

  // Handle typing start
  const handleTypingStart = useCallback((data) => {
    console.log('User started typing:', data);
    if (onTypingStart) {
      onTypingStart(data);
    }
  }, [onTypingStart]);

  // Handle typing stop
  const handleTypingStop = useCallback((data) => {
    console.log('User stopped typing:', data);
    if (onTypingStop) {
      onTypingStop(data);
    }
  }, [onTypingStop]);

  // Handle message read receipt
  const handleMessageReadReceipt = useCallback((data) => {
    console.log('Message read receipt:', data);
    if (onMessageReadReceipt) {
      onMessageReadReceipt(data);
    }
  }, [onMessageReadReceipt]);

  // Handle conversation marked as read
  const handleConversationAllRead = useCallback((data) => {
    console.log('Conversation marked as read:', data);
    if (onConversationAllRead) {
      onConversationAllRead(data);
    }
  }, [onConversationAllRead]);

  // Handle user online
  const handleUserOnline = useCallback((data) => {
    console.log('User came online:', data);
    if (onUserOnline) {
      onUserOnline(data);
    }
  }, [onUserOnline]);

  // Handle user offline
  const handleUserOffline = useCallback((data) => {
    console.log('User went offline:', data);
    if (onUserOffline) {
      onUserOffline(data);
    }
  }, [onUserOffline]);

  // Handle socket errors
  const handleError = useCallback((error) => {
    console.error('Socket error:', error);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Register event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Create stable handler references
    const handlers = {
      'message:new': handleNewMessage,
      'notification:new-message': handleNotificationNewMessage,
      'typing:user-typing': handleTypingStart,
      'typing:user-stopped': handleTypingStop,
      'message:read-receipt': handleMessageReadReceipt,
      'conversation:all-read': handleConversationAllRead,
      'user:online': handleUserOnline,
      'user:offline': handleUserOffline,
      'error': handleError
    };

    // Register all event listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      on(event, handler);
    });

    // Cleanup function
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        off(event, handler);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConnected,
    // Only re-register if these core dependencies change
    onNewMessage,
    onNotificationNewMessage,
    onTypingStart,
    onTypingStop,
    onMessageReadReceipt,
    onConversationAllRead,
    onUserOnline,
    onUserOffline,
    onError
  ]);

  // Return connection status for components to use
  return {
    isConnected
  };
};

export default useChatEvents;

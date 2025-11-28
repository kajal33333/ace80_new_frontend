"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { 
  getConversationById, 
  getMessages, 
  updateConversationStatus,
  getCurrentUser 
} from '@/lib/chatApi';
import { useSocket } from '@/context/SocketContext';
import { useChatEvents } from '@/hooks/useChatEvents';
import { formatTimestamp, getStatusLabel, getStatusColor } from '@/lib/chatUtils';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import OnlineStatus from '@/components/chat/OnlineStatus';
import { showError, showSuccess } from '@/lib/toastUtils';

const ChatWindow = ({ conversationId }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const joinedRoomRef = useRef(null);
  const router = useRouter();
  const { emit, isConnected } = useSocket();
  const currentUser = getCurrentUser();
  const limit = 50;

  // Load conversation details
  const loadConversation = useCallback(async () => {
    try {
      const response = await getConversationById(conversationId);
      if (response.data) {
        setConversation(response.data);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      showError('Failed to load conversation');
    }
  }, [conversationId]);

  // Load messages
  const loadMessages = useCallback(async (page = 1, append = false) => {
    try {
      setMessagesLoading(true);
      // Disable auto-scroll when loading history
      if (append) {
        setShouldAutoScroll(false);
      }
      
      const response = await getMessages(conversationId, page, limit);
      
      if (response.data) {
        const newMessages = response.data;
        setMessages(prev => append ? [...newMessages, ...prev] : newMessages);
        setCurrentPage(page);
        setHasMoreMessages(newMessages.length === limit);
        
        // Re-enable auto-scroll after a delay
        if (append) {
          setTimeout(() => setShouldAutoScroll(true), 500);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      showError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  }, [conversationId, limit]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadConversation(),
        loadMessages()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [loadConversation, loadMessages]);

  // Join conversation room
  useEffect(() => {
    if (conversation && isConnected && joinedRoomRef.current !== conversationId) {
      // Leave previous room if any
      if (joinedRoomRef.current) {
        emit('conversation:leave', { conversationId: joinedRoomRef.current });
      }
      
      // Join new room
      emit('conversation:join', { conversationId });
      emit('conversation:mark-all-read', { conversationId });
      joinedRoomRef.current = conversationId;
    }
  }, [conversation, isConnected, conversationId, emit]);

  // Leave room on unmount or conversation change
  useEffect(() => {
    return () => {
      if (joinedRoomRef.current && isConnected) {
        emit('conversation:leave', { conversationId: joinedRoomRef.current });
        joinedRoomRef.current = null;
      }
    };
  }, [emit, isConnected]);

  // Scroll to bottom only for new messages
  useEffect(() => {
    if (messagesEndRef.current && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Handle new message
  const handleNewMessage = useCallback((data) => {
    if (data.conversationId === conversationId) {
      setMessages(prev => [...prev, data.message]);
      
      // Update conversation with new last message
      setConversation(prev => ({
        ...prev,
        lastMessage: data.message,
        updatedAt: new Date()
      }));
    }
  }, [conversationId]);

  // Handle typing start
  const handleTypingStart = useCallback((data) => {
    if (data.conversationId === conversationId) {
      setTypingUser(data.userName);
    }
  }, [conversationId]);

  // Handle typing stop
  const handleTypingStop = useCallback((data) => {
    if (data.conversationId === conversationId) {
      setTypingUser(null);
    }
  }, [conversationId]);

  // Handle message read receipt
  const handleMessageReadReceipt = useCallback((data) => {
    if (data.conversationId === conversationId) {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
    }
  }, [conversationId]);

  // Handle user online/offline
  const handleUserOnline = useCallback((data) => {
    if (conversation && conversation.userId._id === data.userId) {
      setConversation(prev => ({
        ...prev,
        userId: { ...prev.userId, isOnline: true }
      }));
    }
  }, [conversation]);

  const handleUserOffline = useCallback((data) => {
    if (conversation && conversation.userId._id === data.userId) {
      setConversation(prev => ({
        ...prev,
        userId: { ...prev.userId, isOnline: false, lastSeen: data.lastSeen }
      }));
    }
  }, [conversation]);

  // Register chat events
  useChatEvents({
    onNewMessage: handleNewMessage,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
    onMessageReadReceipt: handleMessageReadReceipt,
    onUserOnline: handleUserOnline,
    onUserOffline: handleUserOffline,
  });

  // Handle status change
  const handleStatusChange = useCallback(async (newStatus) => {
    try {
      await updateConversationStatus(conversationId, newStatus);
      setConversation(prev => ({ ...prev, status: newStatus }));
      showSuccess('Conversation status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update conversation status');
    }
  }, [conversationId]);

  // Handle load more messages
  const handleLoadMore = useCallback(() => {
    if (!messagesLoading && hasMoreMessages) {
      loadMessages(currentPage + 1, true);
    }
  }, [loadMessages, currentPage, messagesLoading, hasMoreMessages]);

  // Handle message sent
  const handleMessageSent = useCallback(() => {
    // Scroll to bottom after sending
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);

  // Get other participant
  const otherParticipant = conversation?.userId._id.toString() === currentUser?.id
    ? conversation?.assignedSupportId
    : conversation?.userId;

  const participantName = otherParticipant?.first_name && otherParticipant?.last_name
    ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
    : otherParticipant?.phone || 'Unknown';

  const participantInitials = otherParticipant?.first_name && otherParticipant?.last_name
    ? `${otherParticipant.first_name[0]}${otherParticipant.last_name[0]}`
    : otherParticipant?.phone?.[0] || 'U';

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="border-b p-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        
        {/* Messages Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Conversation not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This conversation may have been deleted or you don't have access to it.
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <Avatar className="w-10 h-10">
              <AvatarImage src={`${process.env.NEXT_PUBLIC_FILEURL}` + otherParticipant?.image} alt={participantName} />
              <AvatarFallback>
                {participantInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {participantName}
              </h2>
              <OnlineStatus 
                isOnline={otherParticipant?.isOnline}
                lastSeen={otherParticipant?.lastSeen}
                showDot={true}
                showText={true}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Status Selector */}
            <Select 
              value={conversation.status} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(conversation.status)}`}
            >
              {getStatusLabel(conversation.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4"
        onScrollCapture={(e) => {
          const { scrollTop } = e.target;
          if (scrollTop === 0 && hasMoreMessages && !messagesLoading) {
            handleLoadMore();
          }
        }}
      >
        <div className="space-y-4">
          {/* Load More Button */}
          {hasMoreMessages && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={messagesLoading}
              >
                {messagesLoading ? 'Loading...' : 'Load More Messages'}
              </Button>
            </div>
          )}
          
          {/* Messages */}
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId._id.toString() === currentUser?.id;
            const showAvatar = index === 0 || 
              messages[index - 1]?.senderId._id.toString() !== message.senderId._id.toString();
            const showSenderName = !isOwnMessage && showAvatar;
            
            return (
              <MessageBubble
                key={message._id}
                message={message}
                isOwnMessage={isOwnMessage}
                showAvatar={showAvatar}
                showSenderName={showSenderName}
              />
            );
          })}
          
          {/* Typing Indicator */}
          {typingUser && (
            <TypingIndicator userName={typingUser} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <ChatInput
        conversationId={conversationId}
        onMessageSent={handleMessageSent}
        disabled={!isConnected}
      />
    </div>
  );
};

export default ChatWindow;

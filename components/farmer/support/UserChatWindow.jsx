"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { 
  getConversations, 
  getMessages, 
  getCurrentUser 
} from '@/lib/chatApi';
import { useSocket } from '@/context/SocketContext';
import { useChatEvents } from '@/hooks/useChatEvents';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import OnlineStatus from '@/components/chat/OnlineStatus';
import { showError } from '@/lib/toastUtils';

const UserChatWindow = () => {
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

  // Load conversation
  const loadConversation = useCallback(async () => {
    try {
      const response = await getConversations(1, 1);
      
      if (response.data && response.data.length > 0) {
        setConversation(response.data[0]);
        return response.data[0];
      } else {
        // No conversation found, redirect to contact support
        router.push('/farmer/support');
        return null;
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      showError('Failed to load conversation');
      router.push('/farmer/support');
      return null;
    }
  }, [router]);

  // Load messages
  const loadMessages = useCallback(async (conversationId, page = 1, append = false) => {
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
  }, [limit]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const conv = await loadConversation();
      
      if (conv) {
        await loadMessages(conv._id);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [loadConversation, loadMessages]);

  // Join conversation room
  useEffect(() => {
    if (conversation && isConnected && joinedRoomRef.current !== conversation._id) {
      // Leave previous room if any
      if (joinedRoomRef.current) {
        emit('conversation:leave', { conversationId: joinedRoomRef.current });
      }
      
      // Join new room
      emit('conversation:join', { conversationId: conversation._id });
      emit('conversation:mark-all-read', { conversationId: conversation._id });
      joinedRoomRef.current = conversation._id;
    }
  }, [conversation, isConnected, emit]);

  // Leave room on unmount
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
    if (conversation && data.conversationId === conversation._id) {
      setMessages(prev => [...prev, data.message]);
      
      // Update conversation with new last message
      setConversation(prev => ({
        ...prev,
        lastMessage: data.message,
        updatedAt: new Date()
      }));
    }
  }, [conversation]);

  // Handle typing start
  const handleTypingStart = useCallback((data) => {
    if (conversation && data.conversationId === conversation._id) {
      setTypingUser(data.userName);
    }
  }, [conversation]);

  // Handle typing stop
  const handleTypingStop = useCallback((data) => {
    if (conversation && data.conversationId === conversation._id) {
      setTypingUser(null);
    }
  }, [conversation]);

  // Handle message read receipt
  const handleMessageReadReceipt = useCallback((data) => {
    if (conversation && data.conversationId === conversation._id) {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
    }
  }, [conversation]);

  // Handle user online/offline
  const handleUserOnline = useCallback((data) => {
    if (conversation && conversation.assignedSupportId._id === data.userId) {
      setConversation(prev => ({
        ...prev,
        assignedSupportId: { ...prev.assignedSupportId, isOnline: true }
      }));
    }
  }, [conversation]);

  const handleUserOffline = useCallback((data) => {
    if (conversation && conversation.assignedSupportId._id === data.userId) {
      setConversation(prev => ({
        ...prev,
        assignedSupportId: { ...prev.assignedSupportId, isOnline: false, lastSeen: data.lastSeen }
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

  // Handle load more messages
  const handleLoadMore = useCallback(() => {
    if (!messagesLoading && hasMoreMessages && conversation) {
      loadMessages(conversation._id, currentPage + 1, true);
    }
  }, [loadMessages, currentPage, messagesLoading, hasMoreMessages, conversation]);

  // Handle message sent
  const handleMessageSent = useCallback(() => {
    // Scroll to bottom after sending
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);

  // Get support agent info
  const supportAgent = conversation?.assignedSupportId;
  const supportName = supportAgent?.first_name && supportAgent?.last_name
    ? `${supportAgent.first_name} ${supportAgent.last_name}`
    : 'Support Team';

  const supportInitials = supportAgent?.first_name && supportAgent?.last_name
    ? `${supportAgent.first_name[0]}${supportAgent.last_name[0]}`
    : 'ST';

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
            No conversation found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please contact support to start a conversation.
          </p>
          <Button onClick={() => router.push('/farmer/support')}>
            Contact Support
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
              onClick={() => router.push('/farmer/support')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <Avatar className="w-10 h-10">
              <AvatarImage src={`${process.env.NEXT_PUBLIC_FILEURL}` + supportAgent?.image} alt={supportName} />
              <AvatarFallback>
                {supportInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {supportName}
              </h2>
              <OnlineStatus 
                isOnline={supportAgent?.isOnline}
                lastSeen={supportAgent?.lastSeen}
                showDot={true}
                showText={true}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Support Chat
            </span>
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
        conversationId={conversation._id}
        onMessageSent={handleMessageSent}
        disabled={!isConnected}
      />
    </div>
  );
};

export default UserChatWindow;

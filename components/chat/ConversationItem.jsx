"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  formatConversationTimestamp, 
  getMessagePreview, 
  getUnreadCount,
  getStatusColor,
  getStatusLabel 
} from '@/lib/chatUtils';
import OnlineStatus from './OnlineStatus';

const ConversationItem = ({ 
  conversation, 
  currentUserId, 
  onClick,
  isSelected = false 
}) => {
  if (!conversation) return null;

  const { 
    _id, 
    userId, 
    assignedSupportId, 
    lastMessage, 
    status, 
    updatedAt 
  } = conversation;

  // Determine the other participant
  const otherParticipant = userId._id.toString() === currentUserId 
    ? assignedSupportId 
    : userId;

  const participantName = otherParticipant?.first_name && otherParticipant?.last_name
    ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
    : otherParticipant?.phone || 'Unknown';

  const participantInitials = otherParticipant?.first_name && otherParticipant?.last_name
    ? `${otherParticipant.first_name[0]}${otherParticipant.last_name[0]}`
    : otherParticipant?.phone?.[0] || 'U';

  const unreadCount = getUnreadCount(conversation, currentUserId);
  const hasUnread = unreadCount > 0;
  const lastMessagePreview = getMessagePreview(lastMessage);
  const timestamp = formatConversationTimestamp(updatedAt);

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onClick={() => onClick?.(conversation)}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={`${process.env.NEXT_PUBLIC_FILEURL}` + otherParticipant?.image} alt={participantName} />
            <AvatarFallback className="text-sm">
              {participantInitials}
            </AvatarFallback>
          </Avatar>
          
          {/* Online Status */}
          <div className="absolute -bottom-1 -right-1">
            <OnlineStatus 
              isOnline={otherParticipant?.isOnline}
              lastSeen={otherParticipant?.lastSeen}
              showDot={true}
              showText={false}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            {/* Name */}
            <h3 className={`text-sm font-medium truncate ${
              hasUnread ? 'font-semibold' : 'font-normal'
            }`}>
              {participantName}
            </h3>
            
            {/* Timestamp */}
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {timestamp}
            </span>
          </div>

          {/* Last Message */}
          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${
              hasUnread ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {lastMessagePreview || 'No messages yet'}
            </p>
            
            {/* Unread Badge */}
            {hasUnread && (
              <Badge 
                variant="destructive" 
                className="ml-2 flex-shrink-0 text-xs px-2 py-0.5"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>

          {/* Status Badge */}
          <div className="mt-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(status)}`}
            >
              {getStatusLabel(status)}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConversationItem;

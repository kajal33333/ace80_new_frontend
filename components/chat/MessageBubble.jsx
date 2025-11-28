"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Check, 
  CheckCheck, 
  Play, 
  Pause, 
  Volume2, 
  Download,
  X
} from 'lucide-react';
import { formatTimestamp } from '@/lib/chatUtils';

const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  showAvatar = true,
  showSenderName = true 
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  if (!message) return null;

  const { senderId, messageType, content, mediaId, createdAt, isRead, readAt } = message;

  // Get sender name
  const senderName = senderId?.first_name && senderId?.last_name 
    ? `${senderId.first_name} ${senderId.last_name}`
    : senderId?.phone || 'Unknown';

  // Get sender initials for avatar
  const senderInitials = senderId?.first_name && senderId?.last_name
    ? `${senderId.first_name[0]}${senderId.last_name[0]}`
    : senderId?.phone?.[0] || 'U';

  // Render read receipt
  const renderReadReceipt = () => {
    if (!isOwnMessage) return null;
    
    if (isRead && readAt) {
      return (
        <div className="flex items-center text-xs text-blue-500 mt-1">
          <CheckCheck className="w-3 h-3 mr-1" />
          <span>Read {formatTimestamp(readAt)}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-xs text-gray-400 mt-1">
        <Check className="w-3 h-3 mr-1" />
        <span>Delivered</span>
      </div>
    );
  };

  // Render media content
  const renderMediaContent = () => {
    if (!mediaId) return null;

    switch (messageType) {
      case 'image':
        return (
          <div className="mt-2">
            <img
              src={mediaId.url}
              alt={mediaId.name || 'Image'}
              className="max-w-xs max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsImageModalOpen(true)}
            />
            {mediaId.name && (
              <p className="text-xs text-gray-500 mt-1">{mediaId.name}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="mt-2">
            <div className="relative">
              <video
                src={mediaId.url}
                controls
                className="max-w-xs max-h-64 rounded-lg"
                poster={mediaId.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            {mediaId.name && (
              <p className="text-xs text-gray-500 mt-1">{mediaId.name}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="mt-2">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                className="p-2"
              >
                {isAudioPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Volume2 className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <audio
                  src={mediaId.url}
                  controls
                  className="w-full"
                  onPlay={() => setIsAudioPlaying(true)}
                  onPause={() => setIsAudioPlaying(false)}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
              {mediaId.name && (
                <p className="text-xs text-gray-500">{mediaId.name}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {showAvatar && !isOwnMessage && (
            <div className="flex-shrink-0 mr-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={`${process.env.NEXT_PUBLIC_FILEURL}` + senderId?.image} alt={senderName} />
                <AvatarFallback className="text-xs">
                  {senderInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Message Content */}
          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            {/* Sender Name */}
            {showSenderName && !isOwnMessage && (
              <div className="text-xs text-gray-500 mb-1 px-2">
                {senderName}
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`px-4 py-2 rounded-2xl ${
                isOwnMessage
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
              }`}
            >
              {/* Text Content */}
              {messageType === 'text' && content && (
                <div className="whitespace-pre-wrap break-words">
                  {content}
                </div>
              )}

              {/* Media Content */}
              {renderMediaContent()}

              {/* Timestamp */}
              <div className={`text-xs mt-1 ${
                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTimestamp(createdAt)}
              </div>
            </div>

            {/* Read Receipt */}
            {renderReadReceipt()}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>{mediaId?.name || 'Image'}</span>
              <div className="flex items-center space-x-2">
                {mediaId?.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = mediaId.url;
                      link.download = mediaId.name || 'image';
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsImageModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {mediaId?.url && (
              <img
                src={mediaId.url}
                alt={mediaId.name || 'Image'}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageBubble;

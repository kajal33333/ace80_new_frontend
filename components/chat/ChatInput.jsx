"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, X } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { uploadChatMedia } from '@/lib/chatApi';
import { validateChatFile, generateTempId } from '@/lib/chatUtils';
import { showError, showSuccess } from '@/lib/toastUtils';
import MediaUploadPreview from './MediaUploadPreview';

const ChatInput = ({ 
  conversationId, 
  onMessageSent,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastEmittedTypingRef = useRef(false);
  const { emit, isConnected } = useSocket();

  // Handle typing indicators (optimized)
  useEffect(() => {
    if (!isConnected) return;

    if (message.trim() && !lastEmittedTypingRef.current) {
      setIsTyping(true);
      emit('typing:start', { conversationId });
      lastEmittedTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    if (message.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        if (lastEmittedTypingRef.current) {
          setIsTyping(false);
          emit('typing:stop', { conversationId });
          lastEmittedTypingRef.current = false;
        }
      }, 2000);
    } else {
      // Message cleared, stop typing immediately
      if (lastEmittedTypingRef.current) {
        setIsTyping(false);
        emit('typing:stop', { conversationId });
        lastEmittedTypingRef.current = false;
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, conversationId, emit, isConnected]);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (lastEmittedTypingRef.current && isConnected) {
        emit('typing:stop', { conversationId });
        lastEmittedTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, emit, isConnected]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    for (const file of files) {
      const validation = validateChatFile(file);
      if (!validation.valid) {
        showError(validation.error);
        return;
      }
    }

    setSelectedFiles(prev => [...prev, ...files]);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    try {
      const fileType = getFileType(selectedFiles[0].type);
      const response = await uploadChatMedia(selectedFiles, fileType);
      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      showError('Failed to upload files');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'image';
  };

  const sendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;
    if (!isConnected) {
      showError('Not connected to server');
      return;
    }
    if (sendingMessage) return; // Prevent duplicate sends

    const tempId = generateTempId();
    setSendingMessage(true);

    try {
      // If there are files, upload them first
      if (selectedFiles.length > 0) {
        const uploadedMedia = await uploadFiles();
        
        if (uploadedMedia.length === 0) {
          showError('Failed to upload media');
          setSendingMessage(false);
          return;
        }

        // Send media message(s) with acknowledgment
        for (const media of uploadedMedia) {
          emit('message:send', 
            {
              conversationId,
              messageType: media.type,
              mediaId: media._id,
              tempId: generateTempId()
            },
            (response) => {
              if (response?.error) {
                console.error('Failed to send media:', response.error);
                showError('Failed to send media message');
              }
            }
          );
        }

        // Send text message if there's text
        if (message.trim()) {
          emit('message:send', 
            {
              conversationId,
              messageType: 'text',
              content: message.trim(),
              tempId: generateTempId()
            },
            (response) => {
              if (response?.error) {
                console.error('Failed to send message:', response.error);
                showError('Failed to send message');
              }
            }
          );
        }
      } else {
        // Send text message with acknowledgment
        emit('message:send', 
          {
            conversationId,
            messageType: 'text',
            content: message.trim(),
            tempId
          },
          (response) => {
            if (response?.error) {
              console.error('Failed to send message:', response.error);
              showError('Failed to send message');
            }
          }
        );
      }

      // Clear input and files
      setMessage('');
      setSelectedFiles([]);
      
      // Stop typing indicator
      if (lastEmittedTypingRef.current) {
        setIsTyping(false);
        emit('typing:stop', { conversationId });
        lastEmittedTypingRef.current = false;
      }

      // Notify parent component
      if (onMessageSent) {
        onMessageSent();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const canSend = (message.trim() || selectedFiles.length > 0) && !isUploading && !sendingMessage && isConnected;

  return (
    <div className="border-t bg-white dark:bg-gray-900 p-4">
      {/* Media Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <MediaUploadPreview 
            files={selectedFiles} 
            onRemove={removeFile}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-2">
        {/* File Upload Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-2"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Message Input */}
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled || isUploading}
            className="min-h-[40px] max-h-32 resize-none"
            style={{ 
              minHeight: '40px',
              maxHeight: '128px',
              height: 'auto'
            }}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={sendMessage}
          disabled={!canSend}
          size="sm"
          className="p-2"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Upload Status */}
      {isUploading && (
        <div className="mt-2 text-sm text-gray-500">
          Uploading files...
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="mt-2 text-sm text-red-500">
          Disconnected from server
        </div>
      )}
    </div>
  );
};

export default ChatInput;

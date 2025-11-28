"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { createOrGetConversation, getConversations, getCurrentUser } from '@/lib/chatApi';
import { formatConversationTimestamp, getMessagePreview, getUnreadCount } from '@/lib/chatUtils';
import { showError, showSuccess } from '@/lib/toastUtils';

const MyConversation = () => {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const currentUser = getCurrentUser();

  // Load existing conversation
  const loadConversation = async () => {
    try {
      setLoading(true);
      const response = await getConversations(1, 1);
      
      if (response.data && response.data.length > 0) {
        setConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      showError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  // Create or get conversation
  const handleContactSupport = async () => {
    try {
      setCreating(true);
      const response = await createOrGetConversation();
      
      if (response.data) {
        setConversation(response.data);
        showSuccess('Connected to support team');
        
        // Redirect to chat
        router.push('/farmer/support/chat');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      showError('Failed to connect to support');
    } finally {
      setCreating(false);
    }
  };

  // Load conversation on mount
  useEffect(() => {
    loadConversation();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-12 w-32" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Support Information */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              AgriTech Support Team
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our expert support team is here to help you with farming questions, 
              crop issues, and technical assistance.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>24/7 Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Expert Help</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Existing Conversation */}
      {conversation ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Your Support Conversation
              </h3>
              <Badge variant="outline" className="capitalize">
                {conversation.status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Last message:</span>
                <span>{getMessagePreview(conversation.lastMessage) || 'No messages yet'}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Last updated:</span>
                <span>{formatConversationTimestamp(conversation.updatedAt)}</span>
              </div>
              
              {getUnreadCount(conversation, currentUser?.id) > 0 && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <span>{getUnreadCount(conversation, currentUser?.id)} unread messages</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => router.push('/farmer/support/chat')}
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Continue Chat
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* No Conversation - Contact Support */
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start a conversation with our support team to get help with your farming needs.
              </p>
            </div>
            
            <Button 
              onClick={handleContactSupport}
              disabled={creating}
              size="lg"
              className="w-full"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Support Features */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          What We Can Help With
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Crop Issues</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Disease identification</li>
              <li>• Pest management</li>
              <li>• Nutrient deficiencies</li>
              <li>• Weather impact</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Technical Support</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• App usage help</li>
              <li>• Account issues</li>
              <li>• Feature questions</li>
              <li>• Bug reports</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyConversation;

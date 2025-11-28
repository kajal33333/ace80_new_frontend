"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Search, RefreshCw, MessageSquare } from 'lucide-react';
import { getConversations, getCurrentUser } from '@/lib/chatApi';
import { useChatEvents } from '@/hooks/useChatEvents';
import ConversationItem from '@/components/chat/ConversationItem';
import { showError, showSuccess } from '@/lib/toastUtils';

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  const currentUser = getCurrentUser();
  const limit = 20;

  // Load conversations
  const loadConversations = useCallback(async (page = 1, status = statusFilter, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await getConversations(page, limit, status);
      
      if (response.data) {
        setConversations(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      showError('Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, searchTerm, limit]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadConversations(1, statusFilter, value);
  }, [loadConversations, statusFilter]);

  // Handle status filter
  const handleStatusFilter = useCallback((value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    loadConversations(1, value, searchTerm);
  }, [loadConversations, searchTerm]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations(currentPage, statusFilter, searchTerm);
  }, [loadConversations, currentPage, statusFilter, searchTerm]);

  // Handle conversation click
  const handleConversationClick = useCallback((conversation) => {
    router.push(`/admin/support-chat/${conversation._id}`);
  }, [router]);

  // Handle new message notification
  const handleNotificationNewMessage = useCallback((data) => {
    // Refresh conversations to show updated unread count
    handleRefresh();
  }, [handleRefresh]);

  // Handle user online/offline
  const handleUserOnline = useCallback((data) => {
    // Update conversation list to reflect online status
    setConversations(prev => 
      prev.map(conv => {
        if (conv.userId._id === data.userId) {
          return {
            ...conv,
            userId: { ...conv.userId, isOnline: true }
          };
        }
        return conv;
      })
    );
  }, []);

  const handleUserOffline = useCallback((data) => {
    // Update conversation list to reflect offline status
    setConversations(prev => 
      prev.map(conv => {
        if (conv.userId._id === data.userId) {
          return {
            ...conv,
            userId: { ...conv.userId, isOnline: false, lastSeen: data.lastSeen }
          };
        }
        return conv;
      })
    );
  }, []);

  // Register chat events
  useChatEvents({
    onNotificationNewMessage: handleNotificationNewMessage,
    onUserOnline: handleUserOnline,
    onUserOffline: handleUserOffline,
  });

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    
    const userName = conversation.userId?.first_name && conversation.userId?.last_name
      ? `${conversation.userId.first_name} ${conversation.userId.last_name}`
      : conversation.userId?.phone || '';
    
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    loadConversations(page, statusFilter, searchTerm);
  }, [loadConversations, statusFilter, searchTerm]);

  if (loading && conversations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalItems} conversations
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            Page {currentPage} of {totalPages}
          </Badge>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by farmer name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No conversations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter 
                ? 'Try adjusting your search or filter criteria'
                : 'No conversations have been started yet'
              }
            </p>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              currentUserId={currentUser?.id}
              onClick={handleConversationClick}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationsList;

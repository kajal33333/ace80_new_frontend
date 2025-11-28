"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, RefreshCw, MessageSquare, Users, BarChart3, ArrowUpDown } from 'lucide-react';
import { 
  getAllConversationsForSupport, 
  getConversationStats, 
  reassignConversation,
  getCurrentUser,
  isAdmin 
} from '@/lib/chatApi';
import { useChatEvents } from '@/hooks/useChatEvents';
import ConversationItem from '@/components/chat/ConversationItem';
import { showError, showSuccess } from '@/lib/toastUtils';

const AllConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newSupportId, setNewSupportId] = useState('');
  const [reassigning, setReassigning] = useState(false);
  
  const router = useRouter();
  const currentUser = getCurrentUser();
  const limit = 20;

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Only administrators can access this page.
        </p>
      </div>
    );
  }

  // Load conversations
  const loadConversations = useCallback(async (page = 1, status = statusFilter, assignedTo = assignedToFilter, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await getAllConversationsForSupport(page, limit, status, assignedTo);
      
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
  }, [statusFilter, assignedToFilter, searchTerm, limit]);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await getConversationStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      showError('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadConversations(),
        loadStats()
      ]);
    };
    
    loadData();
  }, [loadConversations, loadStats]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadConversations(1, statusFilter, assignedToFilter, value);
  }, [loadConversations, statusFilter, assignedToFilter]);

  // Handle status filter
  const handleStatusFilter = useCallback((value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    loadConversations(1, value, assignedToFilter, searchTerm);
  }, [loadConversations, assignedToFilter, searchTerm]);

  // Handle assigned to filter
  const handleAssignedToFilter = useCallback((value) => {
    setAssignedToFilter(value);
    setCurrentPage(1);
    loadConversations(1, statusFilter, value, searchTerm);
  }, [loadConversations, statusFilter, searchTerm]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      loadConversations(currentPage, statusFilter, assignedToFilter, searchTerm),
      loadStats()
    ]);
  }, [loadConversations, loadStats, currentPage, statusFilter, assignedToFilter, searchTerm]);

  // Handle conversation click
  const handleConversationClick = useCallback((conversation) => {
    router.push(`/admin/support-chat/${conversation._id}`);
  }, [router]);

  // Handle reassign conversation
  const handleReassignConversation = useCallback(async () => {
    if (!selectedConversation || !newSupportId) return;

    try {
      setReassigning(true);
      await reassignConversation(selectedConversation._id, newSupportId);
      
      showSuccess('Conversation reassigned successfully');
      setReassignDialogOpen(false);
      setSelectedConversation(null);
      setNewSupportId('');
      
      // Refresh conversations
      handleRefresh();
    } catch (error) {
      console.error('Error reassigning conversation:', error);
      showError('Failed to reassign conversation');
    } finally {
      setReassigning(false);
    }
  }, [selectedConversation, newSupportId, handleRefresh]);

  // Handle reassign button click
  const handleReassignClick = useCallback((conversation) => {
    setSelectedConversation(conversation);
    setNewSupportId(conversation.assignedSupportId._id);
    setReassignDialogOpen(true);
  }, []);

  // Handle new message notification
  const handleNotificationNewMessage = useCallback((data) => {
    // Refresh conversations to show updated unread count
    handleRefresh();
  }, [handleRefresh]);

  // Register chat events
  useChatEvents({
    onNotificationNewMessage: handleNotificationNewMessage,
  });

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    
    const userName = conversation.userId?.first_name && conversation.userId?.last_name
      ? `${conversation.userId.first_name} ${conversation.userId.last_name}`
      : conversation.userId?.phone || '';
    
    const supportName = conversation.assignedSupportId?.first_name && conversation.assignedSupportId?.last_name
      ? `${conversation.assignedSupportId.first_name} ${conversation.assignedSupportId.last_name}`
      : conversation.assignedSupportId?.phone || '';
    
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           supportName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    loadConversations(page, statusFilter, assignedToFilter, searchTerm);
  }, [loadConversations, statusFilter, assignedToFilter, searchTerm]);

  // Get unique support agents for filter
  const supportAgents = [...new Set(conversations.map(conv => conv.assignedSupportId))];

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
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalConversations}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Conversations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.activeConversations}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Support Agents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.perAgentStats?.length || 0}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalMessages}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalItems} total conversations
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
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by farmer or support agent..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="w-full lg:w-48">
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

          {/* Assigned To Filter */}
          <div className="w-full lg:w-48">
            <Select value={assignedToFilter} onValueChange={handleAssignedToFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {supportAgents.map((agent) => (
                  <SelectItem key={agent._id} value={agent._id}>
                    {agent.first_name && agent.last_name 
                      ? `${agent.first_name} ${agent.last_name}`
                      : agent.phone
                    }
                  </SelectItem>
                ))}
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
              {searchTerm || statusFilter || assignedToFilter
                ? 'Try adjusting your search or filter criteria'
                : 'No conversations have been started yet'
              }
            </p>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <div key={conversation._id} className="relative">
              <ConversationItem
                conversation={conversation}
                currentUserId={currentUser?.id}
                onClick={handleConversationClick}
              />
              
              {/* Reassign Button */}
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReassignClick(conversation)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
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

      {/* Reassign Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Conversation</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Reassign this conversation to a different support agent:
              </p>
              <p className="font-medium">
                {selectedConversation?.userId?.first_name && selectedConversation?.userId?.last_name
                  ? `${selectedConversation.userId.first_name} ${selectedConversation.userId.last_name}`
                  : selectedConversation?.userId?.phone
                }
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign to:
              </label>
              <Select value={newSupportId} onValueChange={setNewSupportId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select support agent" />
                </SelectTrigger>
                <SelectContent>
                  {supportAgents.map((agent) => (
                    <SelectItem key={agent._id} value={agent._id}>
                      {agent.first_name && agent.last_name 
                        ? `${agent.first_name} ${agent.last_name}`
                        : agent.phone
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setReassignDialogOpen(false)}
                disabled={reassigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReassignConversation}
                disabled={reassigning || !newSupportId}
              >
                {reassigning ? 'Reassigning...' : 'Reassign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllConversationsList;

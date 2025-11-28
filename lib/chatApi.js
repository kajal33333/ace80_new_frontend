import axiosInstance from './axiosInstance';

// ========================================
// CONVERSATION API FUNCTIONS
// ========================================

/**
 * Create or get existing conversation
 * POST /api/v1/chat/conversations
 */
export const createOrGetConversation = async () => {
  const response = await axiosInstance().post('/chat/conversations');
  return response.data;
};

/**
 * Get conversations for current user
 * GET /api/v1/chat/conversations
 */
export const getConversations = async (page = 1, limit = 20, status = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
  });
  
  const response = await axiosInstance().get(`/chat/conversations?${params}`);
  return response.data;
};

/**
 * Get conversation by ID
 * GET /api/v1/chat/conversations/:id
 */
export const getConversationById = async (conversationId) => {
  const response = await axiosInstance().get(`/chat/conversations/${conversationId}`);
  return response.data;
};

/**
 * Update conversation status
 * PATCH /api/v1/chat/conversations/:id/status
 */
export const updateConversationStatus = async (conversationId, status) => {
  const response = await axiosInstance().patch(`/chat/conversations/${conversationId}/status`, {
    status,
  });
  return response.data;
};

/**
 * Delete conversation (soft delete)
 * DELETE /api/v1/chat/conversations/:id
 */
export const deleteConversation = async (conversationId) => {
  const response = await axiosInstance().delete(`/chat/conversations/${conversationId}`);
  return response.data;
};

// ========================================
// MESSAGE API FUNCTIONS
// ========================================

/**
 * Get messages for a conversation
 * GET /api/v1/chat/messages/:conversationId
 */
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  const response = await axiosInstance().get(`/chat/messages/${conversationId}?${params}`);
  return response.data;
};

/**
 * Mark message as read
 * PATCH /api/v1/chat/messages/:messageId/read
 */
export const markMessageAsRead = async (messageId) => {
  const response = await axiosInstance().patch(`/chat/messages/${messageId}/read`);
  return response.data;
};

/**
 * Mark all messages in conversation as read
 * PATCH /api/v1/chat/conversations/:conversationId/read
 */
export const markConversationAsRead = async (conversationId) => {
  const response = await axiosInstance().patch(`/chat/conversations/${conversationId}/read`);
  return response.data;
};

/**
 * Delete message
 * DELETE /api/v1/chat/messages/:messageId
 */
export const deleteMessage = async (messageId) => {
  const response = await axiosInstance().delete(`/chat/messages/${messageId}`);
  return response.data;
};

// ========================================
// MEDIA UPLOAD API FUNCTIONS
// ========================================

/**
 * Upload media files for chat
 * POST /api/v1/chat/media
 */
export const uploadChatMedia = async (files, type) => {
  const formData = new FormData();
  
  // Add files to FormData
  if (Array.isArray(files)) {
    files.forEach((file) => {
      formData.append('media', file);
    });
  } else {
    formData.append('media', files);
  }
  
  // Add type
  formData.append('type', type);
  
  const response = await axiosInstance().post('/chat/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// ========================================
// SUPPORT/ADMIN API FUNCTIONS
// ========================================

/**
 * Get all conversations for support dashboard
 * GET /api/v1/chat/support/conversations
 */
export const getAllConversationsForSupport = async (page = 1, limit = 20, status = '', assignedTo = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(assignedTo && { assignedTo }),
  });
  
  const response = await axiosInstance().get(`/chat/support/conversations?${params}`);
  return response.data;
};

/**
 * Reassign conversation to another support agent
 * POST /api/v1/chat/support/reassign
 */
export const reassignConversation = async (conversationId, newSupportId) => {
  const response = await axiosInstance().post('/chat/support/reassign', {
    conversationId,
    newSupportId,
  });
  return response.data;
};

/**
 * Get conversation statistics
 * GET /api/v1/chat/support/stats
 */
export const getConversationStats = async () => {
  const response = await axiosInstance().get('/chat/support/stats');
  return response.data;
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get user info from cookies
 */
export const getCurrentUser = () => {
  const { getCookie, hasCookie } = require('cookies-next');
  const { JSONParse } = require('./utils');
  
  if (hasCookie('agritech_user')) {
    return JSONParse(getCookie('agritech_user'));
  }
  return null;
};

/**
 * Check if user has specific role
 */
export const hasRole = (requiredRoles) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  
  return user.role === requiredRoles;
};

/**
 * Check if user is Support or Admin
 */
export const isSupportOrAdmin = () => {
  return hasRole(['Support', 'Admin']);
};

/**
 * Check if user is Admin
 */
export const isAdmin = () => {
  return hasRole('Admin');
};

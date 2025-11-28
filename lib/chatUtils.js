import { format, formatDistanceToNow, isToday, isYesterday, isThisYear } from 'date-fns';

// ========================================
// TIMESTAMP FORMATTING
// ========================================

/**
 * Format message timestamp for display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  const now = new Date();
  
  // Same day - show time only
  if (isToday(messageDate)) {
    return format(messageDate, 'h:mm a');
  }
  
  // Yesterday
  if (isYesterday(messageDate)) {
    return `Yesterday ${format(messageDate, 'h:mm a')}`;
  }
  
  // Same year - show date and time
  if (isThisYear(messageDate)) {
    return format(messageDate, 'MMM d, h:mm a');
  }
  
  // Different year - show full date
  return format(messageDate, 'MMM d, yyyy h:mm a');
};

/**
 * Format last seen timestamp
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted last seen time
 */
export const formatLastSeen = (date) => {
  if (!date) return 'Never';
  
  const lastSeenDate = new Date(date);
  const now = new Date();
  
  // If online (within last 5 minutes), show "Online"
  const diffInMinutes = (now - lastSeenDate) / (1000 * 60);
  if (diffInMinutes < 5) {
    return 'Online';
  }
  
  // Show relative time
  return `Last seen ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`;
};

/**
 * Format conversation list timestamp
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted timestamp for conversation list
 */
export const formatConversationTimestamp = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  
  // Today - show time
  if (isToday(messageDate)) {
    return format(messageDate, 'h:mm a');
  }
  
  // Yesterday
  if (isYesterday(messageDate)) {
    return 'Yesterday';
  }
  
  // This year - show month and day
  if (isThisYear(messageDate)) {
    return format(messageDate, 'MMM d');
  }
  
  // Different year - show year
  return format(messageDate, 'MMM d, yyyy');
};

// ========================================
// TEXT UTILITIES
// ========================================

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateMessage = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Extract text from message for preview
 * @param {Object} message - Message object
 * @returns {string} Preview text
 */
export const getMessagePreview = (message) => {
  if (!message) return '';
  
  switch (message.messageType) {
    case 'text':
      return message.content || '';
    case 'image':
      return '📷 Image';
    case 'video':
      return '🎥 Video';
    case 'audio':
      return '🎵 Audio';
    default:
      return 'Message';
  }
};

// ========================================
// CONVERSATION UTILITIES
// ========================================

/**
 * Get unread count for current user
 * @param {Object} conversation - Conversation object
 * @param {string} userId - Current user ID
 * @returns {number} Unread count
 */
export const getUnreadCount = (conversation, userId) => {
    if (!conversation || !conversation.unreadCount || !userId) return 0;
  
    const unread = conversation.unreadCount;
  
    // Handle both Map (server side) and plain object (client side)
    if (typeof unread.get === "function") {
      return unread.get(userId) || 0;
    }
  
    // JSON-serialized plain object
    if (typeof unread === "object") {
      return unread[userId] || 0;
    }
  
    return 0;
  };
  

/**
 * Check if conversation has unread messages
 * @param {Object} conversation - Conversation object
 * @param {string} userId - Current user ID
 * @returns {boolean} Has unread messages
 */
export const hasUnreadMessages = (conversation, userId) => {
  return getUnreadCount(conversation, userId) > 0;
};

/**
 * Get conversation status color
 * @param {string} status - Conversation status
 * @returns {string} Tailwind color class
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'open':
      return 'text-green-600 bg-green-100';
    case 'waiting':
      return 'text-yellow-600 bg-yellow-100';
    case 'resolved':
      return 'text-blue-600 bg-blue-100';
    case 'closed':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get conversation status label
 * @param {string} status - Conversation status
 * @returns {string} Status label
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case 'open':
      return 'Open';
    case 'waiting':
      return 'Waiting';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return 'Unknown';
  }
};

// ========================================
// NOTIFICATION UTILITIES
// ========================================

/**
 * Play notification sound
 */
export const playNotificationSound = () => {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

/**
 * Request browser notification permission
 * @returns {Promise<boolean>} Permission granted
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/agritech_logo.png',
      badge: '/agritech_logo.png',
      ...options,
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    return notification;
  }
};

// ========================================
// FILE UTILITIES
// ========================================

/**
 * Get file type from MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} File type
 */
export const getFileType = (mimeType) => {
  if (!mimeType) return 'unknown';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  
  return 'unknown';
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file for chat upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateChatFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
  ];
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }
  
  return { valid: true };
};

// ========================================
// SOCKET UTILITIES
// ========================================

/**
 * Generate unique temporary ID for optimistic updates
 * @returns {string} Temporary ID
 */
export const generateTempId = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if ID is temporary
 * @param {string} id - ID to check
 * @returns {boolean} Is temporary ID
 */
export const isTempId = (id) => {
  return typeof id === 'string' && id.startsWith('temp_');
};

/**
 * Debounce function for typing indicators
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

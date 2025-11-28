import ConversationsList from '@/components/admin/support-chat/ConversationsList';
import React from 'react';

const SupportChatPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Support Chat
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage conversations with farmers and provide support
        </p>
      </div>
      
      <ConversationsList />
    </div>
  );
};

export default SupportChatPage;

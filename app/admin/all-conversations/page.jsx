import AllConversationsList from '@/components/admin/support-chat/AllConversationsList';
import React from 'react';

const AllConversationsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          All Conversations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor all conversations across the platform and manage support assignments
        </p>
      </div>
      
      <AllConversationsList />
    </div>
  );
};

export default AllConversationsPage;

import MyConversation from '@/components/farmer/support/MyConversation';
import React from 'react';

const FarmerSupportPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Contact Support
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get help with your farming questions and issues
        </p>
      </div>
      
      <MyConversation />
    </div>
  );
};

export default FarmerSupportPage;

import ChatWindow from '@/components/admin/support-chat/ChatWindow';
import React from 'react';

const ChatDetailPage = async({ params }) => {
  const { conversationId } = await params;

  return (
    <div className="h-screen flex flex-col">
      <ChatWindow conversationId={conversationId} />
    </div>
  );
};

export default ChatDetailPage;

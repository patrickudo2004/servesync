import React, { useState } from 'react';
import { ChatList, ChatChannel } from '../components/ChatChannel';

export const ChatPage: React.FC = () => {
  const [selectedChannelId, setSelectedChannelId] = useState<any>(null);

  if (selectedChannelId) {
    return (
      <ChatChannel 
        channelId={selectedChannelId} 
        onBack={() => setSelectedChannelId(null)} 
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <ChatList onSelect={(id) => setSelectedChannelId(id)} />
    </div>
  );
};

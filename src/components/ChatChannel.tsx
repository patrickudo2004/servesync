import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Send, Hash, Megaphone, Users, ChevronLeft, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { FileUploader } from './FileUploader';
import styles from './Chat.module.css';

interface ChatChannelProps {
  channelId: any;
  onBack?: () => void;
}

export const ChatChannel: React.FC<ChatChannelProps> = ({ channelId, onBack }) => {
  const me = useQuery(api.users.me);
  const messages = useQuery(api.chat.getChannelMessages, { channelId });
  const sendMessage = useMutation(api.chat.sendMessage);
  
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessage({
        channelId,
        text: inputText.trim(),
      });
      setInputText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (fileId: any) => {
    await sendMessage({
      channelId,
      fileId,
    });
  };

  if (!messages) {
    return (
      <div className={styles.chatContainer}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <header className={styles.channelHeader}>
        <div className="flex items-center gap-3">
          {onBack && (
            <button className={styles.iconBtn} onClick={onBack}>
              <ChevronLeft size={24} />
            </button>
          )}
          <div className={styles.channelInfo}>
            <h3>Channel Name</h3>
            <p>Real-time updates</p>
          </div>
        </div>
      </header>

      <div className={styles.messageList}>
        {messages.map((msg) => (
          <MessageBubble 
            key={msg._id} 
            message={msg} 
            isOwn={msg.userId === me?._id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <FileUploader onUploadComplete={handleFileUpload} />
        
        <div className={styles.inputWrapper}>
          <textarea 
            placeholder="Type a message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
          />
        </div>

        <button 
          className={styles.sendBtn} 
          onClick={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export const ChatList: React.FC<{ onSelect: (id: any) => void }> = ({ onSelect }) => {
  const channels = useQuery(api.chat.getChannels);

  if (!channels) return <div className="p-4">Loading channels...</div>;

  return (
    <div className={styles.channelList}>
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      {channels.map((channel) => (
        <div 
          key={channel._id} 
          className={styles.channelItem}
          onClick={() => onSelect(channel._id)}
        >
          <div className={styles.channelIcon}>
            {channel.type === 'announcement' ? <Megaphone size={24} /> : 
             channel.type === 'department' ? <Users size={24} /> : <Hash size={24} />}
          </div>
          <div className={styles.channelInfo}>
            <div className="font-bold">{channel.name}</div>
            <div className="text-xs text-gray-500">
              {channel.type === 'announcement' ? 'Official Updates' : 
               channel.type === 'department' ? `${channel.department} Team` : 
               `${channel.subunit} Subunit`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

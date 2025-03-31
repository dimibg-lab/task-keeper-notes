
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex items-start gap-2 max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <Avatar className={cn(
          "h-8 w-8",
          isUser ? "bg-teal-600" : "bg-blue-600"
        )}>
          <AvatarFallback>
            {isUser ? "Вие" : "AI"}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn(
          "rounded-lg px-4 py-2",
          isUser ? "bg-teal-500 text-white" : "bg-gray-200 dark:bg-gray-700"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          <span className="text-xs opacity-70 block mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

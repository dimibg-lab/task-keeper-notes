
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex items-start gap-2 max-w-[85%]",
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
          {isLoading ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-300"></div>
                <span className="text-xs ml-2 text-gray-500">AI отговаря...</span>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words overflow-auto">{message.content}</p>
          )}
          <span className="text-xs opacity-70 block mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ChatMessage as ChatMessageType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { sendMessageToAI } from '@/utils/chatUtils';
import ChatMessage from '@/components/ChatMessage';
import { Send, Plus, Trash2 } from 'lucide-react';

const Chat = () => {
  const { 
    conversations, 
    addConversation, 
    deleteConversation, 
    addMessageToConversation,
    updateConversation
  } = useAppContext();
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [showNewConversationInput, setShowNewConversationInput] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId) return;
    
    const userMessage: Omit<ChatMessageType, 'id' | 'timestamp'> = {
      role: 'user',
      content: newMessage,
    };
    
    addMessageToConversation(activeConversationId, userMessage);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      const updatedConversation = conversations.find(c => c.id === activeConversationId);
      if (!updatedConversation) throw new Error('Разговорът не е намерен');
      
      const allMessages: ChatMessageType[] = [
        ...updatedConversation.messages,
        {
          id: 'temp',
          role: 'user' as const,
          content: newMessage,
          timestamp: new Date()
        }
      ];
      
      const aiResponse = await sendMessageToAI(allMessages);
      
      const assistantMessage: Omit<ChatMessageType, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: aiResponse,
      };
      
      addMessageToConversation(activeConversationId, assistantMessage);
      
      if (updatedConversation.messages.length === 0) {
        const title = newMessage.split('\n')[0].substring(0, 30) + (newMessage.length > 30 ? '...' : '');
        updateConversation(activeConversationId, { title });
      }
    } catch (error) {
      console.error('Грешка при комуникация с AI:', error);
      toast.error('Грешка при комуникация с AI. Моля, опитайте отново.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateNewConversation = () => {
    if (showNewConversationInput) {
      if (newConversationTitle.trim()) {
        const id = addConversation({
          title: newConversationTitle,
          messages: [],
        });
        setActiveConversationId(id);
        setNewConversationTitle('');
      }
      setShowNewConversationInput(false);
    } else {
      setShowNewConversationInput(true);
    }
  };
  
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
    if (activeConversationId === id) {
      setActiveConversationId(conversations.length > 1 ? conversations[0].id : null);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-4">AI Чат</h1>
      
      <div className="flex flex-col md:flex-row gap-4 min-h-[70vh]">
        <Card className="md:w-1/4 w-full">
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex justify-between items-center">
              Разговори
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCreateNewConversation}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {showNewConversationInput && (
              <div className="flex mb-2 p-2">
                <Input
                  value={newConversationTitle}
                  onChange={e => setNewConversationTitle(e.target.value)}
                  placeholder="Заглавие на разговор"
                  className="text-sm"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateNewConversation}
                  className="ml-1"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <ScrollArea className="h-[calc(70vh-120px)]">
              <div className="space-y-1">
                {conversations.length === 0 ? (
                  <div className="text-center text-gray-500 p-4">
                    Няма разговори. Създайте нов разговор, за да започнете.
                  </div>
                ) : (
                  conversations.map(conversation => (
                    <div
                      key={conversation.id}
                      className={`flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        activeConversationId === conversation.id ? 'bg-gray-200 dark:bg-gray-700' : ''
                      }`}
                      onClick={() => setActiveConversationId(conversation.id)}
                    >
                      <span className="text-sm truncate">{conversation.title || 'Нов разговор'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => handleDeleteConversation(conversation.id, e)}
                        className="opacity-50 hover:opacity-100 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card className="md:w-3/4 w-full flex flex-col">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg">
              {activeConversation 
                ? (activeConversation.title || 'Нов разговор') 
                : 'Изберете или създайте разговор'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-grow p-4 overflow-y-auto flex flex-col">
            <ScrollArea className="h-[calc(70vh-200px)]">
              {activeConversation ? (
                activeConversation.messages.length === 0 ? (
                  <div className="text-center text-gray-500 h-full flex items-center justify-center">
                    <p>Напишете съобщение, за да започнете разговор с AI.</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {activeConversation.messages.map(message => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white">
                          AI
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 h-full flex items-center justify-center">
                  <p>Изберете или създайте разговор, за да започнете.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          
          {activeConversation && (
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Напишете съобщение..."
                  className="resize-none min-h-[60px]"
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isLoading}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;


import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ChatMessage as ChatMessageType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { sendMessageToAI } from '@/utils/chatUtils';
import ChatMessage from '@/components/ChatMessage';
import { Send, Plus, Trash2, ArrowLeft, MessageSquare, MessageSquarePlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'chat'>(isMobileView ? 'list' : 'chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setCurrentView('chat');
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
    const id = addConversation({
      title: newConversationTitle || 'Нов разговор',
      messages: [],
    });
    setActiveConversationId(id);
    setNewConversationTitle('');
    if (isMobileView) {
      setCurrentView('chat');
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

  const handleSelectChat = (id: string) => {
    setActiveConversationId(id);
    if (isMobileView) {
      setCurrentView('chat');
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="container mx-auto p-2 max-w-5xl h-[calc(100vh-8rem)]">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {isMobileView && currentView === 'chat' && (
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('list')} className="mr-1 p-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <MessageSquare className="h-6 w-6" /> AI Чат
          </h1>
          {!isMobileView && (
            <Button variant="outline" size="sm" onClick={toggleSidebar}>
              {showSidebar ? 'Скрий чатове' : 'Покажи чатове'}
            </Button>
          )}
        </div>

        <div className="flex gap-4 h-full">
          {/* Мобилен изглед с двете табове */}
          {isMobileView ? (
            <div className="w-full flex flex-col">
              {currentView === 'list' ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="mb-4">
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newConversationTitle}
                        onChange={e => setNewConversationTitle(e.target.value)}
                        placeholder="Заглавие на нов разговор"
                        className="flex-1"
                      />
                      <Button onClick={handleCreateNewConversation}>
                        <MessageSquarePlus className="h-4 w-4 mr-1" /> Нов чат
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-2">
                      {conversations.length === 0 ? (
                        <div className="text-center text-gray-500 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          Няма разговори. Създайте нов разговор, за да започнете.
                        </div>
                      ) : (
                        conversations.map(conversation => (
                          <div
                            key={conversation.id}
                            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border 
                              ${activeConversationId === conversation.id ? 'bg-primary/10 border-primary' : 'border-transparent'}`}
                            onClick={() => handleSelectChat(conversation.id)}
                          >
                            <div className="flex-1 overflow-hidden">
                              <h3 className="font-medium truncate">{conversation.title || 'Нов разговор'}</h3>
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.messages.length > 0 
                                  ? `${conversation.messages.length} съобщения` 
                                  : 'Няма съобщения'}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => handleDeleteConversation(conversation.id, e)}
                              className="text-gray-500 hover:text-red-500 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {activeConversation ? (
                    <>
                      <div className="flex-1 overflow-hidden flex flex-col">
                        <ScrollArea className="flex-1 pr-2">
                          {activeConversation.messages.length === 0 ? (
                            <div className="text-center text-gray-500 h-full flex items-center justify-center p-4">
                              <p>Напишете съобщение, за да започнете разговор с AI.</p>
                            </div>
                          ) : (
                            <div className="py-2 space-y-4">
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
                          )}
                        </ScrollArea>
                        <div className="p-2 border-t mt-2">
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
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 h-full flex items-center justify-center p-4">
                      <p>Изберете или създайте разговор, за да започнете.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Десктоп изглед със странична лента и чат в един прозорец */}
              {showSidebar && (
                <div className={`overflow-hidden border rounded-lg bg-card flex flex-col w-1/3`}>
                  <div className="p-3 border-b flex flex-col gap-2">
                    <h2 className="font-semibold">Разговори</h2>
                    <div className="flex gap-2">
                      <Input
                        value={newConversationTitle}
                        onChange={e => setNewConversationTitle(e.target.value)}
                        placeholder="Заглавие на нов разговор"
                        className="flex-1"
                      />
                      <Button onClick={handleCreateNewConversation} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                      {conversations.length === 0 ? (
                        <div className="text-center text-gray-500 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          Няма разговори. Създайте нов разговор, за да започнете.
                        </div>
                      ) : (
                        conversations.map(conversation => (
                          <div
                            key={conversation.id}
                            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border
                              ${activeConversationId === conversation.id ? 'bg-primary/10 border-primary' : 'border-transparent'}`}
                            onClick={() => setActiveConversationId(conversation.id)}
                          >
                            <div className="flex-1 overflow-hidden">
                              <h3 className="font-medium truncate">{conversation.title || 'Нов разговор'}</h3>
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.messages.length > 0 
                                  ? `${conversation.messages.length} съобщения` 
                                  : 'Няма съобщения'}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => handleDeleteConversation(conversation.id, e)}
                              className="text-gray-500 hover:text-red-500 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className={`flex-1 flex flex-col border rounded-lg bg-card overflow-hidden`}>
                {activeConversation ? (
                  <>
                    <div className="p-3 border-b">
                      <h2 className="font-semibold truncate">{activeConversation.title || 'Нов разговор'}</h2>
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <ScrollArea className="flex-1 px-3">
                        {activeConversation.messages.length === 0 ? (
                          <div className="text-center text-gray-500 h-full flex items-center justify-center p-4">
                            <p>Напишете съобщение, за да започнете разговор с AI.</p>
                          </div>
                        ) : (
                          <div className="py-4 space-y-4">
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
                        )}
                      </ScrollArea>
                      <div className="p-3 border-t">
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
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 h-full flex items-center justify-center p-4">
                    <div className="flex flex-col items-center gap-4">
                      <MessageSquare className="h-16 w-16 text-primary/30" />
                      <p>Изберете или създайте разговор, за да започнете.</p>
                      {conversations.length === 0 && (
                        <Button onClick={handleCreateNewConversation} variant="outline" className="mt-2">
                          <MessageSquarePlus className="h-4 w-4 mr-2" /> Създаване на нов разговор
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

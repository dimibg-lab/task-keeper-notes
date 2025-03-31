import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Note, Alarm, AppImage, ChatConversation, ChatMessage } from '@/types';
import { toast } from 'sonner';

interface AppContextType {
  tasks: Task[];
  notes: Note[];
  alarms: Alarm[];
  images: AppImage[];
  conversations: ChatConversation[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addAlarm: (alarm: Omit<Alarm, 'id'>) => void;
  updateAlarm: (id: string, alarm: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  addImage: (image: Omit<AppImage, 'id' | 'createdAt'>) => void;
  deleteImage: (id: string) => void;
  addConversation: (conversation: Omit<ChatConversation, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void;
  deleteConversation: (id: string) => void;
  addMessageToConversation: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Инициализиране на състоянието от localStorage ��ко е налично
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const savedAlarms = localStorage.getItem('alarms');
    return savedAlarms ? JSON.parse(savedAlarms) : [];
  });

  const [images, setImages] = useState<AppImage[]>(() => {
    const savedImages = localStorage.getItem('images');
    return savedImages ? JSON.parse(savedImages) : [];
  });

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const savedConversations = localStorage.getItem('conversations');
    return savedConversations ? JSON.parse(savedConversations) : [];
  });

  // Записване на промените в localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('images', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Функции за управление на задачите
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
    toast.success('Задачата беше добавена успешно!');
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, ...updatedTask } : task)));
    toast.success('Задачата беше обновена!');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Задачата беше изтрита!');
  };

  // Функции за управление на бележките
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([...notes, newNote]);
    toast.success('Бележката беше добавена успешно!');
  };

  const updateNote = (id: string, updatedNote: Partial<Note>) => {
    setNotes(
      notes.map(note =>
        note.id === id ? { ...note, ...updatedNote, updatedAt: new Date() } : note
      )
    );
    toast.success('Бележката беше обновена!');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success('Бележката беше изтрита!');
  };

  // Функции за управление на алармите
  const addAlarm = (alarm: Omit<Alarm, 'id'>) => {
    const newAlarm: Alarm = {
      ...alarm,
      id: crypto.randomUUID(),
    };
    setAlarms([...alarms, newAlarm]);
    toast.success('Алармата беше добавена успешно!');
  };

  const updateAlarm = (id: string, updatedAlarm: Partial<Alarm>) => {
    setAlarms(alarms.map(alarm => (alarm.id === id ? { ...alarm, ...updatedAlarm } : alarm)));
    toast.success('Алармата беше обновена!');
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
    toast.success('Алармата беше изтрита!');
  };

  // Функции за управление на изображенията
  const addImage = (image: Omit<AppImage, 'id' | 'createdAt'>) => {
    const newImage: AppImage = {
      ...image,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setImages([...images, newImage]);
  };

  const deleteImage = (id: string) => {
    setImages(images.filter(image => image.id !== id));
    toast.success('Изображението беше изтрито!');
  };

  // Функции за управление на разговорите
  const addConversation = (conversation: Omit<ChatConversation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newConversation: ChatConversation = {
      ...conversation,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setConversations(prev => [...prev, newConversation]);
    return newConversation.id;
  };

  const updateConversation = (id: string, updates: Partial<ChatConversation>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, ...updates, updatedAt: new Date() } 
          : conv
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    toast.success('Разговорът беше изтрит!');
  };

  const addMessageToConversation = (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, newMessage],
              updatedAt: new Date()
            } 
          : conv
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        notes,
        alarms,
        images,
        conversations,
        addTask,
        updateTask,
        deleteTask,
        addNote,
        updateNote,
        deleteNote,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        addImage,
        deleteImage,
        addConversation,
        updateConversation,
        deleteConversation,
        addMessageToConversation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

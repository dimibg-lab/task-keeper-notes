
// Интерфейс за задачите
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  description?: string;
  imageUrl?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
}

// Интерфейс за бележките
export interface Note {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс за алармите
export interface Alarm {
  id: string;
  title: string;
  time: Date;
  repeat?: 'daily' | 'weekdays' | 'weekends' | 'none';
  active: boolean;
  taskId?: string;
}

// Интерфейс за изображенията
export interface AppImage {
  id: string;
  url: string;
  thumbnail?: string;
  title?: string;
  relatedTo?: {
    type: 'task' | 'note';
    id: string;
  };
  createdAt: Date;
}

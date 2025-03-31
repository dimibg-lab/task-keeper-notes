
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CheckSquare, Clock, Plus, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/ImageUploader';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

const Tasks: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useAppContext();
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  // Сортиране на задачите: незавършените най-отгоре, след това по дата на създаване
  const sortedTasks = [...tasks].sort((a, b) => {
    // Първо сортираме по статус на изпълнение
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // След това по крайна дата ако има такава
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    // Накрая по дата на създаване
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleAddTask = () => {
    if (!title.trim()) return;
    
    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title,
      description,
      completed: false,
      dueDate,
      priority,
      imageUrl: imageUrl || undefined,
    };
    
    addTask(newTask);
    resetForm();
    setIsNewTaskDialogOpen(false);
  };

  const handleEditTask = () => {
    if (!currentTaskId || !title.trim()) return;
    
    updateTask(currentTaskId, {
      title,
      description,
      dueDate,
      priority,
      imageUrl: imageUrl || undefined,
    });
    
    resetForm();
    setIsEditTaskDialogOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleToggleTaskStatus = (id: string, completed: boolean) => {
    updateTask(id, { completed });
  };

  const openEditTaskDialog = (task: Task) => {
    setCurrentTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate);
    setPriority(task.priority || 'medium');
    setImageUrl(task.imageUrl || '');
    setIsEditTaskDialogOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setPriority('medium');
    setImageUrl('');
    setCurrentTaskId(null);
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto pb-20 pt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Моите задачи</h1>
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus size={18} className="mr-1" /> Нова задача
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Добави нова задача</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Заглавие на задачата"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Описание (незадължително)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Приоритет</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="low">Нисък</option>
                    <option value="medium">Среден</option>
                    <option value="high">Висок</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Краен срок</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'dd.MM.yyyy') : 'Избери дата'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Изображение</label>
                <ImageUploader 
                  onImageUploaded={setImageUrl}
                  existingImageUrl={imageUrl}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Отказ</Button>
              </DialogClose>
              <Button onClick={handleAddTask}>Добави</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare size={48} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Нямате въведени задачи</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                "overflow-hidden transition-all",
                task.completed && "task-item completed"
              )}
            >
              <CardContent className="p-0">
                <div className="flex items-start p-4">
                  <div className="mr-3 pt-1">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => 
                        handleToggleTaskStatus(task.id, checked === true)
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center mt-2 flex-wrap gap-2">
                      {task.priority && (
                        <span className={cn("text-xs px-2 py-1 rounded-full", getPriorityColor(task.priority))}>
                          {task.priority === 'low' ? 'Нисък' : task.priority === 'medium' ? 'Среден' : 'Висок'}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs flex items-center text-muted-foreground">
                          <Clock size={12} className="mr-1" />
                          {format(new Date(task.dueDate), 'dd.MM.yyyy')}
                        </span>
                      )}
                      {task.imageUrl && (
                        <span className="text-xs flex items-center text-muted-foreground">
                          <ImageIcon size={12} className="mr-1" />
                          Има снимка
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditTaskDialog(task)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                {task.imageUrl && (
                  <div className="border-t border-border">
                    <img
                      src={task.imageUrl}
                      alt={task.title}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Диалог за редактиране на задача */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактирай задача</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Заглавие на задачата"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Описание (незадължително)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Приоритет</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="low">Нисък</option>
                  <option value="medium">Среден</option>
                  <option value="high">Висок</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Краен срок</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'dd.MM.yyyy') : 'Избери дата'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Изображение</label>
              <ImageUploader 
                onImageUploaded={setImageUrl}
                existingImageUrl={imageUrl}
                relatedTo={currentTaskId ? { type: 'task', id: currentTaskId } : undefined}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отказ</Button>
            </DialogClose>
            <Button onClick={handleEditTask}>Запази</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;

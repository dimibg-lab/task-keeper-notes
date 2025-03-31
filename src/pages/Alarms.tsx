
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Alarm, Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Bell, Plus, Trash2, Edit, Clock, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Alarms: React.FC = () => {
  const { alarms, tasks, addAlarm, updateAlarm, deleteAlarm } = useAppContext();
  const [isNewAlarmDialogOpen, setIsNewAlarmDialogOpen] = useState(false);
  const [isEditAlarmDialogOpen, setIsEditAlarmDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekdays' | 'weekends'>('none');
  const [active, setActive] = useState(true);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const [currentAlarmId, setCurrentAlarmId] = useState<string | null>(null);
  
  // Сортиране на алармите по време
  const sortedAlarms = [...alarms].sort((a, b) => {
    const timeA = new Date(a.time).getHours() * 60 + new Date(a.time).getMinutes();
    const timeB = new Date(b.time).getHours() * 60 + new Date(b.time).getMinutes();
    return timeA - timeB;
  });

  // Филтрирани незавършени задачи за селект менюто
  const availableTasks = tasks.filter(task => !task.completed);

  const handleAddAlarm = () => {
    if (!title.trim() || !time) return;
    
    // Конвертиране на времето в Date обект
    const [hours, minutes] = time.split(':').map(Number);
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);
    
    const newAlarm: Omit<Alarm, 'id'> = {
      title,
      time: alarmTime,
      repeat: repeat || 'none',
      active,
      taskId,
    };
    
    addAlarm(newAlarm);
    resetForm();
    setIsNewAlarmDialogOpen(false);
  };

  const handleEditAlarm = () => {
    if (!currentAlarmId || !title.trim() || !time) return;
    
    // Конвертиране на времето в Date обект
    const [hours, minutes] = time.split(':').map(Number);
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);
    
    updateAlarm(currentAlarmId, {
      title,
      time: alarmTime,
      repeat: repeat || 'none',
      active,
      taskId,
    });
    
    resetForm();
    setIsEditAlarmDialogOpen(false);
  };

  const handleDeleteAlarm = (id: string) => {
    deleteAlarm(id);
  };

  const handleToggleAlarm = (id: string, newActive: boolean) => {
    updateAlarm(id, { active: newActive });
  };

  const openEditAlarmDialog = (alarm: Alarm) => {
    setCurrentAlarmId(alarm.id);
    setTitle(alarm.title);
    setTime(format(new Date(alarm.time), 'HH:mm'));
    setRepeat(alarm.repeat || 'none');
    setActive(alarm.active);
    setTaskId(alarm.taskId);
    setIsEditAlarmDialogOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setTime('08:00');
    setRepeat('none');
    setActive(true);
    setTaskId(undefined);
    setCurrentAlarmId(null);
  };

  const getRepeatText = (repeat?: 'none' | 'daily' | 'weekdays' | 'weekends') => {
    switch (repeat) {
      case 'daily':
        return 'Всеки ден';
      case 'weekdays':
        return 'В делнични дни';
      case 'weekends':
        return 'В почивни дни';
      default:
        return 'Еднократно';
    }
  };

  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : null;
  };

  return (
    <div className="container mx-auto pb-20 pt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Моите аларми</h1>
        <Dialog open={isNewAlarmDialogOpen} onOpenChange={setIsNewAlarmDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus size={18} className="mr-1" /> Нова аларма
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Добави нова аларма</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Заглавие на алармата"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div>
                <label className="text-sm font-medium mb-1 block">Време</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Повторение</label>
                <Select 
                  value={repeat} 
                  onValueChange={(value) => setRepeat(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Избери" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Еднократно</SelectItem>
                    <SelectItem value="daily">Всеки ден</SelectItem>
                    <SelectItem value="weekdays">В делнични дни</SelectItem>
                    <SelectItem value="weekends">В почивни дни</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Свързана задача (по желание)</label>
                <Select 
                  value={taskId} 
                  onValueChange={setTaskId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Избери задача" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без задача</SelectItem>
                    {availableTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Активна</label>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Отказ</Button>
              </DialogClose>
              <Button onClick={handleAddAlarm}>Добави</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {sortedAlarms.length === 0 ? (
          <div className="text-center py-8">
            <Bell size={48} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Нямате въведени аларми</p>
          </div>
        ) : (
          sortedAlarms.map((alarm) => {
            const taskTitle = getTaskTitle(alarm.taskId);
            
            return (
              <Card
                key={alarm.id}
                className={cn(
                  "overflow-hidden",
                  !alarm.active && "opacity-60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Clock size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-base">{alarm.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-1">
                          <span>{format(new Date(alarm.time), 'HH:mm')}</span>
                          <span>•</span>
                          <span>{getRepeatText(alarm.repeat)}</span>
                          {taskTitle && (
                            <>
                              <span>•</span>
                              <span className="flex items-center">
                                <CheckSquare size={12} className="mr-1" />
                                {taskTitle}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={alarm.active}
                        onCheckedChange={(checked) => handleToggleAlarm(alarm.id, checked)}
                      />
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditAlarmDialog(alarm)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAlarm(alarm.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Диалог за редактиране на аларма */}
      <Dialog open={isEditAlarmDialogOpen} onOpenChange={setIsEditAlarmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактирай аларма</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Заглавие на алармата"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div>
              <label className="text-sm font-medium mb-1 block">Време</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Повторение</label>
              <Select 
                value={repeat} 
                onValueChange={(value) => setRepeat(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Избери" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Еднократно</SelectItem>
                  <SelectItem value="daily">Всеки ден</SelectItem>
                  <SelectItem value="weekdays">В делнични дни</SelectItem>
                  <SelectItem value="weekends">В почивни дни</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Свързана задача (по желание)</label>
              <Select 
                value={taskId} 
                onValueChange={setTaskId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Избери задача" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без задача</SelectItem>
                  {availableTasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Активна</label>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отказ</Button>
            </DialogClose>
            <Button onClick={handleEditAlarm}>Запази</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Alarms;

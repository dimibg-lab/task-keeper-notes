
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DownloadCloud, Trash2, HelpCircle, Info, Settings, MoonStar, Sun } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';

const More: React.FC = () => {
  const { tasks, notes, alarms, images } = useAppContext();
  const { theme, setTheme } = useTheme();

  const handleExport = () => {
    try {
      const data = {
        tasks,
        notes,
        alarms,
        images,
        exportDate: new Date(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-app-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Данните бяха експортирани успешно!');
    } catch (error) {
      console.error('Грешка при експорт на данните:', error);
      toast.error('Възникна грешка при експорт на данните');
    }
  };

  const handleClearAll = () => {
    if (confirm('Сигурни ли сте, че искате да изтриете всички данни? Тази операция не може да бъде отменена.')) {
      localStorage.clear();
      toast.success('Всички данни бяха изтрити. Презаредете страницата, за да завършите процеса.', {
        duration: 5000,
        action: {
          label: 'Презареди',
          onClick: () => window.location.reload(),
        },
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    toast.success(`Превключихте към ${theme === 'dark' ? 'светла' : 'тъмна'} тема`);
  };

  return (
    <div className="container mx-auto pb-20 pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Още</h1>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">Данни</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span>Задачи</span>
                <span className="font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Бележки</span>
                <span className="font-medium">{notes.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Аларми</span>
                <span className="font-medium">{alarms.length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Изображения</span>
                <span className="font-medium">{images.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-2">Настройки</h2>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <MoonStar className="mr-2 h-4 w-4" />
                )}
                {theme === 'dark' ? 'Превключи към светла тема' : 'Превключи към тъмна тема'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleExport}
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Експортирай данните
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive" 
                onClick={handleClearAll}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Изчисти всички данни
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-2">Информация</h2>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <Info className="mr-2 h-4 w-4" />
                Версия: 1.0.0
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Помощ и указания
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default More;

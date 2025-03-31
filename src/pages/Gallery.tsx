
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AppImage } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Image, FileText, CheckSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const Gallery: React.FC = () => {
  const { images, tasks, notes, deleteImage } = useAppContext();
  const [selectedImage, setSelectedImage] = useState<AppImage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Сортиране на изображенията по дата (най-новите най-отгоре)
  const sortedImages = [...images].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getRelatedItemTitle = (image: AppImage) => {
    if (!image.relatedTo) return null;
    
    if (image.relatedTo.type === 'task') {
      const task = tasks.find(t => t.id === image.relatedTo?.id);
      return task ? { title: task.title, type: 'Задача' } : null;
    } else if (image.relatedTo.type === 'note') {
      const note = notes.find(n => n.id === image.relatedTo?.id);
      return note ? { title: note.title, type: 'Бележка' } : null;
    }
    
    return null;
  };

  const handleDeleteImage = (id: string) => {
    deleteImage(id);
    if (selectedImage?.id === id) {
      setSelectedImage(null);
      setIsViewDialogOpen(false);
    }
  };

  const openViewDialog = (image: AppImage) => {
    setSelectedImage(image);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="container mx-auto pb-20 pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Моята галерия</h1>
      </div>

      {sortedImages.length === 0 ? (
        <div className="text-center py-8">
          <Image size={48} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Нямате качени изображения</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sortedImages.map((image) => (
            <Card 
              key={image.id} 
              className="overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openViewDialog(image)}
            >
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={image.title || 'Изображение'}
                  className="w-full h-full object-cover"
                />
                {image.relatedTo && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs flex items-center">
                    {image.relatedTo.type === 'task' ? (
                      <CheckSquare size={12} className="mr-1" />
                    ) : (
                      <FileText size={12} className="mr-1" />
                    )}
                    <span className="truncate">
                      {getRelatedItemTitle(image)?.type || 'Свързан елемент'}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог за преглед на изображение */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          {selectedImage && (
            <div>
              <img
                src={selectedImage.url}
                alt={selectedImage.title || 'Изображение'}
                className="w-full h-auto"
              />
              <div className="p-4">
                {selectedImage.title && (
                  <h3 className="font-medium text-base mb-2">{selectedImage.title}</h3>
                )}
                <div className="text-sm text-muted-foreground mb-2">
                  Добавено: {format(new Date(selectedImage.createdAt), 'dd.MM.yyyy, HH:mm')}
                </div>
                
                {selectedImage.relatedTo && (
                  <div className="mb-4">
                    <div className="text-sm font-medium">Свързано с:</div>
                    <div className="flex items-center text-sm">
                      {selectedImage.relatedTo.type === 'task' ? (
                        <CheckSquare size={14} className="mr-1" />
                      ) : (
                        <FileText size={14} className="mr-1" />
                      )}
                      <span>
                        {getRelatedItemTitle(selectedImage)?.type}: {getRelatedItemTitle(selectedImage)?.title}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteImage(selectedImage.id)}
                    className="flex items-center"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Изтрий
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;


import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Note } from '@/types';
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
import { FileText, Plus, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/ImageUploader';
import { Card, CardContent } from '@/components/ui/card';

const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  
  // Сортиране на бележките по дата на обновяване (най-новите най-отгоре)
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleAddNote = () => {
    if (!title.trim() || !content.trim()) return;
    
    const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      content,
      imageUrl: imageUrl || undefined,
    };
    
    addNote(newNote);
    resetForm();
    setIsNewNoteDialogOpen(false);
  };

  const handleEditNote = () => {
    if (!currentNoteId || !title.trim() || !content.trim()) return;
    
    updateNote(currentNoteId, {
      title,
      content,
      imageUrl: imageUrl || undefined,
    });
    
    resetForm();
    setIsEditNoteDialogOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
  };

  const openEditNoteDialog = (note: Note) => {
    setCurrentNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setImageUrl(note.imageUrl || '');
    setIsEditNoteDialogOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setCurrentNoteId(null);
  };

  return (
    <div className="container mx-auto pb-20 pt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Моите бележки</h1>
        <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus size={18} className="mr-1" /> Нова бележка
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Добави нова бележка</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Заглавие на бележката"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Съдържание на бележката"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px]"
              />
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
              <Button onClick={handleAddNote}>Добави</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Нямате въведени бележки</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <Card key={note.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start p-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base">{note.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                      {note.content}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <span>
                        Обновена: {format(new Date(note.updatedAt), 'dd.MM.yyyy, HH:mm')}
                      </span>
                      {note.imageUrl && (
                        <span className="flex items-center ml-2">
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
                      onClick={() => openEditNoteDialog(note)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                {note.imageUrl && (
                  <div className="border-t border-border">
                    <img
                      src={note.imageUrl}
                      alt={note.title}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Диалог за редактиране на бележка */}
      <Dialog open={isEditNoteDialogOpen} onOpenChange={setIsEditNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактирай бележка</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Заглавие на бележката"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Съдържание на бележката"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
            />
            <div>
              <label className="text-sm font-medium mb-1 block">Изображение</label>
              <ImageUploader 
                onImageUploaded={setImageUrl}
                existingImageUrl={imageUrl}
                relatedTo={currentNoteId ? { type: 'note', id: currentNoteId } : undefined}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отказ</Button>
            </DialogClose>
            <Button onClick={handleEditNote}>Запази</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;

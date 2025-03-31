
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { uploadImage, generateThumbnail } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  relatedTo?: {
    type: 'task' | 'note';
    id: string;
  };
  existingImageUrl?: string;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  relatedTo,
  existingImageUrl,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(existingImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addImage } = useAppContext();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Моля, изберете изображение');
      return;
    }

    try {
      setIsLoading(true);
      const imageUrl = await uploadImage(file);
      const thumbnailUrl = await generateThumbnail(imageUrl);
      
      setPreviewUrl(imageUrl);
      onImageUploaded(imageUrl);
      
      if (relatedTo) {
        addImage({
          url: imageUrl,
          thumbnail: thumbnailUrl,
          title: file.name,
          relatedTo,
        });
      }
      
      toast.success('Изображението беше качено успешно!');
    } catch (error) {
      console.error('Грешка при качване на изображението:', error);
      toast.error('Грешка при качване на изображението');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageUploaded('');
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      
      {previewUrl ? (
        <div className="relative w-full max-w-md rounded-lg overflow-hidden">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-auto object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full w-8 h-8"
            onClick={handleRemoveImage}
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleCaptureClick}
            disabled={isLoading}
          >
            <Camera size={16} />
            Снимка
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleCaptureClick}
            disabled={isLoading}
          >
            <Upload size={16} />
            Качи
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

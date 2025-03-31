
/**
 * Качва изображение и връща URL към него
 * @param file Файл за качване
 * @returns Promise с URL на изображението
 */
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // В реално приложение тук бихме качили файла на сървър
    // За демо целите създаваме локален URL
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Генерира thumbnail версия на изображение
 * @param imageUrl URL към оригиналното изображение
 * @returns Promise с URL на thumbnail изображението
 */
export const generateThumbnail = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 100;
        const MAX_HEIGHT = 100;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = imageUrl;
  });
};

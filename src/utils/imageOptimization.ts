/**
 * Resize and compress image before upload
 */
export const compressImage = async (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generate thumbnail URL for Firebase Storage
 */
export const getThumbnailUrl = (url: string, size = '400x400'): string => {
  // For Firebase Storage URLs, you can use CDN transforms
  // This is a placeholder - actual implementation depends on your setup
  return url;
};

/**
 * Create srcset for responsive images
 */
export const createSrcSet = (baseUrl: string): string => {
  const sizes = [400, 800, 1200];
  return sizes.map(size => `${baseUrl} ${size}w`).join(', ');
};


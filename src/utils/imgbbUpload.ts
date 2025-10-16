/**
 * Upload image to ImgBB
 * Free tier: 32MB max file size
 * API Documentation: https://api.imgbb.com/
 */

const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "0362ccc6f7dc769e0ba6866ef935625c";

export interface ImgBBResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      url: string;
    };
    thumb: {
      filename: string;
      url: string;
    };
    delete_url: string;
  };
  status: number;
}

/**
 * Upload image to ImgBB
 * @param file - Image file to upload
 * @param name - Optional image name
 * @returns URL of uploaded image
 */
export const uploadToImgBB = async (file: File, name?: string): Promise<string> => {
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API Key not configured. Please add VITE_IMGBB_API_KEY to your .env file.');
  }

  // Check file size (32MB limit for free tier)
  const maxSize = 32 * 1024 * 1024; // 32MB
  if (file.size > maxSize) {
    throw new Error('Image size must be less than 32MB');
  }

  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Prepare form data
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64);
    
    if (name) {
      formData.append('name', name);
    }

    // Upload to ImgBB
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image to ImgBB');
    }

    const data: ImgBBResponse = await response.json();

    if (!data.success) {
      throw new Error('ImgBB upload failed');
    }

    // Return the display URL (this is the direct link to the image)
    return data.data.display_url;
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
};

/**
 * Convert File to Base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload multiple images to ImgBB
 * @param files - Array of image files
 * @returns Array of uploaded image URLs
 */
export const uploadMultipleToImgBB = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => 
    uploadToImgBB(file, `image-${Date.now()}-${index}`)
  );
  
  return Promise.all(uploadPromises);
};

/**
 * Validate ImgBB API key
 */
export const validateImgBBKey = (): boolean => {
  return !!IMGBB_API_KEY && IMGBB_API_KEY !== 'your_imgbb_api_key_here';
};


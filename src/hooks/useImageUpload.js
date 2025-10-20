import { useState } from 'react';
import imageUploadService from '../services/imageUploadService';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async () => {
    try {
      setIsUploading(true);
      setError(null);
      
      const result = await imageUploadService.selectImage();
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setError(null);
    return null;
  };

  const validateImage = (file) => {
    return imageUploadService.validateImage(file);
  };

  const getImageInfo = (base64String) => {
    return imageUploadService.getImageInfo(base64String);
  };

  return {
    uploadImage,
    clearImage,
    validateImage,
    getImageInfo,
    isUploading,
    error
  };
}

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { imageService } from '../../services/image.service';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  placeholder?: string;
  currentImage?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onError,
  maxSize = 10,
  accept = 'image/*',
  className = '',
  placeholder = 'Click to upload image',
  currentImage,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = imageService.validateImageFile(file);
    if (!validation.isValid) {
      onError?.(validation.error!);
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Resize image if needed
      const resizedFile = await imageService.resizeImage(file, 1920, 1080, 0.8);
      
      // Upload to Firebase Storage (or ImageKit in production)
      const uploadPath = `uploads/${Date.now()}_${file.name}`;
      const downloadUrl = await imageService.uploadToFirebase(resizedFile, uploadPath);
      
      onUpload(downloadUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleClick}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                Change
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 text-center px-4">
                {placeholder}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max size: {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
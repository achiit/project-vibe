import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { generateImageUrl } from '../config/imagekit';

class ImageService {
  // Upload image to Firebase Storage
  async uploadToFirebase(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading to Firebase Storage:', error);
      throw error;
    }
  }

  // Delete image from Firebase Storage
  async deleteFromFirebase(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting from Firebase Storage:', error);
      throw error;
    }
  }

  // Upload image to ImageKit (via Firebase Cloud Function)
  async uploadToImageKit(file: File, fileName: string, folder?: string): Promise<string> {
    try {
      // First upload to Firebase Storage as a temporary location
      const tempPath = `temp/${Date.now()}_${fileName}`;
      const firebaseUrl = await this.uploadToFirebase(file, tempPath);

      // In a real implementation, you would call a Cloud Function here
      // that uploads the image to ImageKit and returns the ImageKit URL
      // For now, we'll use Firebase Storage URL
      
      // TODO: Implement Cloud Function for ImageKit upload
      // const response = await fetch('/api/upload-to-imagekit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ firebaseUrl, fileName, folder }),
      // });
      // const { imageKitUrl } = await response.json();

      // Clean up temporary file
      await this.deleteFromFirebase(tempPath);

      return firebaseUrl; // Return Firebase URL for now
    } catch (error) {
      console.error('Error uploading to ImageKit:', error);
      throw error;
    }
  }

  // Generate optimized image URL using ImageKit transformations
  getOptimizedImageUrl(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}
  ): string {
    return generateImageUrl(imagePath, {
      ...options,
      format: options.format || 'auto',
      quality: options.quality || 80,
    });
  }

  // Upload challenge banner
  async uploadChallengeBanner(file: File, challengeId: string): Promise<string> {
    const fileName = `challenge_banner_${challengeId}_${Date.now()}.${file.name.split('.').pop()}`;
    const path = `challenges/${challengeId}/banner/${fileName}`;
    return this.uploadToFirebase(file, path);
  }

  // Upload user avatar
  async uploadUserAvatar(file: File, userId: string): Promise<string> {
    const fileName = `avatar_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
    const path = `users/${userId}/avatar/${fileName}`;
    return this.uploadToFirebase(file, path);
  }

  // Upload submission files
  async uploadSubmissionFile(file: File, challengeId: string, userId: string): Promise<string> {
    const fileName = `submission_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
    const path = `challenges/${challengeId}/submissions/${userId}/${fileName}`;
    return this.uploadToFirebase(file, path);
  }

  // Validate image file
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size too large. Please upload an image smaller than 10MB.',
      };
    }

    return { isValid: true };
  }

  // Resize image on client side before upload
  async resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
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

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob!], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export const imageService = new ImageService();
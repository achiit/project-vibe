import ImageKit from 'imagekit-javascript';

export const imageKitConfig = {
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
};

// ImageKit instance for client-side operations
export const imageKit = new ImageKit(imageKitConfig);

// ImageKit configuration for server-side operations (if needed)
export const serverImageKitConfig = {
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  privateKey: import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
};

// Helper function to generate ImageKit URLs with transformations
export const generateImageUrl = (
  path: string,
  transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
    focus?: 'auto' | 'face' | 'center';
  }
) => {
  const baseUrl = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
  
  if (!transformations) {
    return `${baseUrl}${path}`;
  }

  const params = [];
  
  if (transformations.width) params.push(`w-${transformations.width}`);
  if (transformations.height) params.push(`h-${transformations.height}`);
  if (transformations.quality) params.push(`q-${transformations.quality}`);
  if (transformations.format) params.push(`f-${transformations.format}`);
  if (transformations.crop) params.push(`c-${transformations.crop}`);
  if (transformations.focus) params.push(`fo-${transformations.focus}`);

  const transformationString = params.length > 0 ? `tr:${params.join(',')}` : '';
  
  return `${baseUrl}/${transformationString}${path}`;
};
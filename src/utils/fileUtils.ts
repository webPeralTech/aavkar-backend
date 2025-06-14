import fs from 'fs';
import path from 'path';

/**
 * Delete a file from the uploads directory
 * @param fileUrl - The full URL of the file
 */
export const deleteUploadedFile = (fileUrl: string): void => {
  try {
    if (!fileUrl) return;
    
    // Extract the file path from URL
    // Example: http://localhost:5000/uploads/products/image.webp -> uploads/products/image.webp
    const urlPath = new URL(fileUrl).pathname;
    const relativePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
    const fullPath = path.join(process.cwd(), relativePath);
    
    // Check if file exists and delete it
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted file: ${fullPath}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

/**
 * Get file extension from URL
 * @param fileUrl - The file URL
 * @returns File extension or empty string
 */
export const getFileExtension = (fileUrl: string): string => {
  try {
    const urlPath = new URL(fileUrl).pathname;
    return path.extname(urlPath);
  } catch (error) {
    return '';
  }
};

/**
 * Check if a file exists in the uploads directory
 * @param fileUrl - The full URL of the file
 * @returns True if file exists, false otherwise
 */
export const fileExists = (fileUrl: string): boolean => {
  try {
    if (!fileUrl) return false;
    
    const urlPath = new URL(fileUrl).pathname;
    const relativePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
    const fullPath = path.join(process.cwd(), relativePath);
    
    return fs.existsSync(fullPath);
  } catch (error) {
    return false;
  }
};

/**
 * Get file size in bytes
 * @param fileUrl - The full URL of the file
 * @returns File size in bytes or 0 if file doesn't exist
 */
export const getFileSize = (fileUrl: string): number => {
  try {
    if (!fileUrl) return 0;
    
    const urlPath = new URL(fileUrl).pathname;
    const relativePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
    const fullPath = path.join(process.cwd(), relativePath);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return stats.size;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}; 
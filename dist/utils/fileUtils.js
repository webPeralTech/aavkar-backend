"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileSize = exports.fileExists = exports.getFileExtension = exports.deleteUploadedFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Delete a file from the uploads directory
 * @param fileUrl - The full URL of the file
 */
const deleteUploadedFile = (fileUrl) => {
    try {
        if (!fileUrl)
            return;
        // Extract the file path from URL
        // Example: http://localhost:5000/uploads/products/image.webp -> uploads/products/image.webp
        const urlPath = new URL(fileUrl).pathname;
        const relativePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
        const fullPath = path_1.default.join(process.cwd(), relativePath);
        // Check if file exists and delete it
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
            console.log(`Deleted file: ${fullPath}`);
        }
    }
    catch (error) {
        console.error('Error deleting file:', error);
    }
};
exports.deleteUploadedFile = deleteUploadedFile;
/**
 * Get file extension from URL
 * @param fileUrl - The file URL
 * @returns File extension or empty string
 */
const getFileExtension = (fileUrl) => {
    try {
        const urlPath = new URL(fileUrl).pathname;
        return path_1.default.extname(urlPath);
    }
    catch (error) {
        return '';
    }
};
exports.getFileExtension = getFileExtension;
/**
 * Check if a file exists in the uploads directory
 * @param fileUrl - The full URL of the file
 * @returns True if file exists, false otherwise
 */
const fileExists = (fileUrl) => {
    try {
        if (!fileUrl)
            return false;
        const urlPath = new URL(fileUrl).pathname;
        const relativePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
        const fullPath = path_1.default.join(process.cwd(), relativePath);
        return fs_1.default.existsSync(fullPath);
    }
    catch (error) {
        return false;
    }
};
exports.fileExists = fileExists;
/**
 * Get file size in bytes
 * @param fileUrl - The full URL of the file
 * @returns File size in bytes or 0 if file doesn't exist
 */
const getFileSize = (fileUrl) => {
    try {
        if (!fileUrl)
            return 0;
        const urlPath = new URL(fileUrl).pathname;
        const relativePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
        const fullPath = path_1.default.join(process.cwd(), relativePath);
        if (fs_1.default.existsSync(fullPath)) {
            const stats = fs_1.default.statSync(fullPath);
            return stats.size;
        }
        return 0;
    }
    catch (error) {
        return 0;
    }
};
exports.getFileSize = getFileSize;

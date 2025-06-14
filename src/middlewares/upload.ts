import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
const productImagesDir = path.join(uploadDir, 'products');
const companyLogosDir = path.join(uploadDir, 'companies');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

if (!fs.existsSync(companyLogosDir)) {
  fs.mkdirSync(companyLogosDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.memoryStorage(); // Use memory storage for processing with sharp

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to handle single image upload for products
export const uploadProductImage = upload.single('photo');

// Middleware to handle single image upload for company logos
export const uploadCompanyLogo = upload.single('logo');

// Middleware to process and save the uploaded image
export const processProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(); // No file uploaded, continue
    }

    // Generate unique filename
    const filename = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const filepath = path.join(productImagesDir, filename);

    // Process image with sharp
    await sharp(req.file.buffer)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    // Generate URL for the uploaded image
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const photoUrl = `${baseUrl}/uploads/products/${filename}`;

    // Add photoUrl to request body
    req.body.photoUrl = photoUrl;

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error processing image',
      error: 'Image processing failed'
    });
  }
};

// Middleware to process and save the uploaded company logo
export const processCompanyLogo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(); // No file uploaded, continue
    }

    // Generate unique filename for company logo
    const filename = `company-logo-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const filepath = path.join(companyLogosDir, filename);

    // Process logo with sharp (smaller size for logos)
    await sharp(req.file.buffer)
      .resize(400, 400, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 90 }) // Higher quality for logos
      .toFile(filepath);

    // Generate URL for the uploaded logo
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const logoUrl = `${baseUrl}/uploads/companies/${filename}`;

    // Add company_logo to request body
    req.body.company_logo = logoUrl;

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error processing image',
      error: 'Image processing failed'
    });
  }
};

// Middleware to handle multiple images (for future use)
export const uploadMultipleImages = upload.array('photos', 5);

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        statusCode: 400,
        message: 'File too large',
        error: 'File size cannot exceed 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        statusCode: 400,
        message: 'Too many files',
        error: 'Maximum 5 files allowed'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid file type',
      error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
    });
  }

  next(error);
}; 
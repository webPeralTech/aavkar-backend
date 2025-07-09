"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.debugCompanyRequest = exports.preprocessCompanyFormData = exports.uploadMultipleImages = exports.processCompanyLogo = exports.processProductImage = exports.uploadCompanyLogo = exports.uploadProductImage = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create uploads directory if it doesn't exist
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
const productImagesDir = path_1.default.join(uploadDir, 'products');
const companyLogosDir = path_1.default.join(uploadDir, 'companies');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
if (!fs_1.default.existsSync(productImagesDir)) {
    fs_1.default.mkdirSync(productImagesDir, { recursive: true });
}
if (!fs_1.default.existsSync(companyLogosDir)) {
    fs_1.default.mkdirSync(companyLogosDir, { recursive: true });
}
// Configure multer for file upload
const storage = multer_1.default.memoryStorage(); // Use memory storage for processing with sharp
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Middleware to handle single image upload for products
exports.uploadProductImage = upload.single('photo');
// Middleware to handle form-data with optional logo upload for companies
const uploadCompanyLogo = (req, res, next) => {
    // Configure multer to handle all form-data fields
    const logoUpload = (0, multer_1.default)({
        storage,
        fileFilter: (req, file, cb) => {
            // Only validate file type for logo field (accept both 'logo' and 'company_logo')
            if (file.fieldname === 'logo' || file.fieldname === 'company_logo') {
                if (file.mimetype.startsWith('image/')) {
                    cb(null, true);
                }
                else {
                    cb(new Error('Only image files are allowed for logo!'));
                }
            }
            else {
                cb(null, true);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit for files
            fields: 20, // Allow up to 20 form fields
            fieldSize: 2 * 1024 * 1024, // 2MB per text field
        },
    }).any(); // Accept any form fields
    logoUpload(req, res, (err) => {
        if (err) {
            return next(err);
        }
        // Separate logo file from other fields
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file) => {
                if (file.fieldname === 'logo' || file.fieldname === 'company_logo') {
                    req.file = file; // Set logo file for processing
                }
            });
        }
        next();
    });
};
exports.uploadCompanyLogo = uploadCompanyLogo;
// Middleware to process and save the uploaded image
const processProductImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return next(); // No file uploaded, continue
        }
        // Generate unique filename
        const filename = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
        const filepath = path_1.default.join(productImagesDir, filename);
        // Process image with sharp
        yield (0, sharp_1.default)(req.file.buffer)
            .resize(800, 600, {
            fit: 'inside',
            withoutEnlargement: true
        })
            .webp({ quality: 80 })
            .toFile(filepath);
        // Generate URL for the uploaded image
        const baseUrl = process.env.NODE_ENV === 'production' ? "https://aavkar-backend.onrender.com" : process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const photoUrl = `${baseUrl}/uploads/products/${filename}`;
        // Add photoUrl to request body
        req.body.photoUrl = photoUrl;
        next();
    }
    catch (error) {
        console.error('Image processing error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error processing image',
            error: 'Image processing failed'
        });
    }
});
exports.processProductImage = processProductImage;
// Middleware to process and save the uploaded company logo
const processCompanyLogo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return next(); // No file uploaded, continue
        }
        // Generate unique filename for company logo
        const filename = `company-logo-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
        const filepath = path_1.default.join(companyLogosDir, filename);
        // Process logo with sharp (smaller size for logos)
        yield (0, sharp_1.default)(req.file.buffer)
            .resize(400, 400, {
            fit: 'inside',
            withoutEnlargement: true
        })
            .webp({ quality: 90 }) // Higher quality for logos
            .toFile(filepath);
        // Generate URL for the uploaded logo
        const baseUrl = process.env.NODE_ENV === 'production' ? "https://aavkar-backend.onrender.com" : process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const logoUrl = `${baseUrl}/uploads/companies/${filename}`;
        // Add company_logo to request body
        req.body.company_logo = logoUrl;
        next();
    }
    catch (error) {
        console.error('Image processing error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error processing image',
            error: 'Image processing failed'
        });
    }
});
exports.processCompanyLogo = processCompanyLogo;
// Middleware to handle multiple images (for future use)
exports.uploadMultipleImages = upload.array('photos', 5);
// Middleware to preprocess form-data for company creation/update
const preprocessCompanyFormData = (req, res, next) => {
    // Always process the body, regardless of content-type
    if (req.body && typeof req.body === 'object') {
        // Convert empty strings to undefined for optional fields
        const optionalFields = ['office_contact_number', 'website', 'gst_no', 'ip_whitelisting', 'message_tokens'];
        optionalFields.forEach(field => {
            if (req.body[field] === '' || req.body[field] === null || req.body[field] === undefined) {
                delete req.body[field];
            }
        });
        // Ensure email is lowercase
        if (req.body.email && typeof req.body.email === 'string') {
            req.body.email = req.body.email.toLowerCase().trim();
        }
        // Trim all string fields
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};
exports.preprocessCompanyFormData = preprocessCompanyFormData;
// Debug middleware to log request data (remove in production)
const debugCompanyRequest = (req, res, next) => {
    console.log('=== Debug Company Request ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('File:', req.file);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Body values:', Object.values(req.body));
    console.log('===========================');
    next();
};
exports.debugCompanyRequest = debugCompanyRequest;
// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
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
        // Handle other multer errors
        return res.status(400).json({
            statusCode: 400,
            message: 'File upload error',
            error: error.message
        });
    }
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            statusCode: 400,
            message: 'Invalid file type',
            error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
        });
    }
    // If it's not a multer error, pass it to the next middleware
    next(error);
};
exports.handleUploadError = handleUploadError;

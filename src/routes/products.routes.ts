import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createBulkProducts,
} from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth';
import { 
  uploadProductImage, 
  processProductImage,
  handleUploadError 
} from '../middlewares/upload';
import {
  createProductWithFileSchema,
  getProductsQuerySchema,
  updateProductWithFileSchema,
  createBulkProductsSchema,
  idParamSchema,
  validate
} from '../utils/validation';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product and Service management endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/products - Get all products with pagination and filters
router.get('/', validate(getProductsQuerySchema), getProducts);

// GET /api/products/:id - Get specific product by ID
router.get('/:id', validate(idParamSchema), getProduct);

// POST /api/products - Create new product/service with optional photo upload
router.post('/', 
  uploadProductImage, 
  processProductImage,
  handleUploadError, 
  validate(createProductWithFileSchema), 
  createProduct
);

// POST /api/products/bulk - Create multiple products/services
router.post('/bulk', validate(createBulkProductsSchema), createBulkProducts);

// PUT /api/products/:id - Update product/service with optional photo upload
router.put('/:id', 
  uploadProductImage, 
  processProductImage,
  handleUploadError, 
  validate(updateProductWithFileSchema), 
  updateProduct
);

// DELETE /api/products/:id - Delete product/service
router.delete('/:id', validate(idParamSchema), deleteProduct);

export default router; 
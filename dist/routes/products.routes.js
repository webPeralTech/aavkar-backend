"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middlewares/auth");
const validation_1 = require("../utils/validation");
const upload_1 = require("../middlewares/upload");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product or service (JSON)
 *     description: Create a new product or service record with JSON data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Web Development Service
 *               type:
 *                 type: string
 *                 enum: [product, service]
 *                 default: service
 *                 example: service
 *               unit:
 *                 type: string
 *                 maxLength: 20
 *                 example: hour
 *               code:
 *                 type: string
 *                 maxLength: 50
 *                 example: WEB001
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/product-image.jpg
 *               baseCost:
 *                 type: number
 *                 minimum: 0
 *                 example: 50.00
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Professional web development services including frontend and backend
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', (0, validation_1.validate)(validation_1.createProductSchema), product_controller_1.createProduct);
/**
 * @swagger
 * /api/products/upload:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product or service with image upload
 *     description: Create a new product or service record with multipart form data and image upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Web Development Service
 *               type:
 *                 type: string
 *                 enum: [product, service]
 *                 default: service
 *                 example: service
 *               unit:
 *                 type: string
 *                 maxLength: 20
 *                 example: hour
 *               code:
 *                 type: string
 *                 maxLength: 50
 *                 example: WEB001
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Product image file (JPEG, PNG, GIF, WebP - max 5MB)
 *               baseCost:
 *                 type: number
 *                 minimum: 0
 *                 example: 50.00
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Professional web development services including frontend and backend
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully with uploaded image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload', upload_1.uploadProductImage, upload_1.handleUploadError, upload_1.processProductImage, (0, validation_1.validate)(validation_1.createProductWithFileSchema), product_controller_1.createProduct);
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get products with pagination and filtering
 *     description: Retrieve a list of products/services with optional filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [product, service]
 *         description: Filter by product type
 *       - name: isActive
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search in name, description, code, and unit
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - name: sortOrder
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Products retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (0, validation_1.validate)(validation_1.getProductsQuerySchema), product_controller_1.getProducts);
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     description: Retrieve a specific product by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Product retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (0, validation_1.validate)(validation_1.idParamSchema), product_controller_1.getProduct);
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product by ID (JSON)
 *     description: Update a specific product by its ID with JSON data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Updated Web Development Service
 *               type:
 *                 type: string
 *                 enum: [product, service]
 *                 example: service
 *               unit:
 *                 type: string
 *                 maxLength: 20
 *                 example: hour
 *               code:
 *                 type: string
 *                 maxLength: 50
 *                 example: WEB001
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/updated-product-image.jpg
 *               baseCost:
 *                 type: number
 *                 minimum: 0
 *                 example: 60.00
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated professional web development services
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', (0, validation_1.validate)(validation_1.updateProductWithIdSchema), product_controller_1.updateProduct);
/**
 * @swagger
 * /api/products/{id}/upload:
 *   put:
 *     tags: [Products]
 *     summary: Update product by ID with image upload
 *     description: Update a specific product by its ID with multipart form data and optional image upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Updated Web Development Service
 *               type:
 *                 type: string
 *                 enum: [product, service]
 *                 example: service
 *               unit:
 *                 type: string
 *                 maxLength: 20
 *                 example: hour
 *               code:
 *                 type: string
 *                 maxLength: 50
 *                 example: WEB001
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: New product image file (optional - JPEG, PNG, GIF, WebP - max 5MB)
 *               baseCost:
 *                 type: number
 *                 minimum: 0
 *                 example: 60.00
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated professional web development services
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product updated successfully with optional new image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/upload', upload_1.uploadProductImage, upload_1.handleUploadError, upload_1.processProductImage, (0, validation_1.validate)(validation_1.updateProductWithFileSchema), product_controller_1.updateProduct);
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Soft delete product by ID
 *     description: Soft delete a product by setting isActive to false
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', (0, validation_1.validate)(validation_1.idParamSchema), product_controller_1.deleteProduct);
exports.default = router;

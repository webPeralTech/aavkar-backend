"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const validation_1 = require("../utils/validation");
const router = express_1.default.Router();
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
router.use(auth_1.authenticate);
// GET /api/products - Get all products with pagination and filters
router.get('/', (0, validation_1.validate)(validation_1.getProductsQuerySchema), product_controller_1.getProducts);
// GET /api/products/:id - Get specific product by ID
router.get('/:id', (0, validation_1.validate)(validation_1.idParamSchema), product_controller_1.getProduct);
// POST /api/products - Create new product/service with optional photo upload
router.post('/', upload_1.uploadProductImage, upload_1.processProductImage, upload_1.handleUploadError, (0, validation_1.validate)(validation_1.createProductWithFileSchema), product_controller_1.createProduct);
// POST /api/products/bulk - Create multiple products/services
router.post('/bulk', (0, validation_1.validate)(validation_1.createBulkProductsSchema), product_controller_1.createBulkProducts);
// PUT /api/products/:id - Update product/service with optional photo upload
router.put('/:id', upload_1.uploadProductImage, upload_1.processProductImage, upload_1.handleUploadError, (0, validation_1.validate)(validation_1.updateProductWithFileSchema), product_controller_1.updateProduct);
// DELETE /api/products/:id - Delete product/service
router.delete('/:id', (0, validation_1.validate)(validation_1.idParamSchema), product_controller_1.deleteProduct);
exports.default = router;

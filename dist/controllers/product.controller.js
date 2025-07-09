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
exports.createBulkProducts = exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.getProducts = exports.createProduct = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const fileUtils_1 = require("../utils/fileUtils");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - ps_name
 *         - ps_type
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the product/service
 *         ps_name:
 *           type: string
 *           description: Name of the product or service
 *           maxLength: 100
 *         ps_type:
 *           type: string
 *           enum: [product, service]
 *           description: Type of entry
 *           default: service
 *         ps_unit:
 *           type: string
 *           description: Unit of measurement (e.g., qty, kg, pcs)
 *           maxLength: 20
 *         ps_tax:
 *           type: number
 *           enum: [0, 5, 12, 18, 28]
 *           description: Tax percentage
 *           default: 0
 *         ps_hsn_code:
 *           type: string
 *           description: HSN or service code for classification
 *           maxLength: 50
 *         ps_code:
 *           type: string
 *           description: Unique business code for the product
 *           maxLength: 50
 *         printing_operator_code:
 *           type: string
 *           description: Code for printing operator
 *           maxLength: 50
 *         ps_photo:
 *           type: string
 *           description: Image URL or file path for the product
 *         ps_base_cost:
 *           type: number
 *           minimum: 0
 *           description: Base cost of the product/service
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductCreateRequest:
 *       type: object
 *       required:
 *         - ps_name
 *       properties:
 *         ps_name:
 *           type: string
 *           maxLength: 100
 *         ps_type:
 *           type: string
 *           enum: [product, service]
 *           default: service
 *         ps_unit:
 *           type: string
 *           maxLength: 20
 *         ps_tax:
 *           type: number
 *           enum: [0, 5, 12, 18, 28]
 *         ps_hsn_code:
 *           type: string
 *           maxLength: 50
 *         ps_code:
 *           type: string
 *           maxLength: 50
 *         printing_operator_code:
 *           type: string
 *           maxLength: 50
 *         ps_base_cost:
 *           type: number
 *           minimum: 0
 */
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product/service
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ps_name:
 *                 type: string
 *               ps_type:
 *                 type: string
 *                 enum: [product, service]
 *               ps_unit:
 *                 type: string
 *               ps_tax:
 *                 type: number
 *                 enum: [0, 5, 12, 18, 28]
 *               ps_hsn_code:
 *                 type: string
 *               ps_code:
 *                 type: string
 *               printing_operator_code:
 *                 type: string
 *               ps_base_cost:
 *                 type: number
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 */
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productData = req.body;
        logger_1.default.info('Creating new product:', { productData });
        // Validate required fields
        if (!productData.ps_name || productData.ps_name.trim() === '') {
            res.status(400).json({
                statusCode: 400,
                message: 'Product/Service name is required',
                error: 'Validation failed',
            });
            return;
        }
        // Ensure ps_type defaults to 'service' if not provided
        if (!productData.ps_type) {
            productData.ps_type = 'service';
        }
        // Validate ps_tax if provided
        if (productData.ps_tax !== undefined && ![0, 5, 12, 18, 28].includes(Number(productData.ps_tax))) {
            res.status(400).json({
                statusCode: 400,
                message: 'Tax must be one of: 0, 5, 12, 18, 28',
                error: 'Validation failed',
            });
            return;
        }
        // Convert numeric fields
        if (productData.ps_tax !== undefined) {
            productData.ps_tax = Number(productData.ps_tax);
        }
        if (productData.ps_base_cost !== undefined) {
            productData.ps_base_cost = Number(productData.ps_base_cost);
        }
        const product = new product_model_1.default(productData);
        yield product.save();
        logger_1.default.info('Product created successfully:', { productId: product._id });
        res.status(201).json({
            statusCode: 201,
            message: 'Product created successfully',
            data: { product },
        });
    }
    catch (error) {
        logger_1.default.error('Create product error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                statusCode: 400,
                message: 'Validation failed',
                error: 'Validation failed',
                details: errors
            });
        }
        else if (error.code === 11000) {
            // Handle unique constraint violation
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({
                statusCode: 400,
                message: `Product with this ${field} already exists`,
                error: 'Duplicate entry'
            });
        }
        else {
            res.status(500).json({
                statusCode: 500,
                message: 'Server error during product creation',
                error: 'Internal server error'
            });
        }
    }
});
exports.createProduct = createProduct;
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products/services with pagination and filters
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: ps_type
 *         schema:
 *           type: string
 *           enum: [product, service]
 *         description: Filter by product type
 *       - in: query
 *         name: ps_tax
 *         schema:
 *           type: number
 *           enum: [0, 5, 12, 18, 28]
 *         description: Filter by tax percentage
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, code, or HSN code
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, ps_type, ps_tax, search, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
        logger_1.default.info('Fetching products with filters:', { page, limit, ps_type, ps_tax, search });
        // Build filter query
        const filter = {};
        if (ps_type)
            filter.ps_type = ps_type;
        if (ps_tax !== undefined)
            filter.ps_tax = Number(ps_tax);
        // Add search functionality
        if (search) {
            filter.$or = [
                { ps_name: { $regex: search, $options: 'i' } },
                { ps_code: { $regex: search, $options: 'i' } },
                { ps_hsn_code: { $regex: search, $options: 'i' } },
                { printing_operator_code: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortObject = {};
        sortObject[sortBy] = sortDirection;
        const products = yield product_model_1.default.find(filter)
            .sort(sortObject)
            .skip(skip)
            .limit(Number(limit));
        const total = yield product_model_1.default.countDocuments(filter);
        res.status(200).json({
            statusCode: 200,
            message: 'Products retrieved successfully',
            data: {
                products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        logger_1.default.error('Get products error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getProducts = getProducts;
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a specific product/service by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        logger_1.default.info('Fetching product by ID:', { productId: id });
        const product = yield product_model_1.default.findById(id);
        if (!product) {
            res.status(404).json({
                statusCode: 404,
                message: 'Product not found',
                error: 'Product not found'
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Product retrieved successfully',
            data: { product }
        });
    }
    catch (error) {
        logger_1.default.error('Get product error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getProduct = getProduct;
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product/service
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreateRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        logger_1.default.info('Updating product:', { productId: id, updateData });
        const product = yield product_model_1.default.findById(id);
        if (!product) {
            res.status(404).json({
                statusCode: 404,
                message: 'Product not found',
                error: 'Product not found'
            });
            return;
        }
        // Validate ps_tax if being updated
        if (updateData.ps_tax !== undefined && ![0, 5, 12, 18, 28].includes(Number(updateData.ps_tax))) {
            res.status(400).json({
                statusCode: 400,
                message: 'Tax must be one of: 0, 5, 12, 18, 28',
                error: 'Validation failed',
            });
            return;
        }
        // Convert numeric fields
        if (updateData.ps_tax !== undefined) {
            updateData.ps_tax = Number(updateData.ps_tax);
        }
        if (updateData.ps_base_cost !== undefined) {
            updateData.ps_base_cost = Number(updateData.ps_base_cost);
        }
        // If a new photo is uploaded, delete the old one
        if (updateData.ps_photo && product.ps_photo && updateData.ps_photo !== product.ps_photo) {
            (0, fileUtils_1.deleteUploadedFile)(product.ps_photo);
        }
        const updatedProduct = yield product_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        logger_1.default.info('Product updated successfully:', { productId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Product updated successfully',
            data: { product: updatedProduct },
        });
    }
    catch (error) {
        logger_1.default.error('Update product error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                statusCode: 400,
                message: 'Validation failed',
                error: 'Validation failed',
                details: errors
            });
        }
        else if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({
                statusCode: 400,
                message: `Product with this ${field} already exists`,
                error: 'Duplicate entry'
            });
        }
        else {
            res.status(500).json({
                statusCode: 500,
                message: 'Server error',
                error: 'Internal server error'
            });
        }
    }
});
exports.updateProduct = updateProduct;
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product/service
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        logger_1.default.info('Deleting product:', { productId: id });
        const product = yield product_model_1.default.findById(id);
        if (!product) {
            res.status(404).json({
                statusCode: 404,
                message: 'Product not found',
                error: 'Product not found'
            });
            return;
        }
        // Delete associated photo file if exists
        if (product.ps_photo) {
            (0, fileUtils_1.deleteUploadedFile)(product.ps_photo);
        }
        yield product_model_1.default.findByIdAndDelete(id);
        logger_1.default.info('Product deleted successfully:', { productId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Product deleted successfully',
            data: null,
        });
    }
    catch (error) {
        logger_1.default.error('Delete product error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.deleteProduct = deleteProduct;
/**
 * @swagger
 * /api/products/bulk:
 *   post:
 *     summary: Create multiple products/services
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ProductCreateRequest'
 *     responses:
 *       201:
 *         description: Products created successfully
 */
const createBulkProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { products } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            res.status(400).json({
                statusCode: 400,
                message: 'Products array is required and cannot be empty',
                error: 'Validation failed',
            });
            return;
        }
        logger_1.default.info('Creating bulk products:', { count: products.length });
        // Validate each product and set defaults
        const processedProducts = products.map((productData) => {
            if (!productData.ps_name || productData.ps_name.trim() === '') {
                throw new Error('Product/Service name is required for all products');
            }
            // Ensure ps_type defaults to 'service' if not provided
            if (!productData.ps_type) {
                productData.ps_type = 'service';
            }
            // Convert numeric fields
            if (productData.ps_tax !== undefined) {
                productData.ps_tax = Number(productData.ps_tax);
            }
            if (productData.ps_base_cost !== undefined) {
                productData.ps_base_cost = Number(productData.ps_base_cost);
            }
            return productData;
        });
        const createdProducts = yield product_model_1.default.insertMany(processedProducts, {
            ordered: false // Continue inserting even if some fail
        });
        logger_1.default.info('Bulk products created successfully:', { count: createdProducts.length });
        res.status(201).json({
            statusCode: 201,
            message: `${createdProducts.length} products created successfully`,
            data: {
                products: createdProducts,
                created: createdProducts.length,
                total: products.length
            },
        });
    }
    catch (error) {
        logger_1.default.error('Bulk create products error:', error);
        if (error.message.includes('Product/Service name is required')) {
            res.status(400).json({
                statusCode: 400,
                message: error.message,
                error: 'Validation failed',
            });
        }
        else {
            res.status(500).json({
                statusCode: 500,
                message: 'Server error during bulk product creation',
                error: 'Internal server error'
            });
        }
    }
});
exports.createBulkProducts = createBulkProducts;

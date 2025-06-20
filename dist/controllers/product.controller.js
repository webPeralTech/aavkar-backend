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
exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.getProducts = exports.createProduct = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const fileUtils_1 = require("../utils/fileUtils");
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productData = req.body;
        const product = new product_model_1.default(productData);
        yield product.save();
        res.status(201).json({
            statusCode: 201,
            message: 'Product created successfully',
            data: { product },
        });
    }
    catch (error) {
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
            res.status(400).json({
                statusCode: 400,
                message: 'Product with this name already exists',
                error: 'Product with this name already exists'
            });
        }
        else {
            console.error('Create product error:', error);
            res.status(500).json({
                statusCode: 500,
                message: 'Server error during product creation',
                error: 'Server error during product creation'
            });
        }
    }
});
exports.createProduct = createProduct;
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, type, isActive, search, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
        // Build filter query
        const filter = {};
        if (type)
            filter.type = type;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        // Add search functionality
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { unit: { $regex: search, $options: 'i' } },
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
        console.error('Get products error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Server error'
        });
    }
});
exports.getProducts = getProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
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
        console.error('Get product error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Server error'
        });
    }
});
exports.getProduct = getProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const product = yield product_model_1.default.findById(id);
        if (!product) {
            res.status(404).json({
                statusCode: 404,
                message: 'Product not found',
                error: 'Product not found'
            });
            return;
        }
        // If a new photo is uploaded, delete the old one
        if (updateData.photoUrl && product.photoUrl && updateData.photoUrl !== product.photoUrl) {
            (0, fileUtils_1.deleteUploadedFile)(product.photoUrl);
        }
        const updatedProduct = yield product_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            statusCode: 200,
            message: 'Product updated successfully',
            data: { product: updatedProduct },
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                statusCode: 400,
                message: 'Validation failed',
                error: 'Validation failed',
                details: errors
            });
        }
        else {
            console.error('Update product error:', error);
            res.status(500).json({
                statusCode: 500,
                message: 'Server error',
                error: 'Server error'
            });
        }
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield product_model_1.default.findById(id);
        if (!product) {
            res.status(404).json({
                statusCode: 404,
                message: 'Product not found',
                error: 'Product not found'
            });
            return;
        }
        // Soft delete by setting isActive to false
        const updatedProduct = yield product_model_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
        res.status(200).json({
            statusCode: 200,
            message: 'Product deleted successfully',
            data: { product: updatedProduct }
        });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Server error'
        });
    }
});
exports.deleteProduct = deleteProduct;

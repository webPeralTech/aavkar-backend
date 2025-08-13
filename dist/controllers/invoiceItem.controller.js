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
exports.getInvoiceItemStatistics = exports.getItemsByPriority = exports.updateItemStatus = exports.deleteInvoiceItem = exports.updateInvoiceItem = exports.getInvoiceItem = exports.getInvoiceItems = exports.createInvoiceItem = void 0;
const invoiceItem_model_1 = __importDefault(require("../models/invoiceItem.model"));
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const createInvoiceItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemData = req.body;
        console.log('Creating new invoice item:', { itemData });
        // Verify invoice exists and is not deleted
        const invoice = yield invoice_model_1.default.findOne({ _id: itemData.invoiceId, isDeleted: false });
        if (!invoice) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice not found',
                error: 'Invoice not found'
            });
            return;
        }
        // Verify product/service exists and is not deleted
        const product = yield product_model_1.default.findOne({ _id: itemData.psId, isDeleted: false });
        if (!product) {
            res.status(404).json({
                statusCode: 404,
                message: 'Product/Service not found',
                error: 'Product/Service not found'
            });
            return;
        }
        // Create invoice item
        const invoiceItem = new invoiceItem_model_1.default(itemData);
        yield invoiceItem.save();
        // Populate related data
        yield invoiceItem.populate([
            { path: 'invoiceId', select: 'invoiceId customerId invoiceDate' },
            { path: 'psId', select: 'ps_name ps_type ps_unit' }
        ]);
        console.log('Invoice item created successfully:', { itemId: invoiceItem._id });
        res.status(201).json({
            statusCode: 201,
            message: 'Invoice item created successfully',
            data: { invoiceItem },
        });
    }
    catch (error) {
        console.error('Create invoice item error:', error);
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
            res.status(500).json({
                statusCode: 500,
                message: 'Server error during invoice item creation',
                error: 'Server error during invoice item creation'
            });
        }
    }
});
exports.createInvoiceItem = createInvoiceItem;
const getInvoiceItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, invoiceId, steps, priority, allocation, userAllocation, search, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
        console.log('Fetching invoice items with filters:', { page, limit, invoiceId, steps, priority, allocation });
        // Build filter query
        const filter = { isDeleted: false };
        if (invoiceId)
            filter.invoiceId = invoiceId;
        if (steps)
            filter.steps = steps;
        if (priority)
            filter.priority = priority;
        if (allocation)
            filter.allocation = allocation;
        if (userAllocation)
            filter.userAllocation = userAllocation;
        // Search functionality
        if (search) {
            filter.$or = [
                { psDescription: { $regex: search, $options: 'i' } },
                { allocation: { $regex: search, $options: 'i' } },
                { userAllocation: { $regex: search, $options: 'i' } },
                { printingOperation: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortObject = {};
        sortObject[sortBy] = sortDirection;
        const invoiceItems = yield invoiceItem_model_1.default.find(filter)
            .populate('invoiceId', 'invoiceId customerId invoiceDate invoiceStatus')
            .populate('psId', 'ps_name ps_type ps_unit')
            .sort(sortObject)
            .skip(skip)
            .limit(Number(limit));
        const total = yield invoiceItem_model_1.default.countDocuments(filter);
        // Calculate summary statistics for filtered results
        const summaryStats = yield invoiceItem_model_1.default.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: 1 },
                    totalQuantity: { $sum: '$qty' },
                    totalAmount: { $sum: '$total' },
                    totalDiscount: { $sum: '$discount' }
                }
            }
        ]);
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice items retrieved successfully',
            data: {
                invoiceItems,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
                summary: summaryStats[0] || {
                    totalItems: 0,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalDiscount: 0
                }
            },
        });
    }
    catch (error) {
        console.error('Get invoice items error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getInvoiceItems = getInvoiceItems;
const getInvoiceItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log('Fetching invoice item by ID:', { itemId: id });
        const invoiceItem = yield invoiceItem_model_1.default.findOne({ _id: id, isDeleted: false })
            .populate('invoiceId', 'invoiceId customerId invoiceDate invoiceStatus')
            .populate('psId', 'ps_name ps_type ps_unit ps_tax');
        if (!invoiceItem) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice item not found',
                error: 'Invoice item not found'
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice item retrieved successfully',
            data: { invoiceItem }
        });
    }
    catch (error) {
        console.error('Get invoice item error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getInvoiceItem = getInvoiceItem;
const updateInvoiceItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log('Updating invoice item:', { itemId: id, updateData });
        const invoiceItem = yield invoiceItem_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!invoiceItem) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice item not found',
                error: 'Invoice item not found'
            });
            return;
        }
        // If psId is being updated, verify it exists
        if (updateData.psId && updateData.psId !== invoiceItem.psId.toString()) {
            const product = yield product_model_1.default.findOne({ _id: updateData.psId, isDeleted: false });
            if (!product) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'Product/Service not found',
                    error: 'Product/Service not found'
                });
                return;
            }
        }
        const updatedInvoiceItem = yield invoiceItem_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate([
            { path: 'invoiceId', select: 'invoiceId customerId invoiceDate' },
            { path: 'psId', select: 'ps_name ps_type ps_unit' }
        ]);
        console.log('Invoice item updated successfully:', { itemId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice item updated successfully',
            data: { invoiceItem: updatedInvoiceItem },
        });
    }
    catch (error) {
        console.error('Update invoice item error:', error);
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
            res.status(500).json({
                statusCode: 500,
                message: 'Server error',
                error: 'Internal server error'
            });
        }
    }
});
exports.updateInvoiceItem = updateInvoiceItem;
const deleteInvoiceItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log('Deleting invoice item:', { itemId: id });
        const invoiceItem = yield invoiceItem_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!invoiceItem) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice item not found',
                error: 'Invoice item not found'
            });
            return;
        }
        // Soft delete the invoice item
        yield invoiceItem_model_1.default.findByIdAndUpdate(id, { isDeleted: true });
        console.log('Invoice item deleted successfully:', { itemId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice item deleted successfully',
            data: null,
        });
    }
    catch (error) {
        console.error('Delete invoice item error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.deleteInvoiceItem = deleteInvoiceItem;
const updateItemStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { steps, printingReport } = req.body;
        console.log('Updating invoice item status:', { itemId: id, steps, printingReport });
        const invoiceItem = yield invoiceItem_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!invoiceItem) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice item not found',
                error: 'Invoice item not found'
            });
            return;
        }
        const updateData = { steps };
        if (printingReport)
            updateData.printingReport = printingReport;
        const updatedInvoiceItem = yield invoiceItem_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate([
            { path: 'invoiceId', select: 'invoiceId customerId invoiceDate' },
            { path: 'psId', select: 'ps_name ps_type ps_unit' }
        ]);
        console.log('Invoice item status updated successfully:', { itemId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Item status updated successfully',
            data: { invoiceItem: updatedInvoiceItem },
        });
    }
    catch (error) {
        console.error('Update item status error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.updateItemStatus = updateItemStatus;
const getItemsByPriority = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { priority } = req.params;
        console.log('Fetching items by priority:', { priority });
        if (!['Low', 'Medium', 'High'].includes(priority)) {
            res.status(400).json({
                statusCode: 400,
                message: 'Invalid priority value',
                error: 'Priority must be Low, Medium, or High'
            });
            return;
        }
        const items = yield invoiceItem_model_1.default.getItemsByPriority(priority);
        res.status(200).json({
            statusCode: 200,
            message: `${priority} priority items retrieved successfully`,
            data: { items }
        });
    }
    catch (error) {
        console.error('Get items by priority error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getItemsByPriority = getItemsByPriority;
const getInvoiceItemStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { invoiceId } = req.query;
        console.log('Fetching invoice item statistics:', { invoiceId });
        if (invoiceId) {
            // Get statistics for a specific invoice
            const stats = yield invoiceItem_model_1.default.getItemStatsByInvoice(invoiceId);
            res.status(200).json({
                statusCode: 200,
                message: 'Invoice item statistics retrieved successfully',
                data: {
                    invoiceStats: stats[0] || {
                        totalItems: 0,
                        totalQuantity: 0,
                        totalAmount: 0,
                        totalDiscount: 0,
                        totalBaseCost: 0
                    }
                }
            });
        }
        else {
            // Get general status-wise statistics
            const statusStats = yield invoiceItem_model_1.default.getStatusWiseStats();
            res.status(200).json({
                statusCode: 200,
                message: 'Invoice item statistics retrieved successfully',
                data: {
                    statusWise: statusStats
                }
            });
        }
    }
    catch (error) {
        console.error('Get invoice item statistics error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getInvoiceItemStatistics = getInvoiceItemStatistics;

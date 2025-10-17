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
exports.getInvoiceCount = exports.updateInvoiceStatus = exports.getInvoiceStatistics = exports.updateInvoicePayment = exports.deleteInvoice = exports.updateInvoice = exports.getInvoice = exports.getInvoices = exports.createInvoice = void 0;
const invoice_model_1 = __importDefault(require("../models/invoice.model"));
const customer_model_1 = __importDefault(require("../models/customer.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const createInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoiceData = req.body;
        console.log('Creating new invoice:', { invoiceData });
        // Verify customer exists and is not deleted
        const customer = yield customer_model_1.default.findOne({ _id: invoiceData.customer.id, isDeleted: false });
        console.log('Customer:', customer);
        if (!customer) {
            res.status(404).json({
                statusCode: 404,
                message: 'Customer not found',
                error: 'Customer not found'
            });
            return;
        }
        // Verify all products exist
        const productIds = invoiceData.items.map((item) => item.product.id);
        const products = yield product_model_1.default.find({ _id: { $in: productIds }, isDeleted: false });
        if (products.length !== productIds.length) {
            res.status(404).json({
                statusCode: 404,
                message: 'One or more products not found',
                error: 'Product not found'
            });
            return;
        }
        // Handle invoice number validation and generation
        if (invoiceData.invoiceNumber) {
            // Check if invoice number already exists for non-deleted invoices
            const existingInvoice = yield invoice_model_1.default.findOne({
                invoiceNumber: invoiceData.invoiceNumber,
                isDeleted: false
            });
            if (existingInvoice) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Invoice number already exists',
                    error: 'Invoice number already exists'
                });
                return;
            }
            // If invoice number exists but is soft-deleted, allow creation
            console.log('Invoice number provided:', invoiceData.invoiceNumber);
        }
        else {
            // Generate unique invoice number if not provided
            invoiceData.invoiceNumber = yield invoice_model_1.default.generateInvoiceNumber();
        }
        // Set default from information if not provided
        if (!invoiceData.from) {
            invoiceData.from = {
                name: "Aavkar Graphics",
                address: "G-28, Silver Business Point, Utran, Mota Varachha, Surat.",
                phone: "8980915579",
                email: "aavkargraphics@gmail.com"
            };
        }
        // Set default issued date if not provided
        if (!invoiceData.issuedDate) {
            invoiceData.issuedDate = new Date();
        }
        // Create invoice with embedded items
        const invoice = new invoice_model_1.default(invoiceData);
        yield invoice.save();
        console.log('Invoice created successfully:', { invoiceId: invoice._id });
        res.status(201).json({
            statusCode: 201,
            message: 'Invoice created successfully',
            data: { invoice },
        });
    }
    catch (error) {
        console.error('Create invoice error:', error);
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
                message: `Invoice with this ${field} already exists`,
                error: 'Duplicate entry',
                details: `The ${field} must be unique across all invoices`
            });
        }
        else {
            res.status(500).json({
                statusCode: 500,
                message: 'Server error during invoice creation',
                error: 'Server error during invoice creation'
            });
        }
    }
});
exports.createInvoice = createInvoice;
const getInvoices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, status, customerId, start_date, end_date, search, priority, sortBy = 'issuedDate', sortOrder = 'desc', } = req.query;
        console.log('Fetching invoices with filters:', { page, limit, status, customerId, start_date, end_date, search, priority });
        // Build filter query
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (customerId)
            filter['customer.id'] = customerId;
        if (priority)
            filter['items.priority'] = priority;
        // Date range filter
        if (start_date || end_date) {
            filter.issuedDate = {};
            if (start_date)
                filter.issuedDate.$gte = new Date(start_date);
            if (end_date)
                filter.issuedDate.$lte = new Date(end_date);
        }
        // Search functionality
        if (search) {
            filter.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.phone': { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortObject = {};
        sortObject[sortBy] = sortDirection;
        const invoices = yield invoice_model_1.default.find(filter)
            .sort(sortObject)
            .skip(skip)
            .limit(Number(limit));
        const total = yield invoice_model_1.default.countDocuments(filter);
        // Calculate summary statistics for filtered results
        const summaryStats = yield invoice_model_1.default.aggregate([
            { $match: filter },
            {
                $addFields: {
                    totalProfit: {
                        $reduce: {
                            input: '$items',
                            initialValue: 0,
                            in: {
                                $add: [
                                    '$$value',
                                    {
                                        $subtract: [
                                            '$$this.total',
                                            { $multiply: ['$$this.quantity', '$$this.baseCost'] }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    isPaid: {
                        $cond: {
                            if: { $gte: [{ $ifNull: ['$paidAmount', 0] }, '$summary.grandTotal'] },
                            then: 1,
                            else: 0
                        }
                    },
                    isUnpaid: {
                        $cond: {
                            if: { $lt: [{ $ifNull: ['$paidAmount', 0] }, '$summary.grandTotal'] },
                            then: 1,
                            else: 0
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalInvoiceCount: { $sum: 1 },
                    totalPaidCount: { $sum: '$isPaid' },
                    totalUnpaidCount: { $sum: '$isUnpaid' },
                    totalAmount: { $sum: '$summary.grandTotal' },
                    totalPaid: { $sum: { $ifNull: ['$paidAmount', 0] } },
                    totalDue: { $sum: { $ifNull: ['$dueAmount', '$summary.grandTotal'] } },
                    totalProfit: { $sum: '$totalProfit' }
                }
            }
        ]);
        // Get total customer count (not filtered, just active customers)
        const totalCustomerCount = yield customer_model_1.default.countDocuments({ isDeleted: false });
        res.status(200).json({
            statusCode: 200,
            message: 'Invoices retrieved successfully',
            data: {
                invoices,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
                summary: summaryStats[0] || {
                    totalInvoiceCount: 0,
                    totalPaidCount: 0,
                    totalUnpaidCount: 0,
                    totalAmount: 0,
                    totalPaid: 0,
                    totalDue: 0,
                    totalProfit: 0
                },
                totalCustomerCount
            },
        });
    }
    catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getInvoices = getInvoices;
const getInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log('Fetching invoice by ID:', { invoiceId: id });
        const invoice = yield invoice_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!invoice) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice not found',
                error: 'Invoice not found'
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice retrieved successfully',
            data: { invoice }
        });
    }
    catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getInvoice = getInvoice;
const updateInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        let updateData = req.body;
        console.log('Updating invoice:', { invoiceId: id, updateData });
        if (updateData === null || updateData === void 0 ? void 0 : updateData.invoiceNumber) {
            delete updateData.invoiceNumber;
        }
        const invoice = yield invoice_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!invoice) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice not found',
                error: 'Invoice not found'
            });
            return;
        }
        // If customer is being updated, verify it exists
        if (((_a = updateData.customer) === null || _a === void 0 ? void 0 : _a.id) && updateData.customer.id !== invoice.customer.id.toString()) {
            const customer = yield customer_model_1.default.findOne({ _id: updateData.customer.id, isDeleted: false });
            if (!customer) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'Customer not found',
                    error: 'Customer not found'
                });
                return;
            }
        }
        // If items are being updated, verify products exist
        if (updateData.items && Array.isArray(updateData.items)) {
            const productIds = updateData.items.map((item) => item.product.id);
            const products = yield product_model_1.default.find({ _id: { $in: productIds }, isDeleted: false });
            if (products.length !== productIds.length) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'One or more products not found',
                    error: 'Product not found'
                });
                return;
            }
        }
        const updatedInvoice = yield invoice_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        console.log('Invoice updated successfully:', { invoiceId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice updated successfully',
            data: { invoice: updatedInvoice },
        });
    }
    catch (error) {
        console.error('Update invoice error:', error);
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
exports.updateInvoice = updateInvoice;
const deleteInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log('Deleting invoice:', { invoiceId: id });
        const invoice = yield invoice_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!invoice) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice not found',
                error: 'Invoice not found'
            });
            return;
        }
        // Soft delete the invoice (items are embedded so they get deleted with the invoice)
        yield invoice_model_1.default.findByIdAndUpdate(id, { isDeleted: true });
        console.log('Invoice deleted successfully:', { invoiceId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice deleted successfully',
            data: null,
        });
    }
    catch (error) {
        console.error('Delete invoice error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.deleteInvoice = deleteInvoice;
const updateInvoicePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { paidAmount } = req.body;
        console.log('Updating invoice payment:', { invoiceId: id, paidAmount });
        const invoice = yield invoice_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!invoice) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice not found',
                error: 'Invoice not found'
            });
            return;
        }
        // Validate paid amount
        if (paidAmount < 0 || paidAmount > invoice.summary.grandTotal) {
            res.status(400).json({
                statusCode: 400,
                message: 'Invalid paid amount',
                error: 'Paid amount must be between 0 and grand total amount'
            });
            return;
        }
        const updatedInvoice = yield invoice_model_1.default.findByIdAndUpdate(id, { paidAmount }, {
            new: true,
            runValidators: true,
        });
        console.log('Invoice payment updated successfully:', { invoiceId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Payment updated successfully',
            data: { invoice: updatedInvoice },
        });
    }
    catch (error) {
        console.error('Update invoice payment error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.updateInvoicePayment = updateInvoicePayment;
const getInvoiceStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { start_date, end_date } = req.query;
        console.log('Fetching invoice statistics:', { start_date, end_date });
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;
        const [generalStats, statusStats] = yield Promise.all([
            invoice_model_1.default.getInvoiceStats(startDate, endDate),
            invoice_model_1.default.getStatusStats()
        ]);
        res.status(200).json({
            statusCode: 200,
            message: 'Statistics retrieved successfully',
            data: {
                general: generalStats[0] || {
                    totalInvoices: 0,
                    totalAmount: 0,
                    totalPaid: 0,
                    totalDue: 0,
                    totalProfit: 0,
                    averageInvoiceAmount: 0
                },
                statusWise: statusStats
            },
        });
    }
    catch (error) {
        console.error('Get invoice statistics error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getInvoiceStatistics = getInvoiceStatistics;
// New method to update invoice status
const updateInvoiceStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log('Updating invoice status:', { invoiceId: id, status });
        const validStatuses = ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                statusCode: 400,
                message: 'Invalid status',
                error: 'Status must be one of: draft, pending, confirmed, in_progress, completed, cancelled'
            });
            return;
        }
        const invoice = yield invoice_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!invoice) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice not found',
                error: 'Invoice not found'
            });
            return;
        }
        const updatedInvoice = yield invoice_model_1.default.findByIdAndUpdate(id, { status }, {
            new: true,
            runValidators: true,
        });
        console.log('Invoice status updated successfully:', { invoiceId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice status updated successfully',
            data: { invoice: updatedInvoice },
        });
    }
    catch (error) {
        console.error('Update invoice status error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.updateInvoiceStatus = updateInvoiceStatus;
const getInvoiceCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fiscalYear } = req.query;
        console.log('Fetching invoice count for fiscal year:', { fiscalYear });
        // If no fiscal year provided, calculate current fiscal year
        // Fiscal year starts from April (month 3 in JS Date, which is 0-indexed)
        let targetFiscalYear;
        if (fiscalYear) {
            targetFiscalYear = Number(fiscalYear);
        }
        else {
            const today = new Date();
            // If current month is March (2) or earlier, fiscal year is previous calendar year
            // If current month is April (3) or later, fiscal year is current calendar year
            targetFiscalYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
        }
        // Fiscal year runs from April 1st to March 31st
        const fiscalYearStart = new Date(targetFiscalYear, 3, 1); // April 1st
        const fiscalYearEnd = new Date(targetFiscalYear + 1, 2, 31, 23, 59, 59, 999); // March 31st
        console.log('Date range for fiscal year:', {
            fiscalYear: targetFiscalYear,
            start: fiscalYearStart,
            end: fiscalYearEnd
        });
        // Build filter query for the fiscal year
        const filter = {
            isDeleted: false,
            issuedDate: {
                $gte: fiscalYearStart,
                $lte: fiscalYearEnd
            }
        };
        const count = yield invoice_model_1.default.countDocuments(filter);
        console.log('Invoice count retrieved successfully:', { count, fiscalYear: targetFiscalYear });
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice count retrieved successfully',
            data: {
                count,
                fiscalYear: targetFiscalYear,
                dateRange: {
                    start: fiscalYearStart.toISOString(),
                    end: fiscalYearEnd.toISOString()
                }
            },
        });
    }
    catch (error) {
        console.error('Get invoice count error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getInvoiceCount = getInvoiceCount;

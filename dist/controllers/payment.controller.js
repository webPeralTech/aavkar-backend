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
exports.getPaymentStats = exports.getPaymentsByInvoice = exports.deletePayment = exports.updatePayment = exports.getPayment = exports.getPayments = exports.createPayment = void 0;
const payment_model_1 = __importDefault(require("../models/payment.model"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - p_type
 *         - invoice_id
 *         - date_time
 *         - amount
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the payment record
 *         p_type:
 *           type: string
 *           enum: [cash, cheque, UPI]
 *           description: Payment method used by the customer
 *         invoice_id:
 *           type: string
 *           description: Linked invoice identifier
 *           maxLength: 100
 *         date_time:
 *           type: string
 *           format: date-time
 *           description: Date and time the payment was made
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           description: Amount paid by the customer
 *         formattedAmount:
 *           type: string
 *           description: Formatted amount with 2 decimal places
 *         paymentSummary:
 *           type: string
 *           description: Human-readable payment summary
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PaymentCreateRequest:
 *       type: object
 *       required:
 *         - p_type
 *         - invoice_id
 *         - date_time
 *         - amount
 *       properties:
 *         p_type:
 *           type: string
 *           enum: [cash, cheque, UPI]
 *         invoice_id:
 *           type: string
 *           maxLength: 100
 *         date_time:
 *           type: string
 *           format: date-time
 *         amount:
 *           type: number
 *           minimum: 0.01
 *     PaymentStats:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Payment type
 *         totalAmount:
 *           type: number
 *           description: Total amount for this payment type
 *         count:
 *           type: number
 *           description: Number of payments of this type
 *         averageAmount:
 *           type: number
 *           description: Average payment amount for this type
 */
/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment record
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentCreateRequest'
 *     responses:
 *       201:
 *         description: Payment created successfully
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
 *                   example: Payment created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 */
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentData = req.body;
        logger_1.default.info('Creating new payment:', { paymentData });
        // Validate required fields
        if (!paymentData.p_type || !paymentData.invoice_id || !paymentData.date_time || !paymentData.amount) {
            res.status(400).json({
                statusCode: 400,
                message: 'All fields (p_type, invoice_id, date_time, amount) are required',
                error: 'Validation failed',
            });
            return;
        }
        // Validate payment type
        if (!['cash', 'cheque', 'UPI'].includes(paymentData.p_type)) {
            res.status(400).json({
                statusCode: 400,
                message: 'Payment type must be one of: cash, cheque, UPI',
                error: 'Validation failed',
            });
            return;
        }
        // Validate amount
        const amount = Number(paymentData.amount);
        if (isNaN(amount) || amount <= 0) {
            res.status(400).json({
                statusCode: 400,
                message: 'Amount must be a positive number',
                error: 'Validation failed',
            });
            return;
        }
        // Validate date
        const paymentDate = new Date(paymentData.date_time);
        if (isNaN(paymentDate.getTime())) {
            res.status(400).json({
                statusCode: 400,
                message: 'Invalid date format',
                error: 'Validation failed',
            });
            return;
        }
        if (paymentDate > new Date()) {
            res.status(400).json({
                statusCode: 400,
                message: 'Payment date cannot be in the future',
                error: 'Validation failed',
            });
            return;
        }
        // Convert amount to number with proper precision
        paymentData.amount = amount;
        paymentData.date_time = paymentDate;
        const payment = new payment_model_1.default(paymentData);
        yield payment.save();
        logger_1.default.info('Payment created successfully:', { paymentId: payment._id });
        res.status(201).json({
            statusCode: 201,
            message: 'Payment created successfully',
            data: { payment },
        });
    }
    catch (error) {
        logger_1.default.error('Create payment error:', error);
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
                message: 'Server error during payment creation',
                error: 'Internal server error'
            });
        }
    }
});
exports.createPayment = createPayment;
/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments with pagination and filters
 *     tags: [Payments]
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
 *         name: p_type
 *         schema:
 *           type: string
 *           enum: [cash, cheque, UPI]
 *         description: Filter by payment type
 *       - in: query
 *         name: invoice_id
 *         schema:
 *           type: string
 *         description: Filter by invoice ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments until this date
 *       - in: query
 *         name: min_amount
 *         schema:
 *           type: number
 *         description: Filter payments with minimum amount
 *       - in: query
 *         name: max_amount
 *         schema:
 *           type: number
 *         description: Filter payments with maximum amount
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: date_time
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
 *         description: Payments retrieved successfully
 */
const getPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, p_type, invoice_id, start_date, end_date, min_amount, max_amount, sortBy = 'date_time', sortOrder = 'desc', } = req.query;
        logger_1.default.info('Fetching payments with filters:', { page, limit, p_type, invoice_id, start_date, end_date });
        // Build filter query
        const filter = { isDeleted: false };
        if (p_type)
            filter.p_type = p_type;
        if (invoice_id)
            filter.invoice_id = invoice_id;
        // Date range filter
        if (start_date || end_date) {
            filter.date_time = {};
            if (start_date)
                filter.date_time.$gte = new Date(start_date);
            if (end_date)
                filter.date_time.$lte = new Date(end_date);
        }
        // Amount range filter
        if (min_amount || max_amount) {
            filter.amount = {};
            if (min_amount)
                filter.amount.$gte = Number(min_amount);
            if (max_amount)
                filter.amount.$lte = Number(max_amount);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortObject = {};
        sortObject[sortBy] = sortDirection;
        const payments = yield payment_model_1.default.find(filter)
            .sort(sortObject)
            .skip(skip)
            .limit(Number(limit));
        const total = yield payment_model_1.default.countDocuments(filter);
        // Calculate summary statistics for the filtered results
        const summaryStats = yield payment_model_1.default.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' },
                    minAmount: { $min: '$amount' },
                    maxAmount: { $max: '$amount' }
                }
            }
        ]);
        res.status(200).json({
            statusCode: 200,
            message: 'Payments retrieved successfully',
            data: {
                payments,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
                summary: summaryStats[0] || {
                    totalAmount: 0,
                    averageAmount: 0,
                    minAmount: 0,
                    maxAmount: 0
                }
            },
        });
    }
    catch (error) {
        logger_1.default.error('Get payments error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getPayments = getPayments;
/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get a specific payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       404:
 *         description: Payment not found
 */
const getPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        logger_1.default.info('Fetching payment by ID:', { paymentId: id });
        const payment = yield payment_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!payment) {
            res.status(404).json({
                statusCode: 404,
                message: 'Payment not found',
                error: 'Payment not found'
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Payment retrieved successfully',
            data: { payment }
        });
    }
    catch (error) {
        logger_1.default.error('Get payment error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getPayment = getPayment;
/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     summary: Update a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentCreateRequest'
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *       404:
 *         description: Payment not found
 */
const updatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        logger_1.default.info('Updating payment:', { paymentId: id, updateData });
        const payment = yield payment_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!payment) {
            res.status(404).json({
                statusCode: 404,
                message: 'Payment not found',
                error: 'Payment not found'
            });
            return;
        }
        // Validate payment type if being updated
        if (updateData.p_type && !['cash', 'cheque', 'UPI'].includes(updateData.p_type)) {
            res.status(400).json({
                statusCode: 400,
                message: 'Payment type must be one of: cash, cheque, UPI',
                error: 'Validation failed',
            });
            return;
        }
        // Validate amount if being updated
        if (updateData.amount !== undefined) {
            const amount = Number(updateData.amount);
            if (isNaN(amount) || amount <= 0) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Amount must be a positive number',
                    error: 'Validation failed',
                });
                return;
            }
            updateData.amount = amount;
        }
        // Validate date if being updated
        if (updateData.date_time) {
            const paymentDate = new Date(updateData.date_time);
            if (isNaN(paymentDate.getTime())) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Invalid date format',
                    error: 'Validation failed',
                });
                return;
            }
            if (paymentDate > new Date()) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Payment date cannot be in the future',
                    error: 'Validation failed',
                });
                return;
            }
            updateData.date_time = paymentDate;
        }
        const updatedPayment = yield payment_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        logger_1.default.info('Payment updated successfully:', { paymentId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Payment updated successfully',
            data: { payment: updatedPayment },
        });
    }
    catch (error) {
        logger_1.default.error('Update payment error:', error);
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
exports.updatePayment = updatePayment;
/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     summary: Delete a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment deleted successfully
 *       404:
 *         description: Payment not found
 */
const deletePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        logger_1.default.info('Deleting payment:', { paymentId: id });
        const payment = yield payment_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!payment) {
            res.status(404).json({
                statusCode: 404,
                message: 'Payment not found',
                error: 'Payment not found'
            });
            return;
        }
        yield payment_model_1.default.findByIdAndUpdate(id, { isDeleted: true });
        logger_1.default.info('Payment deleted successfully:', { paymentId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Payment deleted successfully',
            data: null,
        });
    }
    catch (error) {
        logger_1.default.error('Delete payment error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.deletePayment = deletePayment;
/**
 * @swagger
 * /api/payments/invoice/{invoiceId}:
 *   get:
 *     summary: Get all payments for a specific invoice
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice payments retrieved successfully
 */
const getPaymentsByInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { invoiceId } = req.params;
        logger_1.default.info('Fetching payments for invoice:', { invoiceId });
        const payments = yield payment_model_1.default.find({ invoice_id: invoiceId, isDeleted: false })
            .sort({ date_time: -1 });
        // Get total payment amount for this invoice
        const totalStats = yield payment_model_1.default.getTotalPaymentsForInvoice(invoiceId);
        res.status(200).json({
            statusCode: 200,
            message: 'Invoice payments retrieved successfully',
            data: {
                payments,
                total: totalStats[0] || { totalAmount: 0, count: 0 }
            },
        });
    }
    catch (error) {
        logger_1.default.error('Get payments by invoice error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getPaymentsByInvoice = getPaymentsByInvoice;
/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Get payment statistics by type
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Statistics from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Statistics until this date
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
 */
const getPaymentStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { start_date, end_date } = req.query;
        logger_1.default.info('Fetching payment statistics:', { start_date, end_date });
        let startDate;
        let endDate;
        if (start_date) {
            startDate = new Date(start_date);
            if (isNaN(startDate.getTime())) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Invalid start_date format',
                    error: 'Validation failed',
                });
                return;
            }
        }
        if (end_date) {
            endDate = new Date(end_date);
            if (isNaN(endDate.getTime())) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Invalid end_date format',
                    error: 'Validation failed',
                });
                return;
            }
        }
        const stats = yield payment_model_1.default.getPaymentStatsByType(startDate, endDate);
        res.status(200).json({
            statusCode: 200,
            message: 'Payment statistics retrieved successfully',
            data: { stats },
        });
    }
    catch (error) {
        logger_1.default.error('Get payment stats error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getPaymentStats = getPaymentStats;

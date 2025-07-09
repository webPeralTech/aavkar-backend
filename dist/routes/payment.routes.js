"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const auth_1 = require("../middlewares/auth");
const validation_1 = require("../utils/validation");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment transaction management endpoints
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
// GET /api/payments - Get all payments with pagination and filters
router.get('/', (0, validation_1.validate)(validation_1.getPaymentsQuerySchema), payment_controller_1.getPayments);
// GET /api/payments/stats - Get payment statistics by type
router.get('/stats', (0, validation_1.validate)(validation_1.paymentStatsQuerySchema), payment_controller_1.getPaymentStats);
// GET /api/payments/invoice/:invoiceId - Get all payments for a specific invoice
router.get('/invoice/:invoiceId', (0, validation_1.validate)(validation_1.invoiceIdParamSchema), payment_controller_1.getPaymentsByInvoice);
// GET /api/payments/:id - Get specific payment by ID
router.get('/:id', (0, validation_1.validate)(validation_1.idParamSchema), payment_controller_1.getPayment);
// POST /api/payments - Create new payment
router.post('/', (0, validation_1.validate)(validation_1.createPaymentSchema), payment_controller_1.createPayment);
// PUT /api/payments/:id - Update payment
router.put('/:id', (0, validation_1.validate)(validation_1.updatePaymentWithIdSchema), payment_controller_1.updatePayment);
// DELETE /api/payments/:id - Delete payment
router.delete('/:id', (0, validation_1.validate)(validation_1.idParamSchema), payment_controller_1.deletePayment);
exports.default = router;

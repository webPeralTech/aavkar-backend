import express from 'express';
import {
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
  getPaymentsByInvoice,
  getPaymentStats,
} from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth';
import {
  createPaymentSchema,
  getPaymentsQuerySchema,
  updatePaymentWithIdSchema,
  paymentStatsQuerySchema,
  invoiceIdParamSchema,
  idParamSchema,
  validate
} from '../utils/validation';

const router = express.Router();

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
router.use(authenticate);

// GET /api/payments - Get all payments with pagination and filters
router.get('/', validate(getPaymentsQuerySchema), getPayments);

// GET /api/payments/stats - Get payment statistics by type
router.get('/stats', validate(paymentStatsQuerySchema), getPaymentStats);

// GET /api/payments/invoice/:invoiceId - Get all payments for a specific invoice
router.get('/invoice/:invoiceId', validate(invoiceIdParamSchema), getPaymentsByInvoice);

// GET /api/payments/:id - Get specific payment by ID
router.get('/:id', validate(idParamSchema), getPayment);

// POST /api/payments - Create new payment
router.post('/', validate(createPaymentSchema), createPayment);

// PUT /api/payments/:id - Update payment
router.put('/:id', validate(updatePaymentWithIdSchema), updatePayment);

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', validate(idParamSchema), deletePayment);

export default router; 
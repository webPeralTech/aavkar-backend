import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoicePayment,
  getInvoiceStatistics,
} from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     tags: [Invoices]
 *     summary: Create a new invoice
 *     description: Create a new invoice record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - invoiceDate
 *               - totalAmount
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID
 *               invoiceDate:
 *                 type: string
 *                 format: date
 *                 description: Invoice date
 *               totalAmount:
 *                 type: number
 *                 description: Total amount
 *               paidAmount:
 *                 type: number
 *                 description: Amount paid
 *               totalDiscount:
 *                 type: number
 *                 description: Total discount
 *               roundOff:
 *                 type: number
 *                 description: Round off amount
 *               baseCost:
 *                 type: number
 *                 description: Base cost
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Customer not found
 */
router.post('/', createInvoice);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: Get all invoices
 *     description: Retrieve all invoices with filtering and pagination
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Paid, Unpaid, Partially Paid]
 *         description: Filter by invoice status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter invoices from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter invoices until this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in invoice ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: invoiceDate
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
 *         description: Invoices retrieved successfully
 */
router.get('/', getInvoices);

/**
 * @swagger
 * /api/invoices/statistics:
 *   get:
 *     tags: [Invoices]
 *     summary: Get invoice statistics
 *     description: Retrieve invoice statistics and analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics', getInvoiceStatistics);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     tags: [Invoices]
 *     summary: Get invoice by ID
 *     description: Retrieve a specific invoice by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *       404:
 *         description: Invoice not found
 */
router.get('/:id', getInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     tags: [Invoices]
 *     summary: Update an invoice
 *     description: Update an existing invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *               invoiceDate:
 *                 type: string
 *                 format: date
 *               totalAmount:
 *                 type: number
 *               paidAmount:
 *                 type: number
 *               invoiceStatus:
 *                 type: string
 *                 enum: [Paid, Unpaid, Partially Paid]
 *               totalDiscount:
 *                 type: number
 *               roundOff:
 *                 type: number
 *               baseCost:
 *                 type: number
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 */
router.put('/:id', updateInvoice);

/**
 * @swagger
 * /api/invoices/{id}/payment:
 *   put:
 *     tags: [Invoices]
 *     summary: Update invoice payment
 *     description: Update the payment amount for an invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paidAmount
 *             properties:
 *               paidAmount:
 *                 type: number
 *                 description: Amount being paid
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *       404:
 *         description: Invoice not found
 */
router.put('/:id/payment', updateInvoicePayment);

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     tags: [Invoices]
 *     summary: Delete an invoice
 *     description: Soft delete an invoice (mark as deleted)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 */
router.delete('/:id', deleteInvoice);

export default router; 
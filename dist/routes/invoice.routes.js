"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * @swagger
 * /api/invoices:
 *   post:
 *     tags: [Invoices]
 *     summary: Create a new invoice
 *     description: Create a new invoice with embedded items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - items
 *               - acceptTerms
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *                 description: Invoice number (auto-generated if not provided)
 *               issuedDate:
 *                 type: string
 *                 format: date-time
 *                 description: Invoice issued date (defaults to now)
 *               customer:
 *                 type: object
 *                 required: [id, name, phone]
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Customer ID
 *                   name:
 *                     type: string
 *                     description: Customer name
 *                   phone:
 *                     type: string
 *                     description: Customer phone
 *               from:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product, quantity, rate, baseCost, deliveryDate]
 *                   properties:
 *                     product:
 *                       type: object
 *                       required: [id, name, price, baseCost]
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         price:
 *                           type: number
 *                         baseCost:
 *                           type: number
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high]
 *                       default: low
 *                     deliveryDate:
 *                       type: string
 *                       format: date-time
 *                     quantity:
 *                       type: number
 *                     rate:
 *                       type: number
 *                     baseCost:
 *                       type: number
 *                     discountType:
 *                       type: string
 *                       enum: [percentage, fixed]
 *                       default: percentage
 *                     discountValue:
 *                       type: number
 *                       default: 0
 *                     workInstruction:
 *                       type: string
 *                     printingInstructions:
 *                       type: string
 *               summary:
 *                 type: object
 *                 properties:
 *                   roundOffTotal:
 *                     type: boolean
 *                     default: false
 *               bottomNote:
 *                 type: string
 *               acceptTerms:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, pending, confirmed, in_progress, completed, cancelled]
 *                 default: draft
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Customer or product not found
 */
router.post('/', invoice_controller_1.createInvoice);
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
 *           enum: [draft, pending, confirmed, in_progress, completed, cancelled]
 *         description: Filter by invoice status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by item priority
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
router.get('/', invoice_controller_1.getInvoices);
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
router.get('/statistics', invoice_controller_1.getInvoiceStatistics);
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
router.get('/:id', invoice_controller_1.getInvoice);
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
router.put('/:id', invoice_controller_1.updateInvoice);
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
router.put('/:id/payment', invoice_controller_1.updateInvoicePayment);
/**
 * @swagger
 * /api/invoices/{id}/status:
 *   put:
 *     tags: [Invoices]
 *     summary: Update invoice status
 *     description: Update the status of an invoice
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, pending, confirmed, in_progress, completed, cancelled]
 *                 description: New status for the invoice
 *     responses:
 *       200:
 *         description: Invoice status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Invoice not found
 */
router.put('/:id/status', invoice_controller_1.updateInvoiceStatus);
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
router.delete('/:id', invoice_controller_1.deleteInvoice);
exports.default = router;

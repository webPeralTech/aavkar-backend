"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoiceItem_controller_1 = require("../controllers/invoiceItem.controller");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * @swagger
 * /api/invoice-items:
 *   post:
 *     tags: [Invoice Items]
 *     summary: Create a new invoice item
 *     description: Add a new item to an invoice
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *               - psId
 *               - psDescription
 *               - qty
 *               - rate
 *               - allocation
 *               - userAllocation
 *               - baseCost
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 description: Invoice ID
 *               psId:
 *                 type: string
 *                 description: Product/Service ID
 *               psDescription:
 *                 type: string
 *                 description: Product/Service description
 *               qty:
 *                 type: number
 *                 description: Quantity
 *               rate:
 *                 type: number
 *                 description: Rate per unit
 *               discount:
 *                 type: number
 *                 description: Discount amount
 *               steps:
 *                 type: string
 *                 enum: [Draft, Design, Printing, Pending, Completed]
 *                 description: Current step/status
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 description: Priority level
 *               allocation:
 *                 type: string
 *                 description: Allocation
 *               userAllocation:
 *                 type: string
 *                 description: User allocation
 *               estimatedDeliveryTime:
 *                 type: string
 *                 format: date-time
 *                 description: Estimated delivery time
 *               baseCost:
 *                 type: number
 *                 description: Base cost
 *               printingOperation:
 *                 type: string
 *                 description: Printing operation details
 *     responses:
 *       201:
 *         description: Invoice item created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Invoice or Product not found
 */
router.post('/', invoiceItem_controller_1.createInvoiceItem);
/**
 * @swagger
 * /api/invoice-items:
 *   get:
 *     tags: [Invoice Items]
 *     summary: Get all invoice items
 *     description: Retrieve all invoice items with filtering and pagination
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
 *         name: invoiceId
 *         schema:
 *           type: string
 *         description: Filter by invoice ID
 *       - in: query
 *         name: steps
 *         schema:
 *           type: string
 *           enum: [Draft, Design, Printing, Pending, Completed]
 *         description: Filter by status/step
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *         description: Filter by priority
 *       - in: query
 *         name: allocation
 *         schema:
 *           type: string
 *         description: Filter by allocation
 *       - in: query
 *         name: userAllocation
 *         schema:
 *           type: string
 *         description: Filter by user allocation
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in description, allocation, etc.
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
 *         description: Invoice items retrieved successfully
 */
router.get('/', invoiceItem_controller_1.getInvoiceItems);
/**
 * @swagger
 * /api/invoice-items/statistics:
 *   get:
 *     tags: [Invoice Items]
 *     summary: Get invoice item statistics
 *     description: Retrieve statistics for invoice items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: invoiceId
 *         schema:
 *           type: string
 *         description: Get statistics for specific invoice (optional)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics', invoiceItem_controller_1.getInvoiceItemStatistics);
/**
 * @swagger
 * /api/invoice-items/priority/{priority}:
 *   get:
 *     tags: [Invoice Items]
 *     summary: Get items by priority
 *     description: Retrieve invoice items filtered by priority level
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: priority
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *         description: Priority level
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *       400:
 *         description: Invalid priority value
 */
router.get('/priority/:priority', invoiceItem_controller_1.getItemsByPriority);
/**
 * @swagger
 * /api/invoice-items/{id}:
 *   get:
 *     tags: [Invoice Items]
 *     summary: Get invoice item by ID
 *     description: Retrieve a specific invoice item by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice item ID
 *     responses:
 *       200:
 *         description: Invoice item retrieved successfully
 *       404:
 *         description: Invoice item not found
 */
router.get('/:id', invoiceItem_controller_1.getInvoiceItem);
/**
 * @swagger
 * /api/invoice-items/{id}:
 *   put:
 *     tags: [Invoice Items]
 *     summary: Update an invoice item
 *     description: Update an existing invoice item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               psId:
 *                 type: string
 *               psDescription:
 *                 type: string
 *               qty:
 *                 type: number
 *               rate:
 *                 type: number
 *               discount:
 *                 type: number
 *               steps:
 *                 type: string
 *                 enum: [Draft, Design, Printing, Pending, Completed]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *               allocation:
 *                 type: string
 *               userAllocation:
 *                 type: string
 *               estimatedDeliveryTime:
 *                 type: string
 *                 format: date-time
 *               baseCost:
 *                 type: number
 *               printingOperation:
 *                 type: string
 *               printingReport:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice item updated successfully
 *       404:
 *         description: Invoice item not found
 */
router.put('/:id', invoiceItem_controller_1.updateInvoiceItem);
/**
 * @swagger
 * /api/invoice-items/{id}/status:
 *   put:
 *     tags: [Invoice Items]
 *     summary: Update item status
 *     description: Update the status/step of an invoice item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - steps
 *             properties:
 *               steps:
 *                 type: string
 *                 enum: [Draft, Design, Printing, Pending, Completed]
 *                 description: New status/step
 *               printingReport:
 *                 type: string
 *                 description: Printing report (optional)
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Invoice item not found
 */
router.put('/:id/status', invoiceItem_controller_1.updateItemStatus);
/**
 * @swagger
 * /api/invoice-items/{id}:
 *   delete:
 *     tags: [Invoice Items]
 *     summary: Delete an invoice item
 *     description: Soft delete an invoice item (mark as deleted)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice item ID
 *     responses:
 *       200:
 *         description: Invoice item deleted successfully
 *       404:
 *         description: Invoice item not found
 */
router.delete('/:id', invoiceItem_controller_1.deleteInvoiceItem);
exports.default = router;

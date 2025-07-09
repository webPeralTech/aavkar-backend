import { Request, Response } from 'express';
import paymentModel, { IPayment } from '../models/payment.model';
import logger from '../utils/logger';

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
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentData = req.body;
    
    logger.info('Creating new payment:', { paymentData });

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

    const payment: IPayment = new paymentModel(paymentData);
    await payment.save();

    logger.info('Payment created successfully:', { paymentId: payment._id });

    res.status(201).json({
      statusCode: 201,
      message: 'Payment created successfully',
      data: { payment },
    });
  } catch (error: any) {
    logger.error('Create payment error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        statusCode: 400,
        message: 'Validation failed',
        error: 'Validation failed', 
        details: errors 
      });
    } else {
      res.status(500).json({ 
        statusCode: 500,
        message: 'Server error during payment creation',
        error: 'Internal server error' 
      });
    }
  }
};

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
export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      p_type,
      invoice_id,
      start_date,
      end_date,
      min_amount,
      max_amount,
      sortBy = 'date_time',
      sortOrder = 'desc',
    } = req.query;

    logger.info('Fetching payments with filters:', { page, limit, p_type, invoice_id, start_date, end_date });

    // Build filter query
    const filter: any = {};

    if (p_type) filter.p_type = p_type;
    if (invoice_id) filter.invoice_id = invoice_id;

    // Date range filter
    if (start_date || end_date) {
      filter.date_time = {};
      if (start_date) filter.date_time.$gte = new Date(start_date as string);
      if (end_date) filter.date_time.$lte = new Date(end_date as string);
    }

    // Amount range filter
    if (min_amount || max_amount) {
      filter.amount = {};
      if (min_amount) filter.amount.$gte = Number(min_amount);
      if (max_amount) filter.amount.$lte = Number(max_amount);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObject: any = {};
    sortObject[sortBy as string] = sortDirection;

    const payments = await paymentModel.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    const total = await paymentModel.countDocuments(filter);

    // Calculate summary statistics for the filtered results
    const summaryStats = await paymentModel.aggregate([
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
  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error' 
    });
  }
};

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
export const getPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info('Fetching payment by ID:', { paymentId: id });

    const payment = await paymentModel.findById(id);
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
  } catch (error) {
    logger.error('Get payment error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error' 
    });
  }
};

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
export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    logger.info('Updating payment:', { paymentId: id, updateData });

    const payment = await paymentModel.findById(id);

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

    const updatedPayment = await paymentModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    logger.info('Payment updated successfully:', { paymentId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Payment updated successfully',
      data: { payment: updatedPayment },
    });
  } catch (error: any) {
    logger.error('Update payment error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        statusCode: 400,
        message: 'Validation failed',
        error: 'Validation failed', 
        details: errors 
      });
    } else {
      res.status(500).json({ 
        statusCode: 500,
        message: 'Server error',
        error: 'Internal server error' 
      });
    }
  }
};

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
export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info('Deleting payment:', { paymentId: id });

    const payment = await paymentModel.findById(id);

    if (!payment) {
      res.status(404).json({ 
        statusCode: 404,
        message: 'Payment not found',
        error: 'Payment not found' 
      });
      return;
    }

    await paymentModel.findByIdAndDelete(id);

    logger.info('Payment deleted successfully:', { paymentId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Payment deleted successfully',
      data: null,
    });
  } catch (error) {
    logger.error('Delete payment error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error' 
    });
  }
};

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
export const getPaymentsByInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;

    logger.info('Fetching payments for invoice:', { invoiceId });

    const payments = await paymentModel.find({ invoice_id: invoiceId })
      .sort({ date_time: -1 });

    // Get total payment amount for this invoice
    const totalStats = await paymentModel.getTotalPaymentsForInvoice(invoiceId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Invoice payments retrieved successfully',
      data: {
        payments,
        total: totalStats[0] || { totalAmount: 0, count: 0 }
      },
    });
  } catch (error) {
    logger.error('Get payments by invoice error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error' 
    });
  }
};

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
export const getPaymentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start_date, end_date } = req.query;

    logger.info('Fetching payment statistics:', { start_date, end_date });

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (start_date) {
      startDate = new Date(start_date as string);
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
      endDate = new Date(end_date as string);
      if (isNaN(endDate.getTime())) {
        res.status(400).json({
          statusCode: 400,
          message: 'Invalid end_date format',
          error: 'Validation failed',
        });
        return;
      }
    }

    const stats = await paymentModel.getPaymentStatsByType(startDate, endDate);

    res.status(200).json({
      statusCode: 200,
      message: 'Payment statistics retrieved successfully',
      data: { stats },
    });
  } catch (error) {
    logger.error('Get payment stats error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error' 
    });
  }
}; 
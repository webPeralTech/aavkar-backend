import { Request, Response } from 'express';
import invoiceModel, { IInvoice } from '../models/invoice.model';
import invoiceItemModel from '../models/invoiceItem.model';
import customerModel from '../models/customer.model';

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceData = req.body;

    console.log('Creating new invoice:', { invoiceData });

    // Verify customer exists and is not deleted
    const customer = await customerModel.findOne({ _id: invoiceData.customerId, isDeleted: false });
    if (!customer) {
      res.status(404).json({
        statusCode: 404,
        message: 'Customer not found',
        error: 'Customer not found'
      });
      return;
    }

    // Generate unique invoice ID if not provided
    if (!invoiceData.invoiceId) {
      invoiceData.invoiceId = await invoiceModel.generateInvoiceId();
    }

    // Create invoice
    const invoice: IInvoice = new invoiceModel(invoiceData);
    await invoice.save();

    // Populate customer data
    await invoice.populate('customerId', 'name email company');

    console.log('Invoice created successfully:', { invoiceId: invoice._id });

    res.status(201).json({
      statusCode: 201,
      message: 'Invoice created successfully',
      data: { invoice },
    });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        error: 'Validation failed',
        details: errors
      });
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        statusCode: 400,
        message: `Invoice with this ${field} already exists`,
        error: 'Duplicate entry'
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: 'Server error during invoice creation',
        error: 'Server error during invoice creation'
      });
    }
  }
};

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      start_date,
      end_date,
      search,
      sortBy = 'invoiceDate',
      sortOrder = 'desc',
    } = req.query;

    console.log('Fetching invoices with filters:', { page, limit, status, customerId, start_date, end_date, search });

    // Build filter query
    const filter: any = { isDeleted: false };

    if (status) filter.invoiceStatus = status;
    if (customerId) filter.customerId = customerId;

    // Date range filter
    if (start_date || end_date) {
      filter.invoiceDate = {};
      if (start_date) filter.invoiceDate.$gte = new Date(start_date as string);
      if (end_date) filter.invoiceDate.$lte = new Date(end_date as string);
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { invoiceId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObject: any = {};
    sortObject[sortBy as string] = sortDirection;

    const invoices = await invoiceModel.find(filter)
      .populate('customerId', 'name email company')
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    const total = await invoiceModel.countDocuments(filter);

    // Calculate summary statistics for filtered results
    const summaryStats = await invoiceModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          totalProfit: { $sum: '$profitCalculated' }
        }
      }
    ]);

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
          totalAmount: 0,
          totalPaid: 0,
          totalDue: 0,
          totalProfit: 0
        }
      },
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('Fetching invoice by ID:', { invoiceId: id });

    const invoice = await invoiceModel.findOne({ _id: id, isDeleted: false })
      .populate('customerId', 'name email company phone address city state');

    if (!invoice) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice not found',
        error: 'Invoice not found'
      });
      return;
    }

    // Get invoice items
    const invoiceItems = await invoiceItemModel.find({ invoiceId: id, isDeleted: false })
      .populate('psId', 'ps_name ps_type ps_unit');

    res.status(200).json({
      statusCode: 200,
      message: 'Invoice retrieved successfully',
      data: { 
        invoice,
        items: invoiceItems
      }
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Updating invoice:', { invoiceId: id, updateData });

    const invoice = await invoiceModel.findOne({ _id: id, isDeleted: false });

    if (!invoice) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice not found',
        error: 'Invoice not found'
      });
      return;
    }

    // If customerId is being updated, verify it exists
    if (updateData.customerId && updateData.customerId !== invoice.customerId.toString()) {
      const customer = await customerModel.findOne({ _id: updateData.customerId, isDeleted: false });
      if (!customer) {
        res.status(404).json({
          statusCode: 404,
          message: 'Customer not found',
          error: 'Customer not found'
        });
        return;
      }
    }

    const updatedInvoice = await invoiceModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('customerId', 'name email company');

    console.log('Invoice updated successfully:', { invoiceId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Invoice updated successfully',
      data: { invoice: updatedInvoice },
    });
  } catch (error: any) {
    console.error('Update invoice error:', error);

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

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('Deleting invoice:', { invoiceId: id });

    const invoice = await invoiceModel.findOne({ _id: id, isDeleted: false });

    if (!invoice) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice not found',
        error: 'Invoice not found'
      });
      return;
    }

    // Soft delete the invoice
    await invoiceModel.findByIdAndUpdate(id, { isDeleted: true });

    // Also soft delete all related invoice items
    await invoiceItemModel.updateMany(
      { invoiceId: id },
      { isDeleted: true }
    );

    console.log('Invoice deleted successfully:', { invoiceId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Invoice deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const updateInvoicePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paidAmount } = req.body;

    console.log('Updating invoice payment:', { invoiceId: id, paidAmount });

    const invoice = await invoiceModel.findOne({ _id: id, isDeleted: false });

    if (!invoice) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice not found',
        error: 'Invoice not found'
      });
      return;
    }

    // Validate paid amount
    if (paidAmount < 0 || paidAmount > invoice.totalAmount) {
      res.status(400).json({
        statusCode: 400,
        message: 'Invalid paid amount',
        error: 'Paid amount must be between 0 and total amount'
      });
      return;
    }

    const updatedInvoice = await invoiceModel.findByIdAndUpdate(id, { paidAmount }, {
      new: true,
      runValidators: true,
    }).populate('customerId', 'name email company');

    console.log('Invoice payment updated successfully:', { invoiceId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Payment updated successfully',
      data: { invoice: updatedInvoice },
    });
  } catch (error) {
    console.error('Update invoice payment error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getInvoiceStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start_date, end_date } = req.query;

    console.log('Fetching invoice statistics:', { start_date, end_date });

    const startDate = start_date ? new Date(start_date as string) : undefined;
    const endDate = end_date ? new Date(end_date as string) : undefined;

    const [generalStats, statusStats] = await Promise.all([
      invoiceModel.getInvoiceStats(startDate, endDate),
      invoiceModel.getStatusStats()
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
  } catch (error) {
    console.error('Get invoice statistics error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
}; 
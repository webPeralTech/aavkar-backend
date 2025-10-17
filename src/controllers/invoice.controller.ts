import { Request, Response } from 'express';
import invoiceModel, { IInvoice } from '../models/invoice.model';
import customerModel from '../models/customer.model';
import productModel from '../models/product.model';

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceData = req.body;

    console.log('Creating new invoice:', { invoiceData });

    // Verify customer exists and is not deleted
    const customer = await customerModel.findOne({ _id: invoiceData.customer.id, isDeleted: false });

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
    const productIds = invoiceData.items.map((item: any) => item.product.id);
    const products = await productModel.find({ _id: { $in: productIds }, isDeleted: false });
    
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
      const existingInvoice = await invoiceModel.findOne({ 
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
    } else {
      // Generate unique invoice number if not provided
      invoiceData.invoiceNumber = await invoiceModel.generateInvoiceNumber();
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
    const invoice: IInvoice = new invoiceModel(invoiceData);
    await invoice.save();

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
        error: 'Duplicate entry',
        details: `The ${field} must be unique across all invoices`
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
      priority,
      sortBy = 'issuedDate',
      sortOrder = 'desc',
    } = req.query;

    console.log('Fetching invoices with filters:', { page, limit, status, customerId, start_date, end_date, search, priority });

    // Build filter query
    const filter: any = { isDeleted: false };

    if (status) filter.status = status;
    if (customerId) filter['customer.id'] = customerId;
    if (priority) filter['items.priority'] = priority;

    // Date range filter
    if (start_date || end_date) {
      filter.issuedDate = {};
      if (start_date) filter.issuedDate.$gte = new Date(start_date as string);
      if (end_date) filter.issuedDate.$lte = new Date(end_date as string);
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
    const sortObject: any = {};
    sortObject[sortBy as string] = sortDirection;

    const invoices = await invoiceModel.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    const total = await invoiceModel.countDocuments(filter);

    // Calculate summary statistics for filtered results
    const summaryStats = await invoiceModel.aggregate([
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
    const totalCustomerCount = await customerModel.countDocuments({ isDeleted: false });

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

    const invoice = await invoiceModel.findOne({ _id: id, isDeleted: false });

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
    let updateData = req.body;

    console.log('Updating invoice:', { invoiceId: id, updateData });

    if(updateData?.invoiceNumber){
      delete updateData.invoiceNumber;
    }

    const invoice = await invoiceModel.findOne({ _id: id, isDeleted: false });

    if (!invoice) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice not found',
        error: 'Invoice not found'
      });
      return;
    }

    // If customer is being updated, verify it exists
    if (updateData.customer?.id && updateData.customer.id !== invoice.customer.id.toString()) {
      const customer = await customerModel.findOne({ _id: updateData.customer.id, isDeleted: false });
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
      const productIds = updateData.items.map((item: any) => item.product.id);
      const products = await productModel.find({ _id: { $in: productIds }, isDeleted: false });
      
      if (products.length !== productIds.length) {
        res.status(404).json({
          statusCode: 404,
          message: 'One or more products not found',
          error: 'Product not found'
        });
        return;
      }
    }

    const updatedInvoice = await invoiceModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

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

    // Soft delete the invoice (items are embedded so they get deleted with the invoice)
    await invoiceModel.findByIdAndUpdate(id, { isDeleted: true });

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
    if (paidAmount < 0 || paidAmount > invoice.summary.grandTotal) {
      res.status(400).json({
        statusCode: 400,
        message: 'Invalid paid amount',
        error: 'Paid amount must be between 0 and grand total amount'
      });
      return;
    }

    const updatedInvoice = await invoiceModel.findByIdAndUpdate(id, { paidAmount }, {
      new: true,
      runValidators: true,
    });

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

// New method to update invoice status
export const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
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

    const invoice = await invoiceModel.findOne({ _id: id, isDeleted: false });

    if (!invoice) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice not found',
        error: 'Invoice not found'
      });
      return;
    }

    const updatedInvoice = await invoiceModel.findByIdAndUpdate(id, { status }, {
      new: true,
      runValidators: true,
    });

    console.log('Invoice status updated successfully:', { invoiceId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Invoice status updated successfully',
      data: { invoice: updatedInvoice },
    });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getInvoiceCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fiscalYear } = req.query;

    console.log('Fetching invoice count for fiscal year:', { fiscalYear });

    // If no fiscal year provided, calculate current fiscal year
    // Fiscal year starts from April (month 3 in JS Date, which is 0-indexed)
    let targetFiscalYear: number;
    if (fiscalYear) {
      targetFiscalYear = Number(fiscalYear);
    } else {
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
    const filter: any = { 
      isDeleted: false,
      issuedDate: {
        $gte: fiscalYearStart,
        $lte: fiscalYearEnd
      }
    };

    const count = await invoiceModel.countDocuments(filter);

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
  } catch (error) {
    console.error('Get invoice count error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
}; 
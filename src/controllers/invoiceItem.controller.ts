import { Request, Response } from 'express';
import invoiceItemModel, { IInvoiceItem } from '../models/invoiceItem.model';
import invoiceModel from '../models/invoice.model';
import productModel from '../models/product.model';

export const createInvoiceItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const itemData = req.body;

    console.log('Creating new invoice item:', { itemData });

    // Verify invoice exists and is not deleted
    const invoice = await invoiceModel.findOne({ _id: itemData.invoiceId, isDeleted: false });
    if (!invoice) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice not found',
        error: 'Invoice not found'
      });
      return;
    }

    // Verify product/service exists and is not deleted
    const product = await productModel.findOne({ _id: itemData.psId, isDeleted: false });
    if (!product) {
      res.status(404).json({
        statusCode: 404,
        message: 'Product/Service not found',
        error: 'Product/Service not found'
      });
      return;
    }

    // Create invoice item
    const invoiceItem: IInvoiceItem = new invoiceItemModel(itemData);
    await invoiceItem.save();

    // Populate related data
    await invoiceItem.populate([
      { path: 'invoiceId', select: 'invoiceId customerId invoiceDate' },
      { path: 'psId', select: 'ps_name ps_type ps_unit' }
    ]);

    console.log('Invoice item created successfully:', { itemId: invoiceItem._id });

    res.status(201).json({
      statusCode: 201,
      message: 'Invoice item created successfully',
      data: { invoiceItem },
    });
  } catch (error: any) {
    console.error('Create invoice item error:', error);
    
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
        message: 'Server error during invoice item creation',
        error: 'Server error during invoice item creation'
      });
    }
  }
};

export const getInvoiceItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      invoiceId,
      steps,
      priority,
      allocation,
      userAllocation,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    console.log('Fetching invoice items with filters:', { page, limit, invoiceId, steps, priority, allocation });

    // Build filter query
    const filter: any = { isDeleted: false };

    if (invoiceId) filter.invoiceId = invoiceId;
    if (steps) filter.steps = steps;
    if (priority) filter.priority = priority;
    if (allocation) filter.allocation = allocation;
    if (userAllocation) filter.userAllocation = userAllocation;

    // Search functionality
    if (search) {
      filter.$or = [
        { psDescription: { $regex: search, $options: 'i' } },
        { allocation: { $regex: search, $options: 'i' } },
        { userAllocation: { $regex: search, $options: 'i' } },
        { printingOperation: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObject: any = {};
    sortObject[sortBy as string] = sortDirection;

    const invoiceItems = await invoiceItemModel.find(filter)
      .populate('invoiceId', 'invoiceId customerId invoiceDate invoiceStatus')
      .populate('psId', 'ps_name ps_type ps_unit')
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    const total = await invoiceItemModel.countDocuments(filter);

    // Calculate summary statistics for filtered results
    const summaryStats = await invoiceItemModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$qty' },
          totalAmount: { $sum: '$total' },
          totalDiscount: { $sum: '$discount' }
        }
      }
    ]);

    res.status(200).json({
      statusCode: 200,
      message: 'Invoice items retrieved successfully',
      data: {
        invoiceItems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        summary: summaryStats[0] || {
          totalItems: 0,
          totalQuantity: 0,
          totalAmount: 0,
          totalDiscount: 0
        }
      },
    });
  } catch (error) {
    console.error('Get invoice items error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getInvoiceItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('Fetching invoice item by ID:', { itemId: id });

    const invoiceItem = await invoiceItemModel.findOne({ _id: id, isDeleted: false })
      .populate('invoiceId', 'invoiceId customerId invoiceDate invoiceStatus')
      .populate('psId', 'ps_name ps_type ps_unit ps_tax');

    if (!invoiceItem) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice item not found',
        error: 'Invoice item not found'
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Invoice item retrieved successfully',
      data: { invoiceItem }
    });
  } catch (error) {
    console.error('Get invoice item error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const updateInvoiceItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Updating invoice item:', { itemId: id, updateData });

    const invoiceItem = await invoiceItemModel.findOne({ _id: id, isDeleted: false });

    if (!invoiceItem) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice item not found',
        error: 'Invoice item not found'
      });
      return;
    }

    // If psId is being updated, verify it exists
    if (updateData.psId && updateData.psId !== invoiceItem.psId.toString()) {
      const product = await productModel.findOne({ _id: updateData.psId, isDeleted: false });
      if (!product) {
        res.status(404).json({
          statusCode: 404,
          message: 'Product/Service not found',
          error: 'Product/Service not found'
        });
        return;
      }
    }

    const updatedInvoiceItem = await invoiceItemModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'invoiceId', select: 'invoiceId customerId invoiceDate' },
      { path: 'psId', select: 'ps_name ps_type ps_unit' }
    ]);

    console.log('Invoice item updated successfully:', { itemId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Invoice item updated successfully',
      data: { invoiceItem: updatedInvoiceItem },
    });
  } catch (error: any) {
    console.error('Update invoice item error:', error);

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

export const deleteInvoiceItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('Deleting invoice item:', { itemId: id });

    const invoiceItem = await invoiceItemModel.findOne({ _id: id, isDeleted: false });

    if (!invoiceItem) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice item not found',
        error: 'Invoice item not found'
      });
      return;
    }

    // Soft delete the invoice item
    await invoiceItemModel.findByIdAndUpdate(id, { isDeleted: true });

    console.log('Invoice item deleted successfully:', { itemId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Invoice item deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Delete invoice item error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const updateItemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { steps, printingReport } = req.body;

    console.log('Updating invoice item status:', { itemId: id, steps, printingReport });

    const invoiceItem = await invoiceItemModel.findOne({ _id: id, isDeleted: false });

    if (!invoiceItem) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice item not found',
        error: 'Invoice item not found'
      });
      return;
    }

    const updateData: any = { steps };
    if (printingReport) updateData.printingReport = printingReport;

    const updatedInvoiceItem = await invoiceItemModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'invoiceId', select: 'invoiceId customerId invoiceDate' },
      { path: 'psId', select: 'ps_name ps_type ps_unit' }
    ]);

    console.log('Invoice item status updated successfully:', { itemId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Item status updated successfully',
      data: { invoiceItem: updatedInvoiceItem },
    });
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getItemsByPriority = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priority } = req.params;

    console.log('Fetching items by priority:', { priority });

    if (!['Low', 'Medium', 'High'].includes(priority)) {
      res.status(400).json({
        statusCode: 400,
        message: 'Invalid priority value',
        error: 'Priority must be Low, Medium, or High'
      });
      return;
    }

    const items = await invoiceItemModel.getItemsByPriority(priority);

    res.status(200).json({
      statusCode: 200,
      message: `${priority} priority items retrieved successfully`,
      data: { items }
    });
  } catch (error) {
    console.error('Get items by priority error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getInvoiceItemStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.query;

    console.log('Fetching invoice item statistics:', { invoiceId });

    if (invoiceId) {
      // Get statistics for a specific invoice
      const stats = await invoiceItemModel.getItemStatsByInvoice(invoiceId as string);
      
      res.status(200).json({
        statusCode: 200,
        message: 'Invoice item statistics retrieved successfully',
        data: {
          invoiceStats: stats[0] || {
            totalItems: 0,
            totalQuantity: 0,
            totalAmount: 0,
            totalDiscount: 0,
            totalBaseCost: 0
          }
        }
      });
    } else {
      // Get general status-wise statistics
      const statusStats = await invoiceItemModel.getStatusWiseStats();
      
      res.status(200).json({
        statusCode: 200,
        message: 'Invoice item statistics retrieved successfully',
        data: {
          statusWise: statusStats
        }
      });
    }
  } catch (error) {
    console.error('Get invoice item statistics error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
}; 
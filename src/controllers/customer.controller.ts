import { Request, Response } from 'express';
import customerModel, { ICustomer } from '../models/customer.model';

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerData = req.body;

    // Set assignedTo to current user if not provided and user is sales/support
    // if (!customerData.assignedTo && ['sales', 'support'].includes(req.user.role)) {
    //   customerData.assignedTo = req.user._id;
    // }

    const customer: ICustomer = new customerModel(customerData);
    await customer.save();

    // Populate the assignedTo field
    // await customer.populate('assignedTo', 'firstName lastName email');

    res.status(201).json({
      statusCode: 201,
      message: 'Customer created successfully',
      data: { customer },
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        statusCode: 400,
        message: 'Validation failed',
        error: 'Validation failed', 
        details: errors 
      });
    } else if (error.code === 11000) {
      res.status(400).json({ 
        statusCode: 400,
        message: 'Customer with this email already exists',
        error: 'Customer with this email already exists' 
      });
    } else {
      console.error('Create customer error:', error);
      res.status(500).json({ 
        statusCode: 500,
        message: 'Server error during customer creation',
        error: 'Server error during customer creation' 
      });
    }
  }
};

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      // status,
      // source,
      // assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter query
    const filter: any = {};

    // if (status) filter.status = status;
    // if (source) filter.source = source;
    // if (assignedTo) filter.assignedTo = assignedTo;

    // // If user is not admin/manager, only show their assigned customers
    // if (!['admin', 'manager'].includes(req.user.role)) {
    //   filter.assignedTo = req.user._id;
    // }

    // Add search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObject: any = {};
    sortObject[sortBy as string] = sortDirection;

    const customers = await customerModel.find(filter)
      // .populate('assignedTo', 'firstName lastName email')
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    const total = await customerModel.countDocuments(filter);

    res.status(200).json({
      statusCode: 200,
      message: 'Customers retrieved successfully',
      data: {
        customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Server error' 
    });
  }
};

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await customerModel.findById(id)
    if (!customer) {
      res.status(404).json({ 
        statusCode: 404,
        message: 'Customer not found',
        error: 'Customer not found' 
      });
      return;
    }

    // Check if user has permission to view this customer
    // if (
    //   !['admin', 'manager'].includes(req.user.role) &&
    //   customer.assignedTo?.toString() !== req.user._id.toString()
    // ) {
    //   res.status(403).json({ 
    //     statusCode: 403,
    //     message: 'Access denied',
    //     error: 'Access denied' 
    //   });
    //   return;
    // }

    res.status(200).json({ 
      statusCode: 200,
      message: 'Customer retrieved successfully',
      data: { customer } 
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Server error' 
    });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await customerModel.findById(id);

    if (!customer) {
      res.status(404).json({ 
        statusCode: 404,
        message: 'Customer not found',
        error: 'Customer not found' 
      });
      return;
    }

    // // Check if user has permission to update this customer
    // if (
    //   !['admin', 'manager'].includes(req.user.role) &&
    //   customer.assignedTo?.toString() !== req.user._id.toString()
    // ) {
    //   res.status(403).json({ 
    //     statusCode: 403,
    //     message: 'Access denied',
    //     error: 'Access denied' 
    //   });
    //   return;
    // }

    const updatedCustomer = await customerModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
    // .populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      statusCode: 200,
      message: 'Customer updated successfully',
      data: { customer: updatedCustomer },
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        statusCode: 400,
        message: 'Validation failed',
        error: 'Validation failed', 
        details: errors 
      });
    } else {
      console.error('Update customer error:', error);
      res.status(500).json({ 
        statusCode: 500,
        message: 'Server error',
        error: 'Server error' 
      });
    }
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await customerModel.findById(id);

    if (!customer) {
      res.status(404).json({ 
        statusCode: 404,
        message: 'Customer not found',
        error: 'Customer not found' 
      });
      return;
    }

    // // Only admin and manager can delete customers
    // if (!['admin', 'manager'].includes(req.user.role)) {
    //   res.status(403).json({ 
    //     statusCode: 403,
    //     message: 'Access denied',
    //     error: 'Access denied' 
    //   });
    //   return;
    // }

    await customerModel.findByIdAndDelete(id);

    res.status(200).json({ 
      statusCode: 200,
      message: 'Customer deleted successfully',
      data: null 
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Server error' 
    });
  }
};

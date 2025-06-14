import { Request, Response } from 'express';
import productModel, { IProduct } from '../models/product.model';
import { deleteUploadedFile } from '../utils/fileUtils';

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = req.body;

    const product: IProduct = new productModel(productData);
    await product.save();

    res.status(201).json({
      statusCode: 201,
      message: 'Product created successfully',
      data: { product },
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
        message: 'Product with this name already exists',
        error: 'Product with this name already exists' 
      });
    } else {
      console.error('Create product error:', error);
      res.status(500).json({ 
        statusCode: 500,
        message: 'Server error during product creation',
        error: 'Server error during product creation' 
      });
    }
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter query
    const filter: any = {};

    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { unit: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObject: any = {};
    sortObject[sortBy as string] = sortDirection;

    const products = await productModel.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    const total = await productModel.countDocuments(filter);

    res.status(200).json({
      statusCode: 200,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Server error' 
    });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);
    if (!product) {
      res.status(404).json({ 
        statusCode: 404,
        message: 'Product not found',
        error: 'Product not found' 
      });
      return;
    }

    res.status(200).json({ 
      statusCode: 200,
      message: 'Product retrieved successfully',
      data: { product } 
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Server error' 
    });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await productModel.findById(id);

    if (!product) {
      res.status(404).json({ 
        statusCode: 404,
        message: 'Product not found',
        error: 'Product not found' 
      });
      return;
    }

    // If a new photo is uploaded, delete the old one
    if (updateData.photoUrl && product.photoUrl && updateData.photoUrl !== product.photoUrl) {
      deleteUploadedFile(product.photoUrl);
    }

    const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      statusCode: 200,
      message: 'Product updated successfully',
      data: { product: updatedProduct },
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
      console.error('Update product error:', error);
      res.status(500).json({ 
        statusCode: 500,
        message: 'Server error',
        error: 'Server error' 
      });
    }
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);

    if (!product) {
      res.status(404).json({ 
        statusCode: 404,
        message: 'Product not found',
        error: 'Product not found' 
      });
      return;
    }

    // Soft delete by setting isActive to false
    const updatedProduct = await productModel.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    );

    res.status(200).json({ 
      statusCode: 200,
      message: 'Product deleted successfully',
      data: { product: updatedProduct } 
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Server error' 
    });
  }
}; 
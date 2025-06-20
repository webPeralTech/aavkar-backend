import { Request, Response } from 'express';
import { Company } from '../models/company.model';
import { deleteUploadedFile } from '../utils/fileUtils';

// Create or Update company (unified function)
export const createOrUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if any company exists
    const existingCompany = await Company.findOne();
    
    if (existingCompany) {
      // Update existing company
      
      // If a new logo is uploaded, delete the old one
      if (req.body.company_logo && existingCompany.company_logo && req.body.company_logo !== existingCompany.company_logo) {
        deleteUploadedFile(existingCompany.company_logo);
      }

      const company = await Company.findByIdAndUpdate(
        existingCompany._id,
        req.body,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        statusCode: 200,
        message: 'Company updated successfully',
        data: { company }
      });
    } else {
      // Create new company
      const company = new Company(req.body);
      await company.save();

      res.status(201).json({
        statusCode: 201,
        message: 'Company created successfully',
        data: { company }
      });
    }
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
        message: 'Company with this name or email already exists',
        error: 'Duplicate entry'
      });
    } else {
      console.error('Create/Update company error:', error);
      res.status(500).json({
        statusCode: 500,
        message: 'Error processing company',
        error: 'Server error'
      });
    }
  }
};

// Get company
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findOne();
    
    if (!company) {
      res.status(404).json({
        statusCode: 404,
        message: 'No company found',
        error: 'Company not found'
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Company retrieved successfully',
      data: { company }
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error fetching company',
      error: 'Server error'
    });
  }
};

// Get company by ID
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      res.status(404).json({
        statusCode: 404,
        message: 'Company not found',
        error: 'Company not found'
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Company retrieved successfully',
      data: { company }
    });
  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error fetching company',
      error: 'Server error'
    });
  }
};

// Delete company
export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      res.status(404).json({
        statusCode: 404,
        message: 'Company not found',
        error: 'Company not found'
      });
      return;
    }

    // Delete company logo if exists
    if (company.company_logo) {
      deleteUploadedFile(company.company_logo);
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      statusCode: 200,
      message: 'Company deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error deleting company',
      error: 'Server error'
    });
  }
}; 
import { Request, Response } from 'express';
import { Company } from '../models/company.model';
import { deleteUploadedFile } from '../utils/fileUtils';

// Create a new company
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json({
      statusCode: 201,
      message: 'Company created successfully',
      data: { company }
    });
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error creating company',
      error: 'Error creating company' 
    });
  }
};

// Get all companies with search and pagination
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      search = '', 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Build search query
    let searchQuery: any = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count for pagination metadata
    const totalCount = await Company.countDocuments(searchQuery);
    
    // Get companies with search and pagination
    const companies = await Company.find(searchQuery)
      .skip(skip)
      .limit(limitNum)
      .sort(sortObj);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    res.status(200).json({
      statusCode: 200,
      message: 'Companies retrieved successfully',
      data: { 
        companies,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? pageNum + 1 : null,
          prevPage: hasPrevPage ? pageNum - 1 : null
        },
        filters: {
          search: search as string,
          sortBy: sortBy as string,
          sortOrder: sortOrder as string
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error fetching companies',
      error: 'Error fetching companies' 
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
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error fetching company',
      error: 'Error fetching company' 
    });
  }
};

// Update company
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingCompany = await Company.findById(req.params.id);

    if (!existingCompany) {
      res.status(404).json({ 
        statusCode: 404,
        message: 'Company not found',
        error: 'Company not found' 
      });
      return;
    }

    // If a new logo is uploaded, delete the old one
    if (req.body.company_logo && existingCompany.company_logo && req.body.company_logo !== existingCompany.company_logo) {
      deleteUploadedFile(existingCompany.company_logo);
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      statusCode: 200,
      message: 'Company updated successfully',
      data: { company }
    });
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error updating company',
      error: 'Error updating company' 
    });
  }
};

// Delete company
export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
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
      message: 'Company deleted successfully',
      data: null 
    });
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error deleting company',
      error: 'Error deleting company' 
    });
  }
}; 
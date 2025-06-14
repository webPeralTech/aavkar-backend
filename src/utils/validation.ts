import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Validation middleware functions
export const validate = (schema: z.ZodType<any, any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validationData = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      schema.parse(validationData);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400).json({
          error: 'Validation failed',
          details: errorMessages,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error during validation',
      });
    }
  };
};

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ params: req.params });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Auth validation schemas
export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot be more than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot be more than 50 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'manager', 'sales', 'support']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password don't match",
    path: ["confirmPassword"],
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name cannot be empty')
      .max(50, 'First name cannot be more than 50 characters')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name cannot be empty')
      .max(50, 'Last name cannot be more than 50 characters')
      .optional(),
    email: z.string().email('Please enter a valid email').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['admin', 'manager', 'employee', 'sales', 'printing operator']).optional(),
  }),
});

// Customer validation schemas
export const createCustomerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot be more than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot be more than 50 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional(),
    company: z.string().max(100, 'Company name cannot be more than 100 characters').optional(),
    address: z.string(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot be more than 50 characters')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot be more than 50 characters')
      .optional(),
    email: z.string().email('Please enter a valid email').optional(),
    phone: z.string().optional(),
    company: z.string().max(100, 'Company name cannot be more than 100 characters').optional(),
    // address: z
    //   .object({
    //     street: z.string().optional(),
    //     city: z.string().optional(),
    //     state: z.string().optional(),
    //     zipCode: z.string().optional(),
    //     country: z.string().optional(),
    //   })
    //   .optional(),
    address: z.string(),
  }),
});

export const getCustomersQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val) : 10)),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ID parameter validation
export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

// Combined schemas for routes with parameters
export const updateCustomerWithIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot be more than 50 characters')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot be more than 50 characters')
      .optional(),
    email: z.string().email('Please enter a valid email').optional(),
    phone: z.string().optional(),
    company: z.string().max(100, 'Company name cannot be more than 100 characters').optional(),
    address: z.string(),
  }),
});

// Type exports for controllers
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type CreateCustomerRequest = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerRequest = z.infer<typeof updateCustomerSchema>;
export type GetCustomersQuery = z.infer<typeof getCustomersQuerySchema>;
export type IdParamRequest = z.infer<typeof idParamSchema>;
export type UpdateCustomerWithIdRequest = z.infer<typeof updateCustomerWithIdSchema>;


// Company validation schemas
export const createCompanySchema = z.object({
  body: z.object({
    company_name: z.string().min(1, 'Company name is required'),
    company_legal_name: z.string().min(1, 'Company legal name is required'),
    company_logo: z.string().optional(),
    company_address: z.string().min(1, 'Company address is required'),
    primary_contact_number: z.string().min(1, 'Primary contact number is required'),
    office_contact_number: z.string().optional(),
    email: z.string().email('Please enter a valid email'),
    website: z.string().url('Please enter a valid URL').optional(),
    gst_no: z.string().optional(),
    ip_whitelisting: z.array(z.string().ip()).default([]),
    message_tokens: z.array(z.string()).default([]),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    company_name: z.string().min(1, 'Company name is required').optional(),
    company_legal_name: z.string().min(1, 'Company legal name is required').optional(),
    company_logo: z.string().optional(),
    company_address: z.string().min(1, 'Company address is required').optional(),
    primary_contact_number: z.string().min(1, 'Primary contact number is required').optional(),
    office_contact_number: z.string().optional(),
    email: z.string().email('Please enter a valid email').optional(),
    website: z.string().url('Please enter a valid URL').optional(),
    gst_no: z.string().optional(),
    ip_whitelisting: z.array(z.string().ip()).optional(),
    message_tokens: z.array(z.string()).optional(),
  }),
});

// ID parameter validation
export const companyIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Company ID is required'),
  }),
});

// Schema for creating company with file upload
export const createCompanyWithFileSchema = z.object({
  body: z.object({
    company_name: z.string().min(1, 'Company name is required'),
    company_legal_name: z.string().min(1, 'Company legal name is required'),
    company_address: z.string().min(1, 'Company address is required'),
    primary_contact_number: z.string().min(1, 'Primary contact number is required'),
    office_contact_number: z.string().optional(),
    email: z.string().email('Please enter a valid email'),
    website: z.string().url('Please enter a valid URL').optional(),
    gst_no: z.string().optional(),
    ip_whitelisting: z
      .string()
      .optional()
      .transform(val => val ? val.split(',').map(ip => ip.trim()) : []),
    message_tokens: z
      .string()
      .optional()
      .transform(val => val ? val.split(',').map(token => token.trim()) : []),
  }),
});

// Schema for updating company with file upload
export const updateCompanyWithFileSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Company ID is required'),
  }),
  body: z.object({
    company_name: z.string().min(1, 'Company name is required').optional(),
    company_legal_name: z.string().min(1, 'Company legal name is required').optional(),
    company_address: z.string().min(1, 'Company address is required').optional(),
    primary_contact_number: z.string().min(1, 'Primary contact number is required').optional(),
    office_contact_number: z.string().optional(),
    email: z.string().email('Please enter a valid email').optional(),
    website: z.string().url('Please enter a valid URL').optional(),
    gst_no: z.string().optional(),
    ip_whitelisting: z
      .string()
      .optional()
      .transform(val => val ? val.split(',').map(ip => ip.trim()) : undefined),
    message_tokens: z
      .string()
      .optional()
      .transform(val => val ? val.split(',').map(token => token.trim()) : undefined),
  }),
});

// Type exports for controllers
export type CreateCompanyRequest = z.infer<typeof createCompanySchema>;
export type CreateCompanyWithFileRequest = z.infer<typeof createCompanyWithFileSchema>;
export type UpdateCompanyRequest = z.infer<typeof updateCompanySchema>;
export type UpdateCompanyWithFileRequest = z.infer<typeof updateCompanyWithFileSchema>;
export type CompanyIdParamRequest = z.infer<typeof companyIdParamSchema>;

// Product validation schemas
export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .max(100, 'Product name cannot be more than 100 characters'),
    type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .default('service'),
    unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    code: z
      .string()
      .max(50, 'Code cannot be more than 50 characters')
      .optional(),
    photoUrl: z
      .string()
      .url('Photo URL must be a valid URL')
      .optional(), // This will be set automatically by upload middleware
    baseCost: z
      .number()
      .min(0, 'Base cost cannot be negative')
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot be more than 500 characters')
      .optional(),
    isActive: z.boolean().default(true).optional(),
  }),
});

// Schema for file upload (without photoUrl validation since it's auto-generated)
export const createProductWithFileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .max(100, 'Product name cannot be more than 100 characters'),
    type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .default('service'),
    unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    code: z
      .string()
      .max(50, 'Code cannot be more than 50 characters')
      .optional(),
    baseCost: z
      .string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => val === undefined || val >= 0, 'Base cost cannot be negative'),
    description: z
      .string()
      .max(500, 'Description cannot be more than 500 characters')
      .optional(),
    isActive: z
      .string()
      .optional()
      .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .max(100, 'Product name cannot be more than 100 characters')
      .optional(),
    type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .optional(),
    unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    code: z
      .string()
      .max(50, 'Code cannot be more than 50 characters')
      .optional(),
    photoUrl: z
      .string()
      .url('Photo URL must be a valid URL')
      .optional(),
    baseCost: z
      .number()
      .min(0, 'Base cost cannot be negative')
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot be more than 500 characters')
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

// Schema for updating product with file upload
export const updateProductWithFileSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .max(100, 'Product name cannot be more than 100 characters')
      .optional(),
    type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .optional(),
    unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    code: z
      .string()
      .max(50, 'Code cannot be more than 50 characters')
      .optional(),
    baseCost: z
      .string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => val === undefined || val >= 0, 'Base cost cannot be negative'),
    description: z
      .string()
      .max(500, 'Description cannot be more than 500 characters')
      .optional(),
    isActive: z
      .string()
      .optional()
      .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  }),
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val) : 10)),
    type: z.enum(['product', 'service']).optional(),
    isActive: z
      .string()
      .optional()
      .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Combined schemas for routes with parameters
export const updateProductWithIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .max(100, 'Product name cannot be more than 100 characters')
      .optional(),
    type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .optional(),
    unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    code: z
      .string()
      .max(50, 'Code cannot be more than 50 characters')
      .optional(),
    photoUrl: z
      .string()
      .url('Photo URL must be a valid URL')
      .optional(),
    baseCost: z
      .number()
      .min(0, 'Base cost cannot be negative')
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot be more than 500 characters')
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

// Type exports for controllers
export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type CreateProductWithFileRequest = z.infer<typeof createProductWithFileSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type UpdateProductWithFileRequest = z.infer<typeof updateProductWithFileSchema>;
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type UpdateProductWithIdRequest = z.infer<typeof updateProductWithIdSchema>; 
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
        const errorDetails = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({
          error: 'Validation Error',
          details: errorDetails
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
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name cannot be more than 100 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'manager', 'employee', 'sales', 'printing operator']).optional(),
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
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(100, 'Name cannot be more than 100 characters')
      .optional(),
    email: z.string().email('Please enter a valid email').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['admin', 'manager', 'employee', 'sales', 'printing operator']).optional(),
  }),
});

// Customer validation schemas
export const createCustomerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name cannot be more than 100 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional(),
    company: z.string().max(100, 'Company name cannot be more than 100 characters').optional(),
    gst_no: z.string().max(15, 'GST number cannot be more than 15 characters').optional(),
    notes: z.string().max(1000, 'Notes cannot be more than 1000 characters').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name cannot be more than 100 characters')
      .optional(),
    email: z.string().email('Please enter a valid email').optional(),
    phone: z.string().optional(),
    company: z.string().max(100, 'Company name cannot be more than 100 characters').optional(),
    gst_no: z.string().max(15, 'GST number cannot be more than 15 characters').optional(),
    notes: z.string().max(1000, 'Notes cannot be more than 1000 characters').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
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
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name cannot be more than 100 characters')
      .optional(),
    email: z.string().email('Please enter a valid email').optional(),
    phone: z.string().optional(),
    company: z.string().max(100, 'Company name cannot be more than 100 characters').optional(),
    gst_no: z.string().max(15, 'GST number cannot be more than 15 characters').optional(),
    notes: z.string().max(1000, 'Notes cannot be more than 1000 characters').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
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
    company_name: z.string()
      .min(1, 'Company name is required')
      .max(100, 'Company name cannot be more than 100 characters')
      .trim(),
    company_legal_name: z.string()
      .min(1, 'Company legal name is required')
      .max(200, 'Company legal name cannot be more than 200 characters')
      .trim(),
    company_logo: z.string()
      .url('Company logo must be a valid URL')
      .optional(),
    company_address: z.string()
      .min(1, 'Company address is required')
      .max(500, 'Company address cannot be more than 500 characters')
      .trim(),
    primary_contact_number: z.string()
      .min(1, 'Primary contact number is required')
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
      .trim(),
    office_contact_number: z.string()
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
      .trim()
      .optional(),
    email: z.string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .trim()
      .toLowerCase(),
    website: z.string()
      .url('Please enter a valid URL')
      .trim()
      .optional(),
    gst_no: z.string()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number')
      .trim()
      .optional(),
    ip_whitelisting: z.array(z.string().ip('Please enter valid IP addresses')).default([]),
    message_tokens: z.array(z.string().min(8, 'Message tokens must be at least 8 characters long')).default([]),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    company_name: z.string()
      .min(1, 'Company name is required')
      .max(100, 'Company name cannot be more than 100 characters')
      .trim()
      .optional(),
    company_legal_name: z.string()
      .min(1, 'Company legal name is required')
      .max(200, 'Company legal name cannot be more than 200 characters')
      .trim()
      .optional(),
    company_logo: z.string()
      .url('Company logo must be a valid URL')
      .optional(),
    company_address: z.string()
      .min(1, 'Company address is required')
      .max(500, 'Company address cannot be more than 500 characters')
      .trim()
      .optional(),
    primary_contact_number: z.string()
      .min(1, 'Primary contact number is required')
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
      .trim()
      .optional(),
    office_contact_number: z.string()
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
      .trim()
      .optional(),
    email: z.string()
      .email('Please enter a valid email address')
      .trim()
      .toLowerCase()
      .optional(),
    website: z.string()
      .url('Please enter a valid URL')
      .trim()
      .optional(),
    gst_no: z.string()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number')
      .trim()
      .optional(),
    ip_whitelisting: z.array(z.string().ip('Please enter valid IP addresses')).optional(),
    message_tokens: z.array(z.string().min(8, 'Message tokens must be at least 8 characters long')).optional(),
  }),
});

// ID parameter validation
export const companyIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Company ID is required'),
  }),
});

// Schema for creating company with file upload (flexible for both form-data and JSON)
export const createCompanyWithFileSchema = z.object({
  body: z.object({
    company_name: z.string()
      .min(1, 'Company name is required')
      .max(100, 'Company name cannot be more than 100 characters')
      .trim(),
    company_legal_name: z.string()
      .min(1, 'Company legal name is required')
      .max(200, 'Company legal name cannot be more than 200 characters')
      .trim(),
    company_address: z.string()
      .min(1, 'Company address is required')
      .max(500, 'Company address cannot be more than 500 characters')
      .trim(),
    primary_contact_number: z.string()
      .min(1, 'Primary contact number is required')
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
      .trim(),
    office_contact_number: z.string()
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
      .trim()
      .optional()
      .or(z.literal('')),
    email: z.string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .trim()
      .toLowerCase(),
    website: z.string()
      .trim()
      .optional()
      .or(z.literal('')),
    gst_no: z.string()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number')
      .trim()
      .optional()
      .or(z.literal('')),
    // Handle both form-data (string) and JSON (array) formats for ip_whitelisting
    ip_whitelisting: z
      .union([
        z.string(),
        z.array(z.string())
      ])
      .optional()
      .transform(val => {
        if (!val) return [];
        if (typeof val === 'string') {
          if (val.trim() === '') return [];
          return val.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0);
        }
        return val;
      })
      .refine(
        (val: string[]) => val.every(ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)),
        'Please enter valid IP addresses (comma-separated for form-data)'
      ),
    // Handle both form-data (string) and JSON (array) formats for message_tokens
    message_tokens: z
      .union([
        z.string(),
        z.array(z.string())
      ])
      .optional()
      .transform(val => {
        if (!val) return [];
        if (typeof val === 'string') {
          if (val.trim() === '') return [];
          return val.split(',').map(token => token.trim()).filter(token => token.length > 0);
        }
        return val;
      })
      .refine(
        (val: string[]) => val.every(token => token.length >= 8),
        'Message tokens must be at least 8 characters long (comma-separated for form-data)'
      ),
    // Company logo will be set by upload middleware
    company_logo: z.string().optional(),
  }),
});

// Schema for updating company with file upload
export const updateCompanyWithFileSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Company ID is required'),
  }),
  body: z.object({
    company_name: z.string()
      .min(1, 'Company name is required')
      .max(100, 'Company name cannot be more than 100 characters')
      .trim()
      .optional(),
    company_legal_name: z.string()
      .min(1, 'Company legal name is required')
      .max(200, 'Company legal name cannot be more than 200 characters')
      .trim()
      .optional(),
    company_address: z.string()
      .min(1, 'Company address is required')
      .max(500, 'Company address cannot be more than 500 characters')
      .trim()
      .optional(),
    primary_contact_number: z.string()
      .min(1, 'Primary contact number is required')
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
      .trim()
      .optional(),
    office_contact_number: z.string()
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
      .trim()
      .optional(),
    email: z.string()
      .email('Please enter a valid email address')
      .trim()
      .toLowerCase()
      .optional(),
    website: z.string()
      .url('Please enter a valid URL')
      .trim()
      .optional(),
    gst_no: z.string()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number')
      .trim()
      .optional(),
    // Handle both form-data (string) and JSON (array) formats for ip_whitelisting
    ip_whitelisting: z
      .union([
        z.string().transform(val => {
          if (!val || val.trim() === '') return undefined;
          return val.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0);
        }),
        z.array(z.string())
      ])
      .optional()
      .refine(
        (val: string[] | undefined) => !val || val.every(ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)),
        'Please enter valid IP addresses (comma-separated for form-data)'
      ),
    // Handle both form-data (string) and JSON (array) formats for message_tokens
    message_tokens: z
      .union([
        z.string().transform(val => {
          if (!val || val.trim() === '') return undefined;
          return val.split(',').map(token => token.trim()).filter(token => token.length > 0);
        }),
        z.array(z.string())
      ])
      .optional()
      .refine(
        (val: string[] | undefined) => !val || val.every(token => token.length >= 8),
        'Message tokens must be at least 8 characters long (comma-separated for form-data)'
      ),
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
    ps_name: z
      .string()
      .min(1, 'Product/Service name is required')
      .max(100, 'Product/Service name cannot be more than 100 characters'),
    ps_type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .default('service'),
    ps_unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    ps_tax: z
      .number()
      .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28')
      .default(0)
      .optional(),
    ps_hsn_code: z
      .string()
      .max(50, 'HSN/Service code cannot be more than 50 characters')
      .optional(),
    ps_code: z
      .string()
      .max(50, 'Product code cannot be more than 50 characters')
      .optional(),
    printing_operator_code: z
      .string()
      .max(50, 'Printing operator code cannot be more than 50 characters')
      .optional(),
    ps_photo: z
      .string()
      .optional(), // This will be set automatically by upload middleware
    ps_base_cost: z
      .number()
      .min(0, 'Base cost cannot be negative')
      .optional(),
  }),
});

// Schema for file upload (multipart form data)
export const createProductWithFileSchema = z.object({
  body: z.object({
    ps_name: z
      .string()
      .min(1, 'Product/Service name is required')
      .max(100, 'Product/Service name cannot be more than 100 characters'),
    ps_type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .default('service'),
    ps_unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    ps_tax: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val) : 0)
      .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28'),
    ps_hsn_code: z
      .string()
      .max(50, 'HSN/Service code cannot be more than 50 characters')
      .optional(),
    ps_code: z
      .string()
      .max(50, 'Product code cannot be more than 50 characters')
      .optional(),
    printing_operator_code: z
      .string()
      .max(50, 'Printing operator code cannot be more than 50 characters')
      .optional(),
    ps_base_cost: z
      .string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => val === undefined || val >= 0, 'Base cost cannot be negative'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    ps_name: z
      .string()
      .min(1, 'Product/Service name is required')
      .max(100, 'Product/Service name cannot be more than 100 characters')
      .optional(),
    ps_type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .optional(),
    ps_unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    ps_tax: z
      .number()
      .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28')
      .optional(),
    ps_hsn_code: z
      .string()
      .max(50, 'HSN/Service code cannot be more than 50 characters')
      .optional(),
    ps_code: z
      .string()
      .max(50, 'Product code cannot be more than 50 characters')
      .optional(),
    printing_operator_code: z
      .string()
      .max(50, 'Printing operator code cannot be more than 50 characters')
      .optional(),
    ps_photo: z
      .string()
      .optional(),
    ps_base_cost: z
      .number()
      .min(0, 'Base cost cannot be negative')
      .optional(),
  }),
});

// Schema for updating product with file upload
export const updateProductWithFileSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    ps_name: z
      .string()
      .min(1, 'Product/Service name is required')
      .max(100, 'Product/Service name cannot be more than 100 characters')
      .optional(),
    ps_type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .optional(),
    ps_unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    ps_tax: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val) : undefined)
      .refine(val => val === undefined || [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28'),
    ps_hsn_code: z
      .string()
      .max(50, 'HSN/Service code cannot be more than 50 characters')
      .optional(),
    ps_code: z
      .string()
      .max(50, 'Product code cannot be more than 50 characters')
      .optional(),
    printing_operator_code: z
      .string()
      .max(50, 'Printing operator code cannot be more than 50 characters')
      .optional(),
    ps_base_cost: z
      .string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => val === undefined || val >= 0, 'Base cost cannot be negative'),
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
    ps_type: z.enum(['product', 'service']).optional(),
    ps_tax: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val) : undefined)
      .refine(val => val === undefined || [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28'),
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
    ps_name: z
      .string()
      .min(1, 'Product/Service name is required')
      .max(100, 'Product/Service name cannot be more than 100 characters')
      .optional(),
    ps_type: z
      .enum(['product', 'service'], {
        errorMap: () => ({ message: 'Type must be either product or service' })
      })
      .optional(),
    ps_unit: z
      .string()
      .max(20, 'Unit cannot be more than 20 characters')
      .optional(),
    ps_tax: z
      .number()
      .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28')
      .optional(),
    ps_hsn_code: z
      .string()
      .max(50, 'HSN/Service code cannot be more than 50 characters')
      .optional(),
    ps_code: z
      .string()
      .max(50, 'Product code cannot be more than 50 characters')
      .optional(),
    printing_operator_code: z
      .string()
      .max(50, 'Printing operator code cannot be more than 50 characters')
      .optional(),
    ps_photo: z
      .string()
      .optional(),
    ps_base_cost: z
      .number()
      .min(0, 'Base cost cannot be negative')
      .optional(),
  }),
});

// Bulk create schema
export const createBulkProductsSchema = z.object({
  body: z.object({
    products: z.array(z.object({
      ps_name: z
        .string()
        .min(1, 'Product/Service name is required')
        .max(100, 'Product/Service name cannot be more than 100 characters'),
      ps_type: z
        .enum(['product', 'service'])
        .default('service'),
      ps_unit: z
        .string()
        .max(20, 'Unit cannot be more than 20 characters')
        .optional(),
      ps_tax: z
        .number()
        .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28')
        .default(0)
        .optional(),
      ps_hsn_code: z
        .string()
        .max(50, 'HSN/Service code cannot be more than 50 characters')
        .optional(),
      ps_code: z
        .string()
        .max(50, 'Product code cannot be more than 50 characters')
        .optional(),
      printing_operator_code: z
        .string()
        .max(50, 'Printing operator code cannot be more than 50 characters')
        .optional(),
      ps_base_cost: z
        .number()
        .min(0, 'Base cost cannot be negative')
        .optional(),
    })).min(1, 'At least one product is required'),
  }),
});

// Type exports for controllers
export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type CreateProductWithFileRequest = z.infer<typeof createProductWithFileSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type UpdateProductWithFileRequest = z.infer<typeof updateProductWithFileSchema>;
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type UpdateProductWithIdRequest = z.infer<typeof updateProductWithIdSchema>;
export type CreateBulkProductsRequest = z.infer<typeof createBulkProductsSchema>; 

// Payment validation schemas
export const createPaymentSchema = z.object({
  body: z.object({
    p_type: z
      .enum(['cash', 'cheque', 'UPI'], {
        errorMap: () => ({ message: 'Payment type must be one of: cash, cheque, UPI' })
      }),
    invoice_id: z
      .string()
      .min(1, 'Invoice ID is required')
      .max(100, 'Invoice ID cannot be more than 100 characters')
      .trim(),
    date_time: z
      .string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
      .transform(val => new Date(val))
      .refine(val => val <= new Date(), 'Payment date cannot be in the future'),
    amount: z
      .number()
      .min(0.01, 'Payment amount must be greater than 0')
      .refine(val => {
        // Check if amount has at most 2 decimal places
        return /^\d+(\.\d{1,2})?$/.test(val.toString());
      }, 'Payment amount can have at most 2 decimal places'),
  }),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    p_type: z
      .enum(['cash', 'cheque', 'UPI'], {
        errorMap: () => ({ message: 'Payment type must be one of: cash, cheque, UPI' })
      })
      .optional(),
    invoice_id: z
      .string()
      .min(1, 'Invoice ID cannot be empty')
      .max(100, 'Invoice ID cannot be more than 100 characters')
      .trim()
      .optional(),
    date_time: z
      .string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
      .transform(val => new Date(val))
      .refine(val => val <= new Date(), 'Payment date cannot be in the future')
      .optional(),
    amount: z
      .number()
      .min(0.01, 'Payment amount must be greater than 0')
      .refine(val => {
        // Check if amount has at most 2 decimal places
        return /^\d+(\.\d{1,2})?$/.test(val.toString());
      }, 'Payment amount can have at most 2 decimal places')
      .optional(),
  }),
});

export const getPaymentsQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val) : 10)),
    p_type: z.enum(['cash', 'cheque', 'UPI']).optional(),
    invoice_id: z.string().optional(),
    start_date: z
      .string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid start_date format'),
    end_date: z
      .string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid end_date format'),
    min_amount: z
      .string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => val === undefined || val >= 0, 'Minimum amount must be non-negative'),
    max_amount: z
      .string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => val === undefined || val >= 0, 'Maximum amount must be non-negative'),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const updatePaymentWithIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Payment ID is required'),
  }),
  body: z.object({
    p_type: z
      .enum(['cash', 'cheque', 'UPI'], {
        errorMap: () => ({ message: 'Payment type must be one of: cash, cheque, UPI' })
      })
      .optional(),
    invoice_id: z
      .string()
      .min(1, 'Invoice ID cannot be empty')
      .max(100, 'Invoice ID cannot be more than 100 characters')
      .trim()
      .optional(),
    date_time: z
      .string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
      .transform(val => new Date(val))
      .refine(val => val <= new Date(), 'Payment date cannot be in the future')
      .optional(),
    amount: z
      .number()
      .min(0.01, 'Payment amount must be greater than 0')
      .refine(val => {
        // Check if amount has at most 2 decimal places
        return /^\d+(\.\d{1,2})?$/.test(val.toString());
      }, 'Payment amount can have at most 2 decimal places')
      .optional(),
  }),
});

export const paymentStatsQuerySchema = z.object({
  query: z.object({
    start_date: z
      .string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid start_date format'),
    end_date: z
      .string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid end_date format'),
  }),
});

export const invoiceIdParamSchema = z.object({
  params: z.object({
    invoiceId: z.string().min(1, 'Invoice ID is required'),
  }),
});

// Type exports for payment controllers
export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentRequest = z.infer<typeof updatePaymentSchema>;
export type GetPaymentsQuery = z.infer<typeof getPaymentsQuerySchema>;
export type UpdatePaymentWithIdRequest = z.infer<typeof updatePaymentWithIdSchema>;
export type PaymentStatsQuery = z.infer<typeof paymentStatsQuerySchema>;
export type InvoiceIdParamRequest = z.infer<typeof invoiceIdParamSchema>; 
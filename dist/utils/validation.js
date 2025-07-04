"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductWithIdSchema = exports.getProductsQuerySchema = exports.updateProductWithFileSchema = exports.updateProductSchema = exports.createProductWithFileSchema = exports.createProductSchema = exports.updateCompanyWithFileSchema = exports.createCompanyWithFileSchema = exports.companyIdParamSchema = exports.updateCompanySchema = exports.createCompanySchema = exports.updateCustomerWithIdSchema = exports.idParamSchema = exports.getCustomersQuerySchema = exports.updateCustomerSchema = exports.createCustomerSchema = exports.updateUserSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = exports.validateParams = exports.validateRequest = exports.validate = void 0;
const zod_1 = require("zod");
// Validation middleware functions
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validationData = {
                body: req.body,
                query: req.query,
                params: req.params,
            };
            schema.parse(validationData);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
exports.validate = validate;
const validateRequest = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield schema.parseAsync({ body: req.body });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    });
};
exports.validateRequest = validateRequest;
const validateParams = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield schema.parseAsync({ params: req.params });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    });
};
exports.validateParams = validateParams;
// Auth validation schemas
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Name is required')
            .max(100, 'Name cannot be more than 100 characters'),
        email: zod_1.z.string().email('Please enter a valid email'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        role: zod_1.z.enum(['admin', 'manager', 'employee', 'sales', 'printing operator']).optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Please enter a valid email'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
        confirmPassword: zod_1.z.string().min(1, 'Please confirm your new password'),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "New password and confirm password don't match",
        path: ["confirmPassword"],
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().min(1, 'User ID is required'),
    }),
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Name cannot be empty')
            .max(100, 'Name cannot be more than 100 characters')
            .optional(),
        email: zod_1.z.string().email('Please enter a valid email').optional(),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
        role: zod_1.z.enum(['admin', 'manager', 'employee', 'sales', 'printing operator']).optional(),
    }),
});
// Customer validation schemas
exports.createCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Name is required')
            .max(100, 'Name cannot be more than 100 characters'),
        email: zod_1.z.string().email('Please enter a valid email'),
        phone: zod_1.z.string().optional(),
        company: zod_1.z.string().max(100, 'Company name cannot be more than 100 characters').optional(),
        gst_no: zod_1.z.string().max(15, 'GST number cannot be more than 15 characters').optional(),
        notes: zod_1.z.string().max(1000, 'Notes cannot be more than 1000 characters').optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
    }),
});
exports.updateCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Name is required')
            .max(100, 'Name cannot be more than 100 characters')
            .optional(),
        email: zod_1.z.string().email('Please enter a valid email').optional(),
        phone: zod_1.z.string().optional(),
        company: zod_1.z.string().max(100, 'Company name cannot be more than 100 characters').optional(),
        gst_no: zod_1.z.string().max(15, 'GST number cannot be more than 15 characters').optional(),
        notes: zod_1.z.string().max(1000, 'Notes cannot be more than 1000 characters').optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
    }),
});
exports.getCustomersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val) : 1)),
        limit: zod_1.z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val) : 10)),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
// ID parameter validation
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'ID is required'),
    }),
});
// Combined schemas for routes with parameters
exports.updateCustomerWithIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'ID is required'),
    }),
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Name is required')
            .max(100, 'Name cannot be more than 100 characters')
            .optional(),
        email: zod_1.z.string().email('Please enter a valid email').optional(),
        phone: zod_1.z.string().optional(),
        company: zod_1.z.string().max(100, 'Company name cannot be more than 100 characters').optional(),
        gst_no: zod_1.z.string().max(15, 'GST number cannot be more than 15 characters').optional(),
        notes: zod_1.z.string().max(1000, 'Notes cannot be more than 1000 characters').optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
    }),
});
// Company validation schemas
exports.createCompanySchema = zod_1.z.object({
    body: zod_1.z.object({
        company_name: zod_1.z.string()
            .min(1, 'Company name is required')
            .max(100, 'Company name cannot be more than 100 characters')
            .trim(),
        company_legal_name: zod_1.z.string()
            .min(1, 'Company legal name is required')
            .max(200, 'Company legal name cannot be more than 200 characters')
            .trim(),
        company_logo: zod_1.z.string()
            .url('Company logo must be a valid URL')
            .optional(),
        company_address: zod_1.z.string()
            .min(1, 'Company address is required')
            .max(500, 'Company address cannot be more than 500 characters')
            .trim(),
        primary_contact_number: zod_1.z.string()
            .min(1, 'Primary contact number is required')
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
            .trim(),
        office_contact_number: zod_1.z.string()
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
            .trim()
            .optional(),
        email: zod_1.z.string()
            .min(1, 'Email is required')
            .email('Please enter a valid email address')
            .trim()
            .toLowerCase(),
        website: zod_1.z.string()
            .url('Please enter a valid URL')
            .trim()
            .optional(),
        gst_no: zod_1.z.string()
            .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number')
            .trim()
            .optional(),
        ip_whitelisting: zod_1.z.array(zod_1.z.string().ip('Please enter valid IP addresses')).default([]),
        message_tokens: zod_1.z.array(zod_1.z.string().min(8, 'Message tokens must be at least 8 characters long')).default([]),
    }),
});
exports.updateCompanySchema = zod_1.z.object({
    body: zod_1.z.object({
        company_name: zod_1.z.string()
            .min(1, 'Company name is required')
            .max(100, 'Company name cannot be more than 100 characters')
            .trim()
            .optional(),
        company_legal_name: zod_1.z.string()
            .min(1, 'Company legal name is required')
            .max(200, 'Company legal name cannot be more than 200 characters')
            .trim()
            .optional(),
        company_logo: zod_1.z.string()
            .url('Company logo must be a valid URL')
            .optional(),
        company_address: zod_1.z.string()
            .min(1, 'Company address is required')
            .max(500, 'Company address cannot be more than 500 characters')
            .trim()
            .optional(),
        primary_contact_number: zod_1.z.string()
            .min(1, 'Primary contact number is required')
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
            .trim()
            .optional(),
        office_contact_number: zod_1.z.string()
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
            .trim()
            .optional(),
        email: zod_1.z.string()
            .email('Please enter a valid email address')
            .trim()
            .toLowerCase()
            .optional(),
        website: zod_1.z.string()
            .url('Please enter a valid URL')
            .trim()
            .optional(),
        gst_no: zod_1.z.string()
            .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number')
            .trim()
            .optional(),
        ip_whitelisting: zod_1.z.array(zod_1.z.string().ip('Please enter valid IP addresses')).optional(),
        message_tokens: zod_1.z.array(zod_1.z.string().min(8, 'Message tokens must be at least 8 characters long')).optional(),
    }),
});
// ID parameter validation
exports.companyIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Company ID is required'),
    }),
});
// Schema for creating company with file upload (flexible for both form-data and JSON)
exports.createCompanyWithFileSchema = zod_1.z.object({
    body: zod_1.z.object({
        company_name: zod_1.z.string()
            .min(1, 'Company name is required')
            .max(100, 'Company name cannot be more than 100 characters')
            .trim(),
        company_legal_name: zod_1.z.string()
            .min(1, 'Company legal name is required')
            .max(200, 'Company legal name cannot be more than 200 characters')
            .trim(),
        company_address: zod_1.z.string()
            .min(1, 'Company address is required')
            .max(500, 'Company address cannot be more than 500 characters')
            .trim(),
        primary_contact_number: zod_1.z.string()
            .min(1, 'Primary contact number is required')
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
            .trim(),
        office_contact_number: zod_1.z.string()
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
            .trim()
            .optional()
            .or(zod_1.z.literal('')),
        email: zod_1.z.string()
            .min(1, 'Email is required')
            .email('Please enter a valid email address')
            .trim()
            .toLowerCase(),
        website: zod_1.z.string()
            .trim()
            .optional()
            .or(zod_1.z.literal('')),
        gst_no: zod_1.z.string()
            .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number')
            .trim()
            .optional()
            .or(zod_1.z.literal('')),
        // Handle both form-data (string) and JSON (array) formats for ip_whitelisting
        ip_whitelisting: zod_1.z
            .union([
            zod_1.z.string(),
            zod_1.z.array(zod_1.z.string())
        ])
            .optional()
            .transform(val => {
            if (!val)
                return [];
            if (typeof val === 'string') {
                if (val.trim() === '')
                    return [];
                return val.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0);
            }
            return val;
        })
            .refine((val) => val.every(ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)), 'Please enter valid IP addresses (comma-separated for form-data)'),
        // Handle both form-data (string) and JSON (array) formats for message_tokens
        message_tokens: zod_1.z
            .union([
            zod_1.z.string(),
            zod_1.z.array(zod_1.z.string())
        ])
            .optional()
            .transform(val => {
            if (!val)
                return [];
            if (typeof val === 'string') {
                if (val.trim() === '')
                    return [];
                return val.split(',').map(token => token.trim()).filter(token => token.length > 0);
            }
            return val;
        })
            .refine((val) => val.every(token => token.length >= 8), 'Message tokens must be at least 8 characters long (comma-separated for form-data)'),
        // Company logo will be set by upload middleware
        company_logo: zod_1.z.string().optional(),
    }),
});
// Schema for updating company with file upload
exports.updateCompanyWithFileSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Company ID is required'),
    }),
    body: zod_1.z.object({
        company_name: zod_1.z.string()
            .min(1, 'Company name is required')
            .max(100, 'Company name cannot be more than 100 characters')
            .trim()
            .optional(),
        company_legal_name: zod_1.z.string()
            .min(1, 'Company legal name is required')
            .max(200, 'Company legal name cannot be more than 200 characters')
            .trim()
            .optional(),
        company_address: zod_1.z.string()
            .min(1, 'Company address is required')
            .max(500, 'Company address cannot be more than 500 characters')
            .trim()
            .optional(),
        primary_contact_number: zod_1.z.string()
            .min(1, 'Primary contact number is required')
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
            .trim()
            .optional(),
        office_contact_number: zod_1.z.string()
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number')
            .trim()
            .optional(),
        email: zod_1.z.string()
            .email('Please enter a valid email address')
            .trim()
            .toLowerCase()
            .optional(),
        website: zod_1.z.string()
            .url('Please enter a valid URL')
            .trim()
            .optional(),
        gst_no: zod_1.z.string()
            .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number')
            .trim()
            .optional(),
        // Handle both form-data (string) and JSON (array) formats for ip_whitelisting
        ip_whitelisting: zod_1.z
            .union([
            zod_1.z.string().transform(val => {
                if (!val || val.trim() === '')
                    return undefined;
                return val.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0);
            }),
            zod_1.z.array(zod_1.z.string())
        ])
            .optional()
            .refine((val) => !val || val.every(ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)), 'Please enter valid IP addresses (comma-separated for form-data)'),
        // Handle both form-data (string) and JSON (array) formats for message_tokens
        message_tokens: zod_1.z
            .union([
            zod_1.z.string().transform(val => {
                if (!val || val.trim() === '')
                    return undefined;
                return val.split(',').map(token => token.trim()).filter(token => token.length > 0);
            }),
            zod_1.z.array(zod_1.z.string())
        ])
            .optional()
            .refine((val) => !val || val.every(token => token.length >= 8), 'Message tokens must be at least 8 characters long (comma-separated for form-data)'),
    }),
});
// Product validation schemas
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Product name is required')
            .max(100, 'Product name cannot be more than 100 characters'),
        type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .default('service'),
        unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        code: zod_1.z
            .string()
            .max(50, 'Code cannot be more than 50 characters')
            .optional(),
        photoUrl: zod_1.z
            .string()
            .url('Photo URL must be a valid URL')
            .optional(), // This will be set automatically by upload middleware
        baseCost: zod_1.z
            .number()
            .min(0, 'Base cost cannot be negative')
            .optional(),
        description: zod_1.z
            .string()
            .max(500, 'Description cannot be more than 500 characters')
            .optional(),
        isActive: zod_1.z.boolean().default(true).optional(),
    }),
});
// Schema for file upload (without photoUrl validation since it's auto-generated)
exports.createProductWithFileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Product name is required')
            .max(100, 'Product name cannot be more than 100 characters'),
        type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .default('service'),
        unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        code: zod_1.z
            .string()
            .max(50, 'Code cannot be more than 50 characters')
            .optional(),
        baseCost: zod_1.z
            .string()
            .optional()
            .transform(val => val ? parseFloat(val) : undefined)
            .refine(val => val === undefined || val >= 0, 'Base cost cannot be negative'),
        description: zod_1.z
            .string()
            .max(500, 'Description cannot be more than 500 characters')
            .optional(),
        isActive: zod_1.z
            .string()
            .optional()
            .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Product name is required')
            .max(100, 'Product name cannot be more than 100 characters')
            .optional(),
        type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .optional(),
        unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        code: zod_1.z
            .string()
            .max(50, 'Code cannot be more than 50 characters')
            .optional(),
        photoUrl: zod_1.z
            .string()
            .url('Photo URL must be a valid URL')
            .optional(),
        baseCost: zod_1.z
            .number()
            .min(0, 'Base cost cannot be negative')
            .optional(),
        description: zod_1.z
            .string()
            .max(500, 'Description cannot be more than 500 characters')
            .optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
// Schema for updating product with file upload
exports.updateProductWithFileSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'ID is required'),
    }),
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Product name is required')
            .max(100, 'Product name cannot be more than 100 characters')
            .optional(),
        type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .optional(),
        unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        code: zod_1.z
            .string()
            .max(50, 'Code cannot be more than 50 characters')
            .optional(),
        baseCost: zod_1.z
            .string()
            .optional()
            .transform(val => val ? parseFloat(val) : undefined)
            .refine(val => val === undefined || val >= 0, 'Base cost cannot be negative'),
        description: zod_1.z
            .string()
            .max(500, 'Description cannot be more than 500 characters')
            .optional(),
        isActive: zod_1.z
            .string()
            .optional()
            .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
    }),
});
exports.getProductsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val) : 1)),
        limit: zod_1.z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val) : 10)),
        type: zod_1.z.enum(['product', 'service']).optional(),
        isActive: zod_1.z
            .string()
            .optional()
            .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
// Combined schemas for routes with parameters
exports.updateProductWithIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'ID is required'),
    }),
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Product name is required')
            .max(100, 'Product name cannot be more than 100 characters')
            .optional(),
        type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .optional(),
        unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        code: zod_1.z
            .string()
            .max(50, 'Code cannot be more than 50 characters')
            .optional(),
        photoUrl: zod_1.z
            .string()
            .url('Photo URL must be a valid URL')
            .optional(),
        baseCost: zod_1.z
            .number()
            .min(0, 'Base cost cannot be negative')
            .optional(),
        description: zod_1.z
            .string()
            .max(500, 'Description cannot be more than 500 characters')
            .optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});

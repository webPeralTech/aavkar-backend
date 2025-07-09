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
exports.invoiceIdParamSchema = exports.paymentStatsQuerySchema = exports.updatePaymentWithIdSchema = exports.getPaymentsQuerySchema = exports.updatePaymentSchema = exports.createPaymentSchema = exports.createBulkProductsSchema = exports.updateProductWithIdSchema = exports.getProductsQuerySchema = exports.updateProductWithFileSchema = exports.updateProductSchema = exports.createProductWithFileSchema = exports.createProductSchema = exports.updateCompanyWithFileSchema = exports.createCompanyWithFileSchema = exports.companyIdParamSchema = exports.updateCompanySchema = exports.createCompanySchema = exports.updateCustomerWithIdSchema = exports.idParamSchema = exports.getCustomersQuerySchema = exports.updateCustomerSchema = exports.createCustomerSchema = exports.updateUserSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = exports.validateParams = exports.validateRequest = exports.validate = void 0;
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
        ps_name: zod_1.z
            .string()
            .min(1, 'Product/Service name is required')
            .max(100, 'Product/Service name cannot be more than 100 characters'),
        ps_type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .default('service'),
        ps_unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        ps_tax: zod_1.z
            .number()
            .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28')
            .default(0)
            .optional(),
        ps_hsn_code: zod_1.z
            .string()
            .max(50, 'HSN/Service code cannot be more than 50 characters')
            .optional(),
        ps_code: zod_1.z
            .string()
            .max(50, 'Product code cannot be more than 50 characters')
            .optional(),
        printing_operator_code: zod_1.z
            .string()
            .max(50, 'Printing operator code cannot be more than 50 characters')
            .optional(),
        ps_photo: zod_1.z
            .string()
            .optional(), // This will be set automatically by upload middleware
        ps_base_cost: zod_1.z
            .number()
            .min(0, 'Base cost cannot be negative')
            .optional(),
    }),
});
// Schema for file upload (multipart form data)
exports.createProductWithFileSchema = zod_1.z.object({
    body: zod_1.z.object({
        ps_name: zod_1.z
            .string()
            .min(1, 'Product/Service name is required')
            .max(100, 'Product/Service name cannot be more than 100 characters'),
        ps_type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .default('service'),
        ps_unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        ps_tax: zod_1.z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : 0)
            .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28'),
        ps_hsn_code: zod_1.z
            .string()
            .max(50, 'HSN/Service code cannot be more than 50 characters')
            .optional(),
        ps_code: zod_1.z
            .string()
            .max(50, 'Product code cannot be more than 50 characters')
            .optional(),
        printing_operator_code: zod_1.z
            .string()
            .max(50, 'Printing operator code cannot be more than 50 characters')
            .optional(),
        ps_base_cost: zod_1.z
            .string()
            .optional()
            .transform(val => val ? parseFloat(val) : undefined)
            .refine(val => val === undefined || val >= 0, 'Base cost cannot be negative'),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        ps_name: zod_1.z
            .string()
            .min(1, 'Product/Service name is required')
            .max(100, 'Product/Service name cannot be more than 100 characters')
            .optional(),
        ps_type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .optional(),
        ps_unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        ps_tax: zod_1.z
            .number()
            .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28')
            .optional(),
        ps_hsn_code: zod_1.z
            .string()
            .max(50, 'HSN/Service code cannot be more than 50 characters')
            .optional(),
        ps_code: zod_1.z
            .string()
            .max(50, 'Product code cannot be more than 50 characters')
            .optional(),
        printing_operator_code: zod_1.z
            .string()
            .max(50, 'Printing operator code cannot be more than 50 characters')
            .optional(),
        ps_photo: zod_1.z
            .string()
            .optional(),
        ps_base_cost: zod_1.z
            .number()
            .min(0, 'Base cost cannot be negative')
            .optional(),
    }),
});
// Schema for updating product with file upload
exports.updateProductWithFileSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'ID is required'),
    }),
    body: zod_1.z.object({
        ps_name: zod_1.z
            .string()
            .min(1, 'Product/Service name is required')
            .max(100, 'Product/Service name cannot be more than 100 characters')
            .optional(),
        ps_type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .optional(),
        ps_unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        ps_tax: zod_1.z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : undefined)
            .refine(val => val === undefined || [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28'),
        ps_hsn_code: zod_1.z
            .string()
            .max(50, 'HSN/Service code cannot be more than 50 characters')
            .optional(),
        ps_code: zod_1.z
            .string()
            .max(50, 'Product code cannot be more than 50 characters')
            .optional(),
        printing_operator_code: zod_1.z
            .string()
            .max(50, 'Printing operator code cannot be more than 50 characters')
            .optional(),
        ps_base_cost: zod_1.z
            .string()
            .optional()
            .transform(val => val ? parseFloat(val) : undefined)
            .refine(val => val === undefined || val >= 0, 'Base cost cannot be negative'),
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
        ps_type: zod_1.z.enum(['product', 'service']).optional(),
        ps_tax: zod_1.z
            .string()
            .optional()
            .transform(val => val ? parseInt(val) : undefined)
            .refine(val => val === undefined || [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28'),
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
        ps_name: zod_1.z
            .string()
            .min(1, 'Product/Service name is required')
            .max(100, 'Product/Service name cannot be more than 100 characters')
            .optional(),
        ps_type: zod_1.z
            .enum(['product', 'service'], {
            errorMap: () => ({ message: 'Type must be either product or service' })
        })
            .optional(),
        ps_unit: zod_1.z
            .string()
            .max(20, 'Unit cannot be more than 20 characters')
            .optional(),
        ps_tax: zod_1.z
            .number()
            .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28')
            .optional(),
        ps_hsn_code: zod_1.z
            .string()
            .max(50, 'HSN/Service code cannot be more than 50 characters')
            .optional(),
        ps_code: zod_1.z
            .string()
            .max(50, 'Product code cannot be more than 50 characters')
            .optional(),
        printing_operator_code: zod_1.z
            .string()
            .max(50, 'Printing operator code cannot be more than 50 characters')
            .optional(),
        ps_photo: zod_1.z
            .string()
            .optional(),
        ps_base_cost: zod_1.z
            .number()
            .min(0, 'Base cost cannot be negative')
            .optional(),
    }),
});
// Bulk create schema
exports.createBulkProductsSchema = zod_1.z.object({
    body: zod_1.z.object({
        products: zod_1.z.array(zod_1.z.object({
            ps_name: zod_1.z
                .string()
                .min(1, 'Product/Service name is required')
                .max(100, 'Product/Service name cannot be more than 100 characters'),
            ps_type: zod_1.z
                .enum(['product', 'service'])
                .default('service'),
            ps_unit: zod_1.z
                .string()
                .max(20, 'Unit cannot be more than 20 characters')
                .optional(),
            ps_tax: zod_1.z
                .number()
                .refine(val => [0, 5, 12, 18, 28].includes(val), 'Tax must be one of: 0, 5, 12, 18, 28')
                .default(0)
                .optional(),
            ps_hsn_code: zod_1.z
                .string()
                .max(50, 'HSN/Service code cannot be more than 50 characters')
                .optional(),
            ps_code: zod_1.z
                .string()
                .max(50, 'Product code cannot be more than 50 characters')
                .optional(),
            printing_operator_code: zod_1.z
                .string()
                .max(50, 'Printing operator code cannot be more than 50 characters')
                .optional(),
            ps_base_cost: zod_1.z
                .number()
                .min(0, 'Base cost cannot be negative')
                .optional(),
        })).min(1, 'At least one product is required'),
    }),
});
// Payment validation schemas
exports.createPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        p_type: zod_1.z
            .enum(['cash', 'cheque', 'UPI'], {
            errorMap: () => ({ message: 'Payment type must be one of: cash, cheque, UPI' })
        }),
        invoice_id: zod_1.z
            .string()
            .min(1, 'Invoice ID is required')
            .max(100, 'Invoice ID cannot be more than 100 characters')
            .trim(),
        date_time: zod_1.z
            .string()
            .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
            .transform(val => new Date(val))
            .refine(val => val <= new Date(), 'Payment date cannot be in the future'),
        amount: zod_1.z
            .number()
            .min(0.01, 'Payment amount must be greater than 0')
            .refine(val => {
            // Check if amount has at most 2 decimal places
            return /^\d+(\.\d{1,2})?$/.test(val.toString());
        }, 'Payment amount can have at most 2 decimal places'),
    }),
});
exports.updatePaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        p_type: zod_1.z
            .enum(['cash', 'cheque', 'UPI'], {
            errorMap: () => ({ message: 'Payment type must be one of: cash, cheque, UPI' })
        })
            .optional(),
        invoice_id: zod_1.z
            .string()
            .min(1, 'Invoice ID cannot be empty')
            .max(100, 'Invoice ID cannot be more than 100 characters')
            .trim()
            .optional(),
        date_time: zod_1.z
            .string()
            .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
            .transform(val => new Date(val))
            .refine(val => val <= new Date(), 'Payment date cannot be in the future')
            .optional(),
        amount: zod_1.z
            .number()
            .min(0.01, 'Payment amount must be greater than 0')
            .refine(val => {
            // Check if amount has at most 2 decimal places
            return /^\d+(\.\d{1,2})?$/.test(val.toString());
        }, 'Payment amount can have at most 2 decimal places')
            .optional(),
    }),
});
exports.getPaymentsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val) : 1)),
        limit: zod_1.z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val) : 10)),
        p_type: zod_1.z.enum(['cash', 'cheque', 'UPI']).optional(),
        invoice_id: zod_1.z.string().optional(),
        start_date: zod_1.z
            .string()
            .optional()
            .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid start_date format'),
        end_date: zod_1.z
            .string()
            .optional()
            .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid end_date format'),
        min_amount: zod_1.z
            .string()
            .optional()
            .transform(val => val ? parseFloat(val) : undefined)
            .refine(val => val === undefined || val >= 0, 'Minimum amount must be non-negative'),
        max_amount: zod_1.z
            .string()
            .optional()
            .transform(val => val ? parseFloat(val) : undefined)
            .refine(val => val === undefined || val >= 0, 'Maximum amount must be non-negative'),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
exports.updatePaymentWithIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Payment ID is required'),
    }),
    body: zod_1.z.object({
        p_type: zod_1.z
            .enum(['cash', 'cheque', 'UPI'], {
            errorMap: () => ({ message: 'Payment type must be one of: cash, cheque, UPI' })
        })
            .optional(),
        invoice_id: zod_1.z
            .string()
            .min(1, 'Invoice ID cannot be empty')
            .max(100, 'Invoice ID cannot be more than 100 characters')
            .trim()
            .optional(),
        date_time: zod_1.z
            .string()
            .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
            .transform(val => new Date(val))
            .refine(val => val <= new Date(), 'Payment date cannot be in the future')
            .optional(),
        amount: zod_1.z
            .number()
            .min(0.01, 'Payment amount must be greater than 0')
            .refine(val => {
            // Check if amount has at most 2 decimal places
            return /^\d+(\.\d{1,2})?$/.test(val.toString());
        }, 'Payment amount can have at most 2 decimal places')
            .optional(),
    }),
});
exports.paymentStatsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        start_date: zod_1.z
            .string()
            .optional()
            .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid start_date format'),
        end_date: zod_1.z
            .string()
            .optional()
            .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid end_date format'),
    }),
});
exports.invoiceIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        invoiceId: zod_1.z.string().min(1, 'Invoice ID is required'),
    }),
});

import { Router } from 'express';
import { createOrUpdate, getAll, getById, deleteCompany } from '../controllers/company.controller';
import { 
  companyIdParamSchema, 
  createCompanyWithFileSchema,
  validateParams, 
  validateRequest 
} from '../utils/validation';
import { isAdmin } from '../middlewares/auth.middleware';
import {
  uploadCompanyLogo,
  processCompanyLogo,
  handleUploadError,
  preprocessCompanyFormData,
} from '../middlewares/upload';

const router = Router();

// All routes are protected with admin middleware
router.use(isAdmin);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create or update company information
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - company_legal_name
 *               - company_address
 *               - primary_contact_number
 *               - email
 *             properties:
 *               company_name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Company display name
 *                 example: "Tech Solutions Inc"
 *               company_legal_name:
 *                 type: string
 *                 maxLength: 200
 *                 description: Legal name of the company
 *                 example: "Tech Solutions Incorporated"
 *               company_logo:
 *                 type: string
 *                 format: binary
 *                 description: Company logo image file (optional)
 *               company_address:
 *                 type: string
 *                 maxLength: 500
 *                 description: Company address
 *                 example: "123 Tech Street, Silicon Valley, CA 94000"
 *               primary_contact_number:
 *                 type: string
 *                 pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$'
 *                 description: Primary contact phone number
 *                 example: "+1-555-123-4567"
 *               office_contact_number:
 *                 type: string
 *                 pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$'
 *                 description: Office contact phone number (optional)
 *                 example: "+1-555-123-4568"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Company email address
 *                 example: "contact@techsolutions.com"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Company website URL (optional)
 *                 example: "https://www.techsolutions.com"
 *               gst_no:
 *                 type: string
 *                 pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
 *                 description: GST number (optional)
 *                 example: "22AAAAA0000A1Z5"
 *               ip_whitelisting:
 *                 type: string
 *                 description: Comma-separated list of whitelisted IP addresses (optional)
 *                 example: "192.168.1.1,10.0.0.1"
 *               message_tokens:
 *                 type: string
 *                 description: Comma-separated list of message tokens (optional, min 8 chars each)
 *                 example: "token123456,anothertoken789"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - company_legal_name
 *               - company_address
 *               - primary_contact_number
 *               - email
 *             properties:
 *               company_name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Company display name
 *                 example: "Tech Solutions Inc"
 *               company_legal_name:
 *                 type: string
 *                 maxLength: 200
 *                 description: Legal name of the company
 *                 example: "Tech Solutions Incorporated"
 *               company_logo:
 *                 type: string
 *                 format: uri
 *                 description: Company logo URL (optional)
 *                 example: "https://example.com/logo.png"
 *               company_address:
 *                 type: string
 *                 maxLength: 500
 *                 description: Company address
 *                 example: "123 Tech Street, Silicon Valley, CA 94000"
 *               primary_contact_number:
 *                 type: string
 *                 pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$'
 *                 description: Primary contact phone number
 *                 example: "+1-555-123-4567"
 *               office_contact_number:
 *                 type: string
 *                 pattern: '^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$'
 *                 description: Office contact phone number (optional)
 *                 example: "+1-555-123-4568"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Company email address
 *                 example: "contact@techsolutions.com"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Company website URL (optional)
 *                 example: "https://www.techsolutions.com"
 *               gst_no:
 *                 type: string
 *                 pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
 *                 description: GST number (optional)
 *                 example: "22AAAAA0000A1Z5"
 *               ip_whitelisting:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^(\d{1,3}\.){3}\d{1,3}$'
 *                 description: Array of whitelisted IP addresses (optional)
 *                 example: ["192.168.1.1", "10.0.0.1"]
 *               message_tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 8
 *                 description: Array of message tokens (optional, min 8 chars each)
 *                 example: ["token123456", "anothertoken789"]
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Company updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       $ref: '#/components/schemas/Company'
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Company created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 error:
 *                   type: string
 *                   example: "Validation failed"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Company name is required"]
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Error processing company"
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
// create or update company (single route with optional file upload)
router.post('/', 
  uploadCompanyLogo, 
  handleUploadError,
  processCompanyLogo,
  preprocessCompanyFormData,
  validateRequest(createCompanyWithFileSchema), 
  createOrUpdate
);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get company information
 *     description: Retrieves the company information. Only one company can exist in the system.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Company retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "No company found"
 *                 error:
 *                   type: string
 *                   example: "Company not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Error fetching company"
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
// get all companies
router.get('/', getAll);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     description: Retrieves a specific company by its ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *         example: "60d5ecb74b24a1001c8e4b8a"
 *     responses:
 *       200:
 *         description: Company retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Company retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Company not found"
 *                 error:
 *                   type: string
 *                   example: "Company not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Error fetching company"
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
// get company by id
router.get('/:id', validateParams(companyIdParamSchema), getById);

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Delete company
 *     description: Deletes a company by its ID. This will also delete the associated company logo file if it exists.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *         example: "60d5ecb74b24a1001c8e4b8a"
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Company deleted successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Company not found"
 *                 error:
 *                   type: string
 *                   example: "Company not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Error deleting company"
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
// delete company
router.delete('/:id', validateParams(companyIdParamSchema), deleteCompany);

export default router; 
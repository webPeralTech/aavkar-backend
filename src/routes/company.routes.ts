import { Router } from 'express';
import { create, getAll, getById, update, deleteCompany } from '../controllers/company.controller';
import { 
  companyIdParamSchema, 
  createCompanySchema, 
  createCompanyWithFileSchema,
  updateCompanySchema, 
  updateCompanyWithFileSchema,
  validateParams, 
  validateRequest 
} from '../utils/validation';
import { isAdmin } from '../middlewares/auth.middleware';
import {
  uploadCompanyLogo,
  processCompanyLogo,
  handleUploadError,
} from '../middlewares/upload';

const router = Router();

// All routes are protected with admin middleware
router.use(isAdmin);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     tags: [Companies]
 *     summary: Create a new company (Admin only)
 *     description: Create a new company record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
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
 *                 example: Acme Corporation
 *               company_legal_name:
 *                 type: string
 *                 example: Acme Corporation Pvt Ltd
 *               company_logo:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/logo.jpg
 *               company_address:
 *                 type: string
 *                 example: 123 Business District, City, State
 *               primary_contact_number:
 *                 type: string
 *                 example: +1234567890
 *               office_contact_number:
 *                 type: string
 *                 example: +1234567891
 *               email:
 *                 type: string
 *                 format: email
 *                 example: info@acmecorp.com
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: https://acmecorp.com
 *               gst_no:
 *                 type: string
 *                 example: 22AAAAA0000A1Z5
 *               ip_whitelisting:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.1", "192.168.1.2"]
 *               message_tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["token1", "token2"]
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company created successfully
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateRequest(createCompanySchema), create);

/**
 * @swagger
 * /api/companies/upload:
 *   post:
 *     tags: [Companies]
 *     summary: Create a new company with logo upload (Admin only)
 *     description: Create a new company record with multipart form data and logo upload
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
 *                 example: Acme Corporation
 *               company_legal_name:
 *                 type: string
 *                 example: Acme Corporation Pvt Ltd
 *               company_address:
 *                 type: string
 *                 example: 123 Business District, City, State
 *               primary_contact_number:
 *                 type: string
 *                 example: +1234567890
 *               office_contact_number:
 *                 type: string
 *                 example: +1234567891
 *               email:
 *                 type: string
 *                 format: email
 *                 example: info@acmecorp.com
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: https://acmecorp.com
 *               gst_no:
 *                 type: string
 *                 example: 22AAAAA0000A1Z5
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Company logo file (JPEG, PNG, GIF, WebP - max 5MB)
 *               ip_whitelisting:
 *                 type: string
 *                 description: Comma-separated list of IP addresses
 *                 example: 192.168.1.1,192.168.1.2
 *               message_tokens:
 *                 type: string
 *                 description: Comma-separated list of message tokens
 *                 example: token1,token2,token3
 *     responses:
 *       201:
 *         description: Company created successfully with uploaded logo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Company created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       $ref: '#/components/schemas/Company'
 *       400:
 *         description: Validation error or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload', 
  uploadCompanyLogo, 
  handleUploadError, 
  processCompanyLogo, 
  validateRequest(createCompanyWithFileSchema), 
  create
);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     tags: [Companies]
 *     summary: Get all companies with search, pagination and sorting (Admin only)
 *     description: Retrieve a paginated list of companies with optional search and sorting capabilities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term to filter companies (searches in name, email, phone, address, description)
 *         example: "tech"
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of companies per page
 *         example: 10
 *       - name: sortBy
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [name, email, phone, address, description, createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *         example: "name"
 *       - name: sortOrder
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Companies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Companies retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     companies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalCount:
 *                           type: integer
 *                           example: 45
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                         nextPage:
 *                           type: integer
 *                           nullable: true
 *                           example: 2
 *                         prevPage:
 *                           type: integer
 *                           nullable: true
 *                           example: null
 *                     filters:
 *                       type: object
 *                       properties:
 *                         search:
 *                           type: string
 *                           example: "tech"
 *                         sortBy:
 *                           type: string
 *                           example: "name"
 *                         sortOrder:
 *                           type: string
 *                           example: "asc"
 *       403:
 *         description: Access denied - admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     tags: [Companies]
 *     summary: Get company by ID (Admin only)
 *     description: Retrieve a specific company by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validateParams(companyIdParamSchema), getById);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     tags: [Companies]
 *     summary: Update company (Admin only)
 *     description: Update an existing company's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *                 example: Updated Acme Corporation
 *               company_legal_name:
 *                 type: string
 *                 example: Updated Acme Corporation Pvt Ltd
 *               company_logo:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/new-logo.jpg
 *               company_address:
 *                 type: string
 *                 example: 456 New Business District, City, State
 *               primary_contact_number:
 *                 type: string
 *                 example: +1234567890
 *               office_contact_number:
 *                 type: string
 *                 example: +1234567891
 *               email:
 *                 type: string
 *                 format: email
 *                 example: info@acmecorp.com
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: https://acmecorp.com
 *               gst_no:
 *                 type: string
 *                 example: 22AAAAA0000A1Z5
 *               ip_whitelisting:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.1", "192.168.1.2"]
 *               message_tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["token1", "token2"]
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company updated successfully
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', validateParams(companyIdParamSchema), validateRequest(updateCompanySchema), update);

/**
 * @swagger
 * /api/companies/{id}/upload:
 *   put:
 *     tags: [Companies]
 *     summary: Update company with logo upload (Admin only)
 *     description: Update an existing company's information with multipart form data and optional logo upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *                 example: Updated Acme Corporation
 *               company_legal_name:
 *                 type: string
 *                 example: Updated Acme Corporation Pvt Ltd
 *               company_address:
 *                 type: string
 *                 example: 456 New Business District, City, State
 *               primary_contact_number:
 *                 type: string
 *                 example: +1234567890
 *               office_contact_number:
 *                 type: string
 *                 example: +1234567891
 *               email:
 *                 type: string
 *                 format: email
 *                 example: info@acmecorp.com
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: https://acmecorp.com
 *               gst_no:
 *                 type: string
 *                 example: 22AAAAA0000A1Z5
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: New company logo file (optional - JPEG, PNG, GIF, WebP - max 5MB)
 *               ip_whitelisting:
 *                 type: string
 *                 description: Comma-separated list of IP addresses
 *                 example: 192.168.1.1,192.168.1.2
 *               message_tokens:
 *                 type: string
 *                 description: Comma-separated list of message tokens
 *                 example: token1,token2,token3
 *     responses:
 *       200:
 *         description: Company updated successfully with optional new logo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Company updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       $ref: '#/components/schemas/Company'
 *       400:
 *         description: Validation error or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/upload', 
  uploadCompanyLogo, 
  handleUploadError, 
  processCompanyLogo, 
  validateRequest(updateCompanyWithFileSchema), 
  update
);

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     tags: [Companies]
 *     summary: Delete company (Admin only)
 *     description: Delete a company record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company deleted successfully
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied - admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', validateParams(companyIdParamSchema), deleteCompany);

export default router; 
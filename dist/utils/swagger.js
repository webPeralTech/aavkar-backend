"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = exports.setupSwagger = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CRM Backend API',
            version: '1.0.0',
            description: 'A comprehensive Customer Relationship Management (CRM) backend API',
            contact: {
                name: 'API Support',
                email: 'support@crm.com',
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'Authentication related endpoints'
            },
            {
                name: 'Users',
                description: 'User management endpoints'
            },
            {
                name: 'Customers',
                description: 'Customer management endpoints'
            },
            {
                name: 'Companies',
                description: 'Company management endpoints'
            },
            {
                name: 'Products',
                description: 'Product management endpoints'
            },
            {
                name: 'Locations',
                description: 'Location management endpoints'
            }
        ],
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://your-production-url.com'
                    : `http://localhost:${process.env.PORT || 5000}`,
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['admin', 'manager', 'sales', 'support'] },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Customer: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        company: { type: 'string' },
                        jobTitle: { type: 'string' },
                        address: {
                            type: 'object',
                            properties: {
                                street: { type: 'string' },
                                city: { type: 'string' },
                                state: { type: 'string' },
                                zipCode: { type: 'string' },
                                country: { type: 'string' },
                            },
                        },
                        status: { type: 'string', enum: ['lead', 'prospect', 'customer', 'inactive'] },
                        source: {
                            type: 'string',
                            enum: ['website', 'referral', 'social_media', 'cold_call', 'trade_show', 'other'],
                        },
                        assignedTo: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                        notes: { type: 'string' },
                        lastContactDate: { type: 'string', format: 'date-time' },
                        nextFollowUp: { type: 'string', format: 'date-time' },
                        dealValue: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Company: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        company_name: { type: 'string' },
                        company_legal_name: { type: 'string' },
                        company_logo: { type: 'string', format: 'uri' },
                        company_address: { type: 'string' },
                        primary_contact_number: { type: 'string' },
                        office_contact_number: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        website: { type: 'string', format: 'uri' },
                        gst_no: { type: 'string' },
                        ip_whitelisting: { type: 'array', items: { type: 'string' } },
                        message_tokens: { type: 'array', items: { type: 'string' } },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', maxLength: 100 },
                        type: { type: 'string', enum: ['product', 'service'] },
                        unit: { type: 'string', maxLength: 20 },
                        code: { type: 'string', maxLength: 50 },
                        photoUrl: { type: 'string', format: 'uri' },
                        baseCost: { type: 'number', minimum: 0 },
                        description: { type: 'string', maxLength: 500 },
                        isActive: { type: 'boolean', default: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        details: { type: 'array', items: { type: 'string' } },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
            },
        },
    },
    apis: [
        './src/routes/*.ts',
        './src/routes/*.js',
        './src/controllers/*.ts',
        './src/controllers/*.js',
    ],
};
// Generate swagger specification
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.swaggerSpec = swaggerSpec;
const setupSwagger = (app) => {
    // Serve swagger docs
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    // Serve swagger.json
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};
exports.setupSwagger = setupSwagger;

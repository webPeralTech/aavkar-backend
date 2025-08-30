"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import middleware
const logger_1 = require("./middlewares/logger");
// Import routes
const routes_1 = __importDefault(require("./routes"));
// Import utilities
const swagger_1 = require("./utils/swagger");
const logger_2 = __importDefault(require("./utils/logger"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Request logging middleware (before other middleware)
app.use(logger_1.requestLogger);
// Middleware
// const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'https://aavkar-frontend.vercel.app'];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//     credentials: true,
//   })
// );
// CORS configuration - Allow all origins
app.use((0, cors_1.default)({
    origin: true, // Allow all origins 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-Access-Token'
    ],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files (uploaded images)
app.use('/uploads', express_1.default.static('uploads'));
// Setup Swagger documentation
(0, swagger_1.setupSwagger)(app);
// Routes
app.use('/api', routes_1.default);
// Root route handler
app.get('/', (req, res) => {
    logger_2.default.info('Root route accessed');
    res.json({
        message: 'Welcome to CRM Backend API',
        status: 'running',
        documentation: '/api-docs',
        health: '/api/health',
        version: '1.0.0'
    });
});
// Health check endpoint
app.get('/api/health', (req, res) => {
    logger_2.default.info('Health check requested');
    res.json({
        status: 'OK',
        message: 'CRM Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});
// 404 handler
app.use('*', (req, res) => {
    logger_2.default.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
    });
});
// Global error handler
app.use((error, req, res, next) => {
    logger_2.default.error('Global error handler:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
    });
    res.status(error.status || 500).json(Object.assign({ error: error.message || 'Internal server error' }, (process.env.NODE_ENV === 'development' && { stack: error.stack })));
});
exports.default = app;

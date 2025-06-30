import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import middleware
import { requestLogger } from './middlewares/logger';

// Import routes
import routes from './routes';

// Import utilities
import { setupSwagger } from './utils/swagger';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();

// Request logging middleware (before other middleware)
app.use(requestLogger);

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
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://aavkar-frontend.vercel.app',
  'https://aavkar-backend.onrender.com',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Blocked by CORS: ${origin}`), false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use('/api', routes);

// Root route handler
app.get('/', (req, res) => {
  logger.info('Root route accessed');
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
  logger.info('Health check requested');
  res.json({
    status: 'OK',
    message: 'CRM Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Global error handler:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

export default app;

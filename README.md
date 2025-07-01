# CRM Backend API

A production-ready Customer Relationship Management (CRM) backend built with Node.js, TypeScript, Express, and MongoDB. Features comprehensive validation, logging, testing, and API documentation.

## 🚀 Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control
- 👥 **User Management**: Multi-role user system (admin, manager, sales, support)
- 🏢 **Customer Management**: Complete CRUD operations for customer data
- 🔍 **Advanced Search & Filtering**: Search customers by name, email, company
- 📊 **Role-based Permissions**: Different access levels for different user roles
- 📱 **RESTful API**: Clean and well-documented API endpoints
- 🛡️ **Security**: Password hashing, input validation, and secure headers
- ✅ **Request Validation**: Runtime schema validation with Zod
- 📋 **Structured Logging**: High-performance logging with Pino
- 🧪 **Comprehensive Testing**: Unit and integration tests with Jest
- 📚 **API Documentation**: Auto-generated Swagger documentation
- 🔧 **Code Quality**: ESLint and Prettier for consistent code
- 🌍 **Environment Management**: Cross-platform environment configuration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Zod for runtime schema validation
- **Logging**: Pino (high-performance structured logging)
- **Testing**: Jest + Supertest + MongoDB Memory Server
- **Code Quality**: ESLint + Prettier
- **API Documentation**: Swagger UI Express
- **Environment**: dotenv + cross-env

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## ⚡ Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd crm-backend
   npm install
   ```

2. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/crm_database

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRES_IN=7d

   # CORS Configuration
   CLIENT_URL=http://localhost:3000

   # Logging
   LOG_LEVEL=debug
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health
   - API Documentation: http://localhost:5000/api-docs

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run start:dev` | Start built app in development mode |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Features:
- **In-memory MongoDB**: Tests use MongoDB Memory Server for isolation
- **Supertest**: HTTP endpoint testing
- **Test fixtures**: Reusable test data and utilities
- **Coverage reporting**: Detailed coverage reports

## 📚 API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

### Customer Endpoints

| Method | Endpoint | Description | Auth Required | Permissions |
|--------|----------|-------------|---------------|-------------|
| POST | `/api/customers` | Create customer | Yes | All roles |
| GET | `/api/customers` | List customers | Yes | All roles |
| GET | `/api/customers/:id` | Get customer | Yes | Owner/Admin/Manager |
| PUT | `/api/customers/:id` | Update customer | Yes | Owner/Admin/Manager |
| DELETE | `/api/customers/:id` | Delete customer | Yes | Admin/Manager only |

### Query Parameters for Customer List

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (lead, prospect, customer, inactive)
- `source`: Filter by source (website, referral, etc.)
- `search`: Search in name, email, and company
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort direction (asc/desc, default: desc)
- `assignedTo`: Filter by assigned user ID

## 🔧 Code Quality

### ESLint Configuration
- TypeScript-specific rules
- Prettier integration
- Consistent code style enforcement

### Prettier Configuration
- Consistent code formatting
- Automatic formatting on save
- Integration with ESLint

## 📊 Logging

Structured logging with Pino provides:
- **Performance**: High-performance JSON logging
- **Structured Data**: Searchable and parseable logs
- **Environment-specific**: Pretty printing in development, JSON in production
- **Request Tracking**: Automatic HTTP request/response logging

### Log Levels
- `debug`: Detailed debugging information
- `info`: General information
- `warn`: Warning messages
- `error`: Error conditions

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schema validation
- **Role-based Access**: Fine-grained permissions
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Secure configuration management

## 🗄️ Database Schema

### User Model
```typescript
{
  name:string
  email: string; // unique, indexed
  password: string; // hashed
  role: 'admin' | 'manager' | 'sales' | 'support';
  isActive: boolean;
  lastLogin?: Date;
  timestamps: true
}
```

### Customer Model
```typescript
{
  name: string
  email: string; // unique, indexed
  phone?: string;
  company?: string;
  jobTitle?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  source: 'website' | 'referral' | 'social_media' | 'cold_call' | 'trade_show' | 'other';
  assignedTo?: ObjectId; // Reference to User
  tags?: string[];
  notes?: string;
  lastContactDate?: Date;
  nextFollowUp?: Date;
  dealValue?: number;
  timestamps: true
}
```

## 🔍 Request Validation

All endpoints use Zod schemas for validation:

- **Type Safety**: Compile-time and runtime type checking
- **Error Messages**: Detailed validation error responses
- **Schema Reuse**: Consistent validation across endpoints
- **Transform Support**: Data transformation and sanitization

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/crm_prod
JWT_SECRET=super_secure_random_string_at_least_32_chars
LOG_LEVEL=info
CLIENT_URL=https://your-frontend-domain.com
```

### Build Process
```bash
npm run build
npm start
```

### Docker Support (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Performance Features

- **Efficient Queries**: Indexed database fields
- **Pagination**: Prevents large data loads
- **Request Logging**: Performance monitoring
- **Optimized Dependencies**: Production-ready packages
- **Memory Management**: Proper resource cleanup

## 🛠️ Development Workflow

1. **Code**: Write TypeScript code
2. **Validate**: ESLint checks code quality
3. **Format**: Prettier formats code
4. **Test**: Jest runs tests
5. **Build**: TypeScript compiles to JavaScript
6. **Deploy**: Start production server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "sales"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@company.com",
    "company": "ABC Corp",
    "status": "lead",
    "source": "website"
  }'
```

## 📝 License

This project is licensed under the ISC License. 
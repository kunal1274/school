# Technical Design Document (TDD)
## Tuition Management System with Insurance Domain

**Version:** 1.0  
**Date:** October 2, 2024  
**Status:** Production Ready  

---

## 1. Document Overview

### 1.1 Purpose
This Technical Design Document provides detailed technical specifications, architecture decisions, and implementation guidelines for the Tuition Management System with integrated Insurance domain.

### 1.2 Scope
- System architecture and design patterns
- Technology stack and framework choices
- Database design and data modeling
- API design and implementation
- Security architecture
- Performance optimization strategies
- Deployment and infrastructure

### 1.3 Target Audience
- Software developers
- System architects
- DevOps engineers
- Technical leads
- QA engineers

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React Components, Tailwind CSS, State Mgmt) │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (Authentication, Business Logic, Validation)│
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database (Collections, Indexes, Aggregation Pipelines) │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Application   │    │      Data       │
│     Layer       │    │     Layer       │    │     Layer       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React Pages   │    │ • API Routes    │    │ • MongoDB       │
│ • Components    │    │ • Middleware    │    │ • Mongoose      │
│ • Hooks         │    │ • Validation    │    │ • Collections   │
│ • State Mgmt    │    │ • Business Logic│    │ • Indexes       │
│ • UI/UX         │    │ • Authentication│    │ • Aggregations  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Next.js** | 15.5.4 | React Framework | App Router, SSR, API routes, optimization |
| **React** | 18.x | UI Library | Component-based architecture, hooks |
| **Tailwind CSS** | 3.x | Styling | Utility-first, responsive design |
| **JavaScript** | ES2022 | Programming Language | Modern features, async/await |

### 3.2 Backend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Node.js** | 18.x | Runtime | JavaScript ecosystem, performance |
| **Next.js API Routes** | 15.5.4 | API Framework | Integrated with frontend, file-based routing |
| **MongoDB** | 6.x | Database | Document-based, flexible schema |
| **Mongoose** | 7.x | ODM | Schema validation, middleware, queries |

### 3.3 Security & Authentication

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **JWT** | 9.x | Authentication | Stateless, secure token-based auth |
| **bcryptjs** | 2.x | Password Hashing | Secure password storage |
| **httpOnly Cookies** | - | Token Storage | XSS protection, secure storage |

### 3.4 Development Tools

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **ESLint** | 8.x | Linting | Code quality, consistency |
| **Jest** | 29.x | Testing | Unit and integration testing |
| **React Testing Library** | 13.x | Component Testing | User-centric testing approach |
| **Turbopack** | - | Build Tool | Fast development builds |

---

## 4. Database Design

### 4.1 Database Architecture

```
MongoDB Database: tuition_management
├── Core Collections
│   ├── users
│   ├── students
│   ├── teachers
│   ├── customers
│   ├── transport_customers
│   ├── fees
│   └── activity_logs
└── Insurance Collections
    ├── insurers
    ├── policies
    ├── customer_policies
    ├── policy_payments
    └── claims
```

### 4.2 Collection Schemas

#### 4.2.1 Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  passwordHash: String,
  firstName: String,
  lastName: String,
  role: String (enum: ['admin', 'moderator', 'staff']),
  isActive: Boolean (default: true),
  createdAt: Date (indexed),
  updatedAt: Date,
  lastLoginAt: Date
}
```

#### 4.2.2 Students Collection
```javascript
{
  _id: ObjectId,
  name: String (indexed),
  email: String (unique, indexed),
  phone: String,
  address: String,
  enrollmentDate: Date (indexed),
  status: String (enum: ['active', 'inactive']),
  createdAt: Date (indexed),
  updatedAt: Date,
  createdBy: ObjectId (ref: 'users')
}
```

#### 4.2.3 Insurance Collections

**Insurers Collection:**
```javascript
{
  _id: ObjectId,
  name: String (unique, indexed),
  code: String (indexed),
  contactPerson: String,
  phone: String,
  email: String,
  address: String,
  isActive: Boolean (default: true),
  createdAt: Date (indexed),
  updatedAt: Date,
  createdBy: ObjectId (ref: 'users'),
  updatedBy: ObjectId (ref: 'users')
}
```

**Policies Collection:**
```javascript
{
  _id: ObjectId,
  insurerId: ObjectId (ref: 'insurers', indexed),
  name: String (indexed),
  code: String,
  description: String,
  coverageDetails: String,
  termMonths: Number (default: 12),
  premiumAmount: Number (indexed),
  premiumFrequency: String (enum: ['monthly', 'quarterly', 'yearly']),
  minCoverAmount: Number,
  maxCoverAmount: Number,
  active: Boolean (default: true),
  metadata: Object,
  createdAt: Date (indexed),
  updatedAt: Date,
  createdBy: ObjectId (ref: 'users')
}
```

### 4.3 Database Indexes

#### 4.3.1 Performance Indexes
```javascript
// Users
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "isActive": 1 })

// Students
db.students.createIndex({ "email": 1 }, { unique: true })
db.students.createIndex({ "name": 1 })
db.students.createIndex({ "status": 1 })
db.students.createIndex({ "enrollmentDate": 1 })

// Insurance
db.insurers.createIndex({ "name": 1 }, { unique: true })
db.insurers.createIndex({ "code": 1 })
db.policies.createIndex({ "insurerId": 1 })
db.policies.createIndex({ "premiumAmount": 1 })
db.customer_policies.createIndex({ "policyNumber": 1 }, { unique: true })
db.customer_policies.createIndex({ "customerId": 1 })
db.customer_policies.createIndex({ "policyId": 1 })
db.policy_payments.createIndex({ "transactionId": 1 }, { unique: true })
db.policy_payments.createIndex({ "customerPolicyId": 1 })
db.claims.createIndex({ "claimNumber": 1 }, { unique: true })
db.claims.createIndex({ "customerPolicyId": 1 })
```

#### 4.3.2 Compound Indexes
```javascript
// Activity logs for efficient querying
db.activity_logs.createIndex({ "userId": 1, "createdAt": -1 })
db.activity_logs.createIndex({ "action": 1, "entityType": 1 })

// Fee tracking
db.fees.createIndex({ "studentId": 1, "paymentDate": -1 })
db.fees.createIndex({ "status": 1, "dueDate": 1 })
```

---

## 5. API Design

### 5.1 API Architecture

```
API Layer Structure:
├── Authentication Middleware (withAuth)
├── Validation Layer
├── Business Logic Layer
├── Data Access Layer
└── Response Layer
```

### 5.2 API Route Structure

```
/api/
├── auth/
│   ├── login (POST)
│   ├── logout (POST)
│   └── me (GET)
├── students/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── teachers/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── customers/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── fees/
│   ├── route.js (GET, POST)
│   ├── [id]/route.js (GET, PUT, DELETE)
│   └── reports/route.js (GET)
├── insurers/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── policies/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── customer-policies/
│   └── route.js (GET, POST)
├── policy-payments/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── claims/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
└── insurance/
    ├── reports/route.js (GET)
    └── utils/route.js (GET)
```

### 5.3 API Response Format

#### 5.3.1 Success Response
```javascript
{
  success: true,
  data: Object | Array,
  pagination?: {
    page: Number,
    limit: Number,
    total: Number,
    totalPages: Number,
    hasNext: Boolean,
    hasPrev: Boolean
  },
  message?: String
}
```

#### 5.3.2 Error Response
```javascript
{
  success: false,
  error: String,
  errors?: Object, // Field-specific errors
  details?: String // Additional error details
}
```

### 5.4 Authentication Middleware

```javascript
// withAuth middleware implementation
export function withAuth(handler, requiredRole = null) {
  return async (req, context) => {
    try {
      // Extract token from cookies or headers
      const token = extractToken(req);
      
      if (!token) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
      }

      // Verify token and get user
      const user = await getUserFromToken(token);
      
      if (!user || !user.isActive) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      // Check role permissions
      if (requiredRole && !hasPermission(user.role, requiredRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      // Add user to request
      req.user = user;
      return handler(req, context);
    } catch (error) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
  };
}
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
1. User Login
   ├── Validate credentials
   ├── Generate JWT token
   ├── Set httpOnly cookie
   └── Return user data

2. API Request
   ├── Extract token from cookie/header
   ├── Verify JWT signature
   ├── Check user status
   ├── Validate permissions
   └── Process request

3. Token Refresh
   ├── Check token validity
   ├── Generate new token
   ├── Update cookie
   └── Return new token
```

### 6.2 Security Measures

#### 6.2.1 Input Validation
```javascript
// Validation schema example
const userSchema = {
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Valid email required'
  },
  password: {
    required: true,
    type: 'string',
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must contain uppercase, lowercase, and number'
  }
};
```

#### 6.2.2 Data Sanitization
```javascript
// Sanitization functions
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return input;
}

function validateObjectId(id) {
  return ObjectId.isValid(id);
}
```

#### 6.2.3 Role-Based Access Control
```javascript
// Permission matrix
const PERMISSIONS = {
  admin: ['read', 'create', 'update', 'delete', 'manage_users'],
  moderator: ['read', 'create', 'update', 'delete'],
  staff: ['read', 'create', 'update']
};

function hasPermission(userRole, action) {
  return PERMISSIONS[userRole]?.includes(action) || false;
}
```

---

## 7. Frontend Architecture

### 7.1 Component Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group
│   │   └── login/
│   ├── dashboard/
│   ├── students/
│   │   ├── page.js        # List page
│   │   ├── create/
│   │   └── [id]/
│   │       ├── page.js    # View page
│   │       └── edit/
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── forms/            # Form components
│   ├── Layout.js         # Main layout
│   ├── ProtectedRoute.js # Auth wrapper
│   └── CustomDialog.js   # Modal system
├── contexts/             # React contexts
│   └── AuthContext.js    # Authentication context
├── lib/                  # Utilities and configurations
│   ├── auth.js          # Auth utilities
│   ├── models.js        # Database models
│   ├── mongodb.js       # DB connection
│   └── validation.js    # Validation functions
└── scripts/             # Utility scripts
    └── seed.js          # Database seeding
```

### 7.2 State Management

#### 7.2.1 React Hooks Pattern
```javascript
// Custom hook for data fetching
function useEntityData(entityType, filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${entityType}?${new URLSearchParams(filters)}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}
```

#### 7.2.2 Context for Global State
```javascript
// AuthContext for user state
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 7.3 UI Component Design

#### 7.3.1 Reusable Form Components
```javascript
// FormInput component
export function FormInput({ label, name, value, onChange, error, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

#### 7.3.2 Data Table Component
```javascript
// DataTable component with pagination
export function DataTable({ columns, data, pagination, onPageChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <Pagination {...pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
```

---

## 8. Performance Optimization

### 8.1 Database Optimization

#### 8.1.1 Query Optimization
```javascript
// Efficient aggregation pipeline
const payments = await collection.aggregate([
  { $match: filter },
  { $sort: { paymentDate: -1 } },
  { $skip: skip },
  { $limit: limit },
  {
    $lookup: {
      from: 'customer_policies',
      localField: 'customerPolicyId',
      foreignField: '_id',
      as: 'customerPolicy'
    }
  },
  {
    $addFields: {
      customerPolicy: { $arrayElemAt: ['$customerPolicy', 0] }
    }
  }
]).toArray();
```

#### 8.1.2 Indexing Strategy
```javascript
// Compound indexes for common queries
db.fees.createIndex({ "studentId": 1, "paymentDate": -1 });
db.activity_logs.createIndex({ "userId": 1, "createdAt": -1 });
db.policy_payments.createIndex({ "customerPolicyId": 1, "paymentDate": -1 });
```

### 8.2 Frontend Optimization

#### 8.2.1 Code Splitting
```javascript
// Dynamic imports for route-based code splitting
const StudentsPage = dynamic(() => import('./students/page'), {
  loading: () => <LoadingSpinner />
});

const ReportsPage = dynamic(() => import('./reports/page'), {
  loading: () => <LoadingSpinner />
});
```

#### 8.2.2 Caching Strategy
```javascript
// Client-side caching with useMemo
const filteredData = useMemo(() => {
  return data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [data, searchTerm]);

// API response caching
const cache = new Map();
async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);
  return data;
}
```

### 8.3 Build Optimization

#### 8.3.1 Next.js Configuration
```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

---

## 9. Error Handling

### 9.1 API Error Handling

```javascript
// Centralized error handling
export function handleApiError(error, context = '') {
  console.error(`API Error ${context}:`, error);
  
  if (error.name === 'ValidationError') {
    return {
      success: false,
      error: 'Validation failed',
      errors: formatValidationErrors(error.errors)
    };
  }
  
  if (error.name === 'MongoError' && error.code === 11000) {
    return {
      success: false,
      error: 'Duplicate entry found'
    };
  }
  
  return {
    success: false,
    error: 'Internal server error'
  };
}
```

### 9.2 Frontend Error Handling

```javascript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

---

## 10. Testing Strategy

### 10.1 Unit Testing

```javascript
// API route testing
describe('/api/students', () => {
  test('GET /api/students returns student list', async () => {
    const response = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/students creates new student', async () => {
    const studentData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890'
    };

    const response = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${validToken}`)
      .send(studentData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(studentData.name);
  });
});
```

### 10.2 Component Testing

```javascript
// React component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentForm } from '../StudentForm';

describe('StudentForm', () => {
  test('renders form fields', () => {
    render(<StudentForm />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<StudentForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
});
```

---

## 11. Deployment Architecture

### 11.1 Production Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │   Database      │
│   (Nginx)       │◄──►│   (Next.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SSL/TLS       │    │   Environment   │    │   Replica Set   │
│   Certificate   │    │   Variables     │    │   Configuration │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 11.2 Environment Configuration

```javascript
// Environment variables
const config = {
  development: {
    MONGODB_URI: 'mongodb://localhost:27017/tuition_dev',
    JWT_SECRET: 'dev-secret-key',
    NODE_ENV: 'development'
  },
  production: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: 'production'
  }
};
```

### 11.3 Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## 12. Monitoring and Logging

### 12.1 Application Logging

```javascript
// Structured logging
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  error: (message, error, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};
```

### 12.2 Performance Monitoring

```javascript
// API performance tracking
export function withPerformanceTracking(handler) {
  return async (req, context) => {
    const start = Date.now();
    
    try {
      const result = await handler(req, context);
      const duration = Date.now() - start;
      
      logger.info('API request completed', {
        method: req.method,
        url: req.url,
        duration,
        status: result.status
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      logger.error('API request failed', error, {
        method: req.method,
        url: req.url,
        duration
      });
      
      throw error;
    }
  };
}
```

---

## 13. Backup and Recovery

### 13.1 Database Backup Strategy

```bash
#!/bin/bash
# MongoDB backup script

BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="tuition_management"

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE.tar.gz"
```

### 13.2 Data Recovery Process

```javascript
// Data recovery utility
export async function restoreFromBackup(backupFile) {
  try {
    // Stop application
    await stopApplication();
    
    // Restore database
    await exec(`mongorestore --db tuition_management ${backupFile}`);
    
    // Verify data integrity
    const userCount = await db.collection('users').countDocuments();
    const studentCount = await db.collection('students').countDocuments();
    
    logger.info('Data recovery completed', {
      users: userCount,
      students: studentCount
    });
    
    // Restart application
    await startApplication();
    
    return { success: true, message: 'Recovery completed successfully' };
  } catch (error) {
    logger.error('Data recovery failed', error);
    return { success: false, error: error.message };
  }
}
```

---

## 14. Security Considerations

### 14.1 Data Encryption

```javascript
// Sensitive data encryption
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  cipher.setAAD(Buffer.from('tuition-management', 'utf8'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}
```

### 14.2 Rate Limiting

```javascript
// API rate limiting
const rateLimit = new Map();

export function withRateLimit(handler, options = {}) {
  const { windowMs = 15 * 60 * 1000, max = 100 } = options;
  
  return async (req, context) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      const limit = rateLimit.get(ip);
      
      if (now > limit.resetTime) {
        limit.count = 1;
        limit.resetTime = now + windowMs;
      } else if (limit.count >= max) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      } else {
        limit.count++;
      }
    }
    
    return handler(req, context);
  };
}
```

---

## 15. Future Technical Enhancements

### 15.1 Microservices Architecture

```
Current Monolith → Future Microservices
├── User Service (Authentication & Authorization)
├── Student Service (Student Management)
├── Teacher Service (Teacher Management)
├── Fee Service (Fee Collection & Tracking)
├── Insurance Service (Insurance Domain)
├── Notification Service (Email/SMS)
└── Reporting Service (Analytics & Reports)
```

### 15.2 Caching Layer

```javascript
// Redis caching implementation
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

export async function getCachedData(key) {
  try {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    logger.error('Cache read error', error);
    return null;
  }
}

export async function setCachedData(key, data, ttl = 3600) {
  try {
    await client.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    logger.error('Cache write error', error);
  }
}
```

### 15.3 API Gateway

```javascript
// API Gateway configuration
const gateway = {
  routes: [
    {
      path: '/api/students/*',
      service: 'student-service',
      rateLimit: { windowMs: 60000, max: 100 }
    },
    {
      path: '/api/insurance/*',
      service: 'insurance-service',
      rateLimit: { windowMs: 60000, max: 50 }
    }
  ],
  
  middleware: [
    'authentication',
    'rate-limiting',
    'logging',
    'error-handling'
  ]
};
```

---

## 16. Conclusion

This Technical Design Document provides a comprehensive overview of the Tuition Management System's technical architecture, implementation details, and design decisions. The system is built with modern technologies, follows best practices, and is designed for scalability, security, and maintainability.

**Key Technical Achievements:**
- ✅ Modern Next.js architecture with App Router
- ✅ Robust MongoDB database design with proper indexing
- ✅ Comprehensive API design with authentication and validation
- ✅ Secure authentication and authorization system
- ✅ Performance-optimized frontend and backend
- ✅ Comprehensive error handling and logging
- ✅ Production-ready deployment configuration
- ✅ Extensive testing strategy

**System Status:** Production Ready ✅

---

*Document Version: 1.0*  
*Last Updated: October 2, 2024*  
*Total Pages: 16*  
*Status: Technical Implementation Complete*

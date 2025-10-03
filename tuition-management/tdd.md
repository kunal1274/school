# 🔧 **Technical Design Document (TDD)**
## **Tuition Management System with Insurance Module**

---

## **📖 Document Information**

| Field | Value |
|-------|-------|
| **Document Title** | Technical Design Document - Tuition Management System |
| **Version** | 2.0 |
| **Date** | December 2024 |
| **Author** | Development Team |
| **Status** | Production Ready |

---

## **🎯 Executive Summary**

This Technical Design Document outlines the complete technical architecture, implementation details, and system design for the Tuition Management System. The system is built using modern web technologies including Next.js 14, MongoDB, and implements a robust, scalable architecture with comprehensive security measures.

---

## **🏗️ System Architecture**

### **Technology Stack**

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Next.js | 14.x | React framework with SSR/SSG |
| **Frontend** | React | 18.x | UI component library |
| **Frontend** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **Backend** | Next.js API Routes | 14.x | Serverless API endpoints |
| **Database** | MongoDB | 6.x | NoSQL document database |
| **Authentication** | JWT | - | JSON Web Token authentication |
| **Validation** | Custom | - | Client and server-side validation |
| **Deployment** | Vercel | - | Serverless deployment platform |

### **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React Components)                       │
│  ├── Pages (App Router)                                    │
│  ├── Components (Reusable UI)                              │
│  ├── Contexts (State Management)                           │
│  └── Hooks (Custom Logic)                                  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes                                         │
│  ├── Authentication Middleware                              │
│  ├── Validation Layer                                       │
│  ├── Business Logic                                         │
│  └── Database Access Layer                                  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Database                                           │
│  ├── Collections (Tables)                                  │
│  ├── Indexes (Performance)                                 │
│  ├── Relationships (References)                            │
│  └── Backup & Restore                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## **🗄️ Database Design**

### **Database Schema**

#### **Core Collections**

```javascript
// Users Collection
{
  _id: ObjectId,
  email: String (unique, required),
  passwordHash: String (required),
  name: String (required),
  phone: String,
  role: String (enum: ['admin', 'moderator', 'staff']),
  isActive: Boolean (default: true),
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}

// Students Collection
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  dob: Date (required),
  gender: String (enum: ['male', 'female', 'other']),
  classOrBatch: String (required),
  parentName: String (required),
  parentPhone: String (required),
  address: String (required),
  transportOptIn: Boolean (default: false),
  notes: String,
  status: String (enum: ['active', 'inactive']),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}

// Teachers Collection
{
  _id: ObjectId,
  name: String (required),
  email: String (required),
  phone: String (required),
  subject: String (required),
  qualification: String (required),
  experience: Number (required),
  address: String (required),
  joiningDate: Date (required),
  salary: Number (required),
  status: String (enum: ['active', 'inactive']),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}

// Customers Collection
{
  _id: ObjectId,
  name: String (required),
  phone: String (required),
  email: String,
  address: String (required),
  relationToStudent: String (required),
  notes: String,
  status: String (enum: ['active', 'inactive']),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}

// Transport Customers Collection
{
  _id: ObjectId,
  name: String (required),
  phone: String (required),
  vehicleNo: String (required),
  pickupPoint: String (required),
  dropPoint: String (required),
  assignedToStudentId: ObjectId,
  fee: Number (required),
  notes: String,
  status: String (enum: ['active', 'inactive']),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}

// Fees Collection
{
  _id: ObjectId,
  studentId: ObjectId (required),
  feeType: String (required),
  amount: Number (required),
  dueDate: Date (required),
  paymentDate: Date,
  paymentMode: String (required),
  status: String (enum: ['paid', 'pending', 'overdue']),
  notes: String,
  transactionId: String (unique),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}
```

#### **Insurance Collections**

```javascript
// Insurers Collection
{
  _id: ObjectId,
  name: String (required),
  code: String (required, unique),
  contactPerson: String (required),
  phone: String (required),
  email: String (required),
  address: String (required),
  website: String,
  licenseNumber: String (required),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}

// Policies Collection
{
  _id: ObjectId,
  insurerId: ObjectId (required),
  name: String (required),
  policyNumber: String (required, unique),
  premiumAmount: Number (required),
  premiumFrequency: String (enum: ['monthly', 'quarterly', 'yearly']),
  minCoverAmount: Number (required),
  maxCoverAmount: Number (required),
  description: String,
  termsAndConditions: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}

// Customer Policies Collection
{
  _id: ObjectId,
  customerId: ObjectId (required),
  policyId: ObjectId (required),
  startDate: Date (required),
  endDate: Date (required),
  premiumAmount: Number (required),
  paymentFrequency: String (enum: ['monthly', 'quarterly', 'yearly']),
  nextPremiumDueDate: Date (auto-calculated),
  status: String (enum: ['active', 'lapsed', 'cancelled', 'expired']),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}

// Policy Payments Collection
{
  _id: ObjectId,
  customerPolicyId: ObjectId (required),
  amount: Number (required),
  paymentDate: Date (required),
  paymentMode: String (required),
  transactionId: String (required, unique),
  receiptNumber: String (auto-generated),
  notes: String,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}

// Claims Collection
{
  _id: ObjectId,
  customerPolicyId: ObjectId (required),
  claimNumber: String (required, unique),
  dateOfEvent: Date (required),
  amountClaimed: Number (required),
  amountApproved: Number,
  status: String (enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'settled']),
  description: String (required),
  supportingDocuments: [String],
  claimantId: ObjectId,
  handledBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId
}
```

### **Database Indexes**

```javascript
// Performance Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.students.createIndex({ firstName: 1, lastName: 1 })
db.students.createIndex({ parentPhone: 1 })
db.teachers.createIndex({ email: 1 })
db.customers.createIndex({ phone: 1 })
db.fees.createIndex({ studentId: 1, status: 1 })
db.fees.createIndex({ transactionId: 1 }, { unique: true })

// Insurance Indexes
db.insurers.createIndex({ code: 1 }, { unique: true })
db.policies.createIndex({ policyNumber: 1 }, { unique: true })
db.customerPolicies.createIndex({ customerId: 1, policyId: 1 })
db.policyPayments.createIndex({ transactionId: 1 }, { unique: true })
db.claims.createIndex({ claimNumber: 1 }, { unique: true })
db.claims.createIndex({ customerPolicyId: 1 })

// Activity Logs Indexes
db.activityLogs.createIndex({ userId: 1, timestamp: -1 })
db.activityLogs.createIndex({ entityType: 1, timestamp: -1 })
```

---

## **🔐 Authentication & Authorization**

### **JWT Implementation**

```javascript
// JWT Token Structure
{
  userId: ObjectId,
  email: String,
  role: String,
  name: String,
  iat: Number,
  exp: Number
}

// Token Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: '7d',
  algorithm: 'HS256'
}
```

### **Authentication Middleware**

```javascript
// withAuth Middleware
export function withAuth(handler, requiredRole = null) {
  return async (req, context) => {
    try {
      // Extract token from cookies or headers
      const token = extractToken(req);
      
      // Verify token
      const user = await getUserFromToken(token);
      if (!user) {
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

### **Role-Based Access Control**

```javascript
// Role Hierarchy
const ROLE_HIERARCHY = {
  staff: 1,
  moderator: 2,
  admin: 3
};

// Permission Functions
export function hasPermission(userRole, requiredRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canManageUsers(userRole) {
  return userRole === 'admin';
}

export function canDeleteRecords(userRole) {
  return userRole === 'admin' || userRole === 'moderator';
}
```

---

## **🛠️ API Design**

### **API Route Structure**

```
/api/
├── auth/
│   ├── login/route.js
│   ├── logout/route.js
│   └── me/route.js
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
│   └── reports/route.js
├── insurers/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── policies/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── customer-policies/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── policy-payments/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── claims/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── insurance/
│   └── reports/route.js
├── users/
│   ├── route.js (GET, POST)
│   └── [id]/route.js (GET, PUT, DELETE)
├── activity-logs/route.js
└── backup-restore/
    ├── backup/route.js
    ├── backups/route.js
    └── restore/[id]/route.js
```

### **API Response Format**

```javascript
// Success Response
{
  success: true,
  data: Object | Array,
  pagination?: {
    page: Number,
    limit: Number,
    total: Number,
    pages: Number
  },
  message?: String
}

// Error Response
{
  success: false,
  error: String,
  errors?: Object,
  details?: String
}
```

### **API Endpoint Examples**

```javascript
// GET /api/students?page=1&limit=10&search=john
export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    const db = await getDatabase();
    const query = search ? {
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    const students = await db.collection(COLLECTIONS.STUDENTS)
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    const total = await db.collection(COLLECTIONS.STUDENTS).countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}, 'staff');

// POST /api/students
export const POST = withAuth(async (request) => {
  try {
    const data = await request.json();
    
    // Validate data
    const validation = validateStudentData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    const studentData = { ...data };
    addAuditFields(studentData, request.user._id);
    
    const result = await db.collection(COLLECTIONS.STUDENTS).insertOne(studentData);
    
    // Log activity
    await logActivity(
      request.user._id,
      LOG_ACTIONS.CREATE,
      COLLECTIONS.STUDENTS,
      result.insertedId,
      `Created student: ${data.firstName} ${data.lastName}`
    );
    
    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...studentData }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create student' },
      { status: 500 }
    );
  }
}, 'staff');
```

---

## **🎨 Frontend Architecture**

### **Component Structure**

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/
│   │   └── login/page.js
│   ├── dashboard/page.js
│   ├── students/
│   │   ├── page.js
│   │   ├── create/page.js
│   │   └── [id]/
│   │       ├── page.js
│   │       └── edit/page.js
│   ├── api/               # API Routes
│   └── layout.js
├── components/            # Reusable Components
│   ├── Layout.js
│   ├── ProtectedRoute.js
│   ├── CustomDialog.js
│   ├── forms/
│   │   ├── FormInput.js
│   │   ├── FormSelect.js
│   │   └── FormTextarea.js
│   └── DuplicateRecord.js
├── contexts/              # React Contexts
│   └── AuthContext.js
├── lib/                   # Utilities & Helpers
│   ├── auth.js
│   ├── models.js
│   ├── validation.js
│   ├── validation-insurance.js
│   ├── activity-logger.js
│   └── models/            # Mongoose Models
│       ├── insurer.model.js
│       ├── policy.model.js
│       ├── customerPolicy.model.js
│       ├── policyPayment.model.js
│       └── claim.model.js
└── scripts/               # Database Scripts
    ├── seed.js
    └── seed-insurance.js
```

### **State Management**

```javascript
// AuthContext for Global State
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const login = async (email, password) => {
    // Login logic
  };
  
  const logout = async () => {
    // Logout logic
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### **Custom Hooks**

```javascript
// useConfirmationDialog Hook
export function useConfirmationDialog() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null
  });
  
  const showDialog = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      onCancel
    });
  };
  
  const alert = (title, message, type = 'info') => {
    return new Promise((resolve) => {
      showDialog(title, message, type, () => resolve(true));
    });
  };
  
  const confirm = (title, message, type = 'warning') => {
    return new Promise((resolve) => {
      showDialog(title, message, type, () => resolve(true), () => resolve(false));
    });
  };
  
  return { showDialog, alert, confirm, dialogState, setDialogState };
}
```

---

## **🔍 Data Validation**

### **Client-Side Validation**

```javascript
// Form Validation Hook
export function useFormValidation(initialData, validationRules) {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = data[field];
      
      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = `${field} is required`;
        return;
      }
      
      if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || `Invalid ${field} format`;
      }
      
      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `${field} must be at least ${rules.minLength} characters`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return { data, setData, errors, validate };
}
```

### **Server-Side Validation**

```javascript
// Validation Functions
export function validateStudentData(data, isUpdate = false) {
  const errors = {};
  
  if (!validateRequired(data.firstName)) {
    errors.firstName = 'First name is required';
  } else if (!validateLength(data.firstName, 2, 50)) {
    errors.firstName = 'First name must be between 2 and 50 characters';
  }
  
  if (!validateRequired(data.lastName)) {
    errors.lastName = 'Last name is required';
  } else if (!validateLength(data.lastName, 2, 50)) {
    errors.lastName = 'Last name must be between 2 and 50 characters';
  }
  
  if (!validateRequired(data.dob)) {
    errors.dob = 'Date of birth is required';
  } else if (!validateDate(data.dob)) {
    errors.dob = 'Invalid date format';
  }
  
  if (!validateRequired(data.parentPhone)) {
    errors.parentPhone = 'Parent phone is required';
  } else if (!validatePhone(data.parentPhone)) {
    errors.parentPhone = 'Invalid phone number format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

---

## **📊 Activity Logging**

### **Logging System**

```javascript
// Activity Logger
export class ActivityLogger {
  static async logActivity({
    userId,
    action,
    entityType,
    entityId,
    entityName,
    details = {},
    ipAddress = null,
    userAgent = null
  }) {
    try {
      const db = await getDatabase();
      
      const activityLog = {
        userId,
        action,
        entityType,
        entityId,
        entityName,
        details,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        createdAt: new Date()
      };
      
      await db.collection(COLLECTIONS.ACTIVITY_LOGS).insertOne(activityLog);
      return activityLog;
    } catch (error) {
      console.error('Failed to log activity:', error);
      return null;
    }
  }
}
```

### **Audit Trail**

```javascript
// Audit Fields Helper
export function addAuditFields(data, userId, isUpdate = false) {
  const now = new Date();
  
  if (!isUpdate) {
    data.createdAt = now;
    data.createdBy = userId;
  }
  
  data.updatedAt = now;
  data.updatedBy = userId;
  
  return data;
}
```

---

## **🚀 Performance Optimization**

### **Database Optimization**

```javascript
// Query Optimization
export async function getStudentsWithPagination(page = 1, limit = 10, filters = {}) {
  const db = await getDatabase();
  
  // Build query with indexes
  const query = buildQuery(filters);
  
  // Use aggregation pipeline for complex queries
  const pipeline = [
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'creator'
      }
    }
  ];
  
  const [students, total] = await Promise.all([
    db.collection(COLLECTIONS.STUDENTS).aggregate(pipeline).toArray(),
    db.collection(COLLECTIONS.STUDENTS).countDocuments(query)
  ]);
  
  return { students, total };
}
```

### **Frontend Optimization**

```javascript
// Component Memoization
export const StudentCard = memo(({ student, onEdit, onDelete }) => {
  return (
    <div className="student-card">
      {/* Component content */}
    </div>
  );
});

// Lazy Loading
const StudentForm = lazy(() => import('./StudentForm'));

// Virtual Scrolling for Large Lists
export function VirtualizedStudentList({ students }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={students.length}
      itemSize={80}
      itemData={students}
    >
      {StudentRow}
    </FixedSizeList>
  );
}
```

---

## **🔒 Security Implementation**

### **Input Sanitization**

```javascript
// Input Sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// XSS Protection
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

### **CSRF Protection**

```javascript
// CSRF Token Generation
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF Middleware
export function csrfMiddleware(handler) {
  return async (req, context) => {
    if (req.method !== 'GET') {
      const token = req.headers.get('x-csrf-token');
      const sessionToken = req.cookies.get('csrf-token')?.value;
      
      if (!token || token !== sessionToken) {
        return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 });
      }
    }
    
    return handler(req, context);
  };
}
```

---

## **📱 Responsive Design**

### **Tailwind CSS Configuration**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        }
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [],
}
```

### **Responsive Components**

```javascript
// Responsive Layout Component
export function ResponsiveLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />
      <main className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
      }`}>
        {children}
      </main>
    </div>
  );
}
```

---

## **🧪 Testing Strategy**

### **Unit Testing**

```javascript
// Component Testing
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentForm } from './StudentForm';

describe('StudentForm', () => {
  test('renders form fields', () => {
    render(<StudentForm />);
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
  });
  
  test('validates required fields', async () => {
    render(<StudentForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
  });
});
```

### **API Testing**

```javascript
// API Route Testing
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

describe('/api/students', () => {
  test('GET returns students list', async () => {
    const request = new NextRequest('http://localhost:3000/api/students');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
  
  test('POST creates new student', async () => {
    const studentData = {
      firstName: 'John',
      lastName: 'Doe',
      dob: '2010-01-01',
      gender: 'male',
      classOrBatch: 'Grade 5',
      parentName: 'Jane Doe',
      parentPhone: '+1234567890',
      address: '123 Main St'
    };
    
    const request = new NextRequest('http://localhost:3000/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.firstName).toBe('John');
  });
});
```

---

## **🚀 Deployment Configuration**

### **Vercel Configuration**

```javascript
// vercel.json
{
  "functions": {
    "src/app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_URL": "https://tuition-manager.vercel.app"
    }
  }
}
```

### **Environment Variables**

```bash
# .env.local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tuition-management
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### **MongoDB Atlas Configuration**

```javascript
// Database Connection
export async function getDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  await client.connect();
  cachedDb = client.db('tuition-management');
  
  return cachedDb;
}
```

---

## **📈 Monitoring & Analytics**

### **Error Tracking**

```javascript
// Error Boundary
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to monitoring service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### **Performance Monitoring**

```javascript
// Performance Metrics
export function trackPerformance(metricName, value) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metricName,
      value: value
    });
  }
}

// API Response Time Tracking
export function withPerformanceTracking(handler) {
  return async (req, context) => {
    const start = Date.now();
    const response = await handler(req, context);
    const duration = Date.now() - start;
    
    trackPerformance('api_response_time', duration);
    
    return response;
  };
}
```

---

## **📋 Development Guidelines**

### **Code Standards**

```javascript
// ESLint Configuration
module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};

// Prettier Configuration
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2
};
```

### **Git Workflow**

```bash
# Feature Branch Workflow
git checkout -b feature/student-management
git add .
git commit -m "feat: add student CRUD operations"
git push origin feature/student-management

# Pull Request Template
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
```

---

## **📚 API Documentation**

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### **Student Endpoints**

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/students` | List students | Yes | Staff+ |
| POST | `/api/students` | Create student | Yes | Staff+ |
| GET | `/api/students/[id]` | Get student | Yes | Staff+ |
| PUT | `/api/students/[id]` | Update student | Yes | Staff+ |
| DELETE | `/api/students/[id]` | Delete student | Yes | Moderator+ |

### **Insurance Endpoints**

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/insurers` | List insurers | Yes | Staff+ |
| POST | `/api/insurers` | Create insurer | Yes | Moderator+ |
| GET | `/api/policies` | List policies | Yes | Staff+ |
| POST | `/api/policies` | Create policy | Yes | Moderator+ |
| GET | `/api/claims` | List claims | Yes | Staff+ |
| POST | `/api/claims` | Create claim | Yes | Staff+ |

---

## **🎯 Future Enhancements**

### **Planned Features**
- [ ] Real-time notifications
- [ ] Advanced reporting with charts
- [ ] Mobile app development
- [ ] Payment gateway integration
- [ ] Email/SMS notifications
- [ ] Advanced search with filters
- [ ] Data import/export tools
- [ ] Multi-language support

### **Technical Improvements**
- [ ] GraphQL API implementation
- [ ] Redis caching layer
- [ ] Microservices architecture
- [ ] Container deployment
- [ ] Advanced monitoring
- [ ] Automated testing pipeline
- [ ] CI/CD implementation

---

*This Technical Design Document provides comprehensive technical specifications for the Tuition Management System implementation.*
# Functional Design Document (FDD)
## Tuition Management System with Insurance Domain

**Version:** 1.0  
**Date:** October 2, 2024  
**Status:** Production Ready  

---

## 1. Executive Summary

### 1.1 Purpose
This document outlines the functional design of a comprehensive Tuition Management System with integrated Insurance domain, built using Next.js, MongoDB, and modern web technologies.

### 1.2 Scope
The system manages:
- Student and Teacher records
- Customer and Transport customer management
- Fee collection and tracking
- Insurance policy management
- Claims processing
- User authentication and authorization
- Reporting and analytics

### 1.3 Key Features
- Role-based access control (Admin, Moderator, Staff)
- Comprehensive CRUD operations
- Real-time dashboard with KPIs
- Advanced reporting and analytics
- Insurance domain integration
- Audit trail and activity logging

---

## 2. System Architecture

### 2.1 Technology Stack
```
Frontend: Next.js 15.5.4 (App Router), React, Tailwind CSS
Backend: Next.js API Routes, Node.js
Database: MongoDB with Mongoose ODM
Authentication: JWT with httpOnly cookies
Security: bcryptjs, input validation, RBAC
```

### 2.2 System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   API Routes    │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │   Middleware    │    │   Collections   │
│   - Layout      │    │   - withAuth    │    │   - Users       │
│   - Forms       │    │   - Validation  │    │   - Students    │
│   - Tables      │    │   - Logging     │    │   - Insurance   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 3. Functional Requirements

### 3.1 User Management

#### 3.1.1 User Authentication
- **Login**: Email/password authentication
- **Session Management**: JWT tokens with 7-day expiration
- **Logout**: Secure session termination
- **Password Security**: bcryptjs hashing

#### 3.1.2 User Roles
| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, all CRUD operations |
| **Moderator** | Most CRUD operations, limited user management, reports |
| **Staff** | View/create records, limited edit, no delete permissions |

### 3.2 Core Entity Management

#### 3.2.1 Student Management
- **Create**: Add new student with personal details, contact info, enrollment date
- **Read**: View student list with search, filter, pagination
- **Update**: Edit student information
- **Delete**: Remove student records (Admin/Moderator only)
- **Fields**: Name, email, phone, address, enrollment date, status

#### 3.2.2 Teacher Management
- **Create**: Add teacher with qualifications, subjects, salary info
- **Read**: View teacher list with search and filtering
- **Update**: Edit teacher details
- **Delete**: Remove teacher records (Admin/Moderator only)
- **Fields**: Name, email, phone, subjects, qualifications, salary, hire date

#### 3.2.3 Customer Management
- **Create**: Add customer with contact details and preferences
- **Read**: View customer list with search functionality
- **Update**: Edit customer information
- **Delete**: Remove customer records (Admin/Moderator only)
- **Fields**: Name, email, phone, address, customer type, status

#### 3.2.4 Transport Customer Management
- **Create**: Add transport customer with route and payment details
- **Read**: View transport customers with route filtering
- **Update**: Edit transport customer information
- **Delete**: Remove transport customer records (Admin/Moderator only)
- **Fields**: Name, route, pickup/drop points, monthly fee, payment status

### 3.3 Fee Management

#### 3.3.1 Fee Collection
- **Create**: Record fee payments with amount, date, payment mode
- **Read**: View fee records with filtering by student, date, status
- **Update**: Edit fee payment details
- **Delete**: Remove fee records (Admin/Moderator only)
- **Fields**: Student, amount, payment date, mode, reference, status

#### 3.3.2 Fee Tracking
- **Outstanding Fees**: Track unpaid fees by student
- **Payment History**: Complete payment history per student
- **Reports**: Generate fee collection reports
- **Analytics**: Fee collection trends and statistics

---

## 4. Insurance Domain

### 4.1 Insurer Management
- **Create**: Add insurance companies with contact details
- **Read**: View insurer list with search functionality
- **Update**: Edit insurer information
- **Delete**: Remove insurer records (Admin only)
- **Fields**: Name, code, contact person, phone, email, address, status

### 4.2 Policy Management
- **Create**: Define insurance policies with coverage details
- **Read**: View policy catalog with filtering
- **Update**: Edit policy details
- **Delete**: Remove policy records (Admin only)
- **Fields**: Name, code, description, coverage, term, premium, frequency

### 4.3 Customer Policy Assignment
- **Create**: Assign policies to customers with specific terms
- **Read**: View customer policy assignments
- **Update**: Modify policy assignments
- **Delete**: Remove policy assignments (Admin only)
- **Fields**: Customer, policy, policy number, start/end dates, status, premium

### 4.4 Policy Payment Processing
- **Create**: Record premium payments with transaction details
- **Read**: View payment history with filtering
- **Update**: Edit payment records
- **Delete**: Remove payment records (Admin only)
- **Fields**: Transaction ID, amount, payment date, mode, reference, receipt

### 4.5 Claims Management
- **Create**: Submit insurance claims with supporting documents
- **Read**: View claims with status filtering
- **Update**: Process claims (status updates, approvals)
- **Delete**: Remove claim records (Admin only)
- **Fields**: Claim number, policy, amount claimed, amount approved, status, documents

---

## 5. Business Rules

### 5.1 Authentication Rules
- Users must be authenticated to access the system
- Session tokens expire after 7 days
- Inactive users cannot access the system
- Password must meet security requirements

### 5.2 Data Validation Rules
- Email addresses must be unique and valid format
- Phone numbers must be in valid international format
- Required fields cannot be empty
- Date fields must be valid dates
- Numeric fields must be positive values

### 5.3 Insurance Business Rules
- Policy numbers must be unique across the system
- Premium amounts must be positive
- Policy start date must be before end date
- Payments only allowed for active policies
- Claims follow defined lifecycle: draft → submitted → under review → approved/rejected → settled
- Approved claim amounts cannot exceed claimed amounts

### 5.4 Access Control Rules
- Admin: Full system access
- Moderator: Most operations, limited user management
- Staff: View/create operations, limited edit permissions

---

## 6. User Interface Design

### 6.1 Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Header/Navigation                    │
├─────────────────┬───────────────────────────────────────┤
│                 │                                       │
│    Sidebar      │           Main Content                │
│   Navigation    │                                       │
│                 │                                       │
│                 │                                       │
└─────────────────┴───────────────────────────────────────┘
```

### 6.2 Navigation Structure
- **Dashboard**: Overview with KPIs and statistics
- **Students**: Student management
- **Teachers**: Teacher management
- **Customers**: Customer management
- **Transport**: Transport customer management
- **Fees**: Fee management and tracking
- **Reports**: Analytics and reporting
- **Insurance Section**:
  - Insurers
  - Policies
  - Customer Policies
  - Policy Payments
  - Claims
  - Insurance Reports

### 6.3 Common UI Components
- **Data Tables**: Sortable, filterable, paginated
- **Forms**: Validation, error handling, success feedback
- **Modals**: Confirmation dialogs, form overlays
- **Breadcrumbs**: Navigation context
- **Search/Filter**: Advanced filtering capabilities
- **Loading States**: User feedback during operations

---

## 7. Data Model

### 7.1 Core Entities
```
User {
  _id: ObjectId
  email: String (unique)
  passwordHash: String
  firstName: String
  lastName: String
  role: Enum [admin, moderator, staff]
  isActive: Boolean
  createdAt: Date
  updatedAt: Date
}

Student {
  _id: ObjectId
  name: String
  email: String
  phone: String
  address: String
  enrollmentDate: Date
  status: Enum [active, inactive]
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId (ref: User)
}
```

### 7.2 Insurance Entities
```
Insurer {
  _id: ObjectId
  name: String (unique)
  code: String
  contactPerson: String
  phone: String
  email: String
  address: String
  isActive: Boolean
  createdAt: Date
  updatedAt: Date
}

Policy {
  _id: ObjectId
  insurerId: ObjectId (ref: Insurer)
  name: String
  code: String
  description: String
  coverageDetails: String
  termMonths: Number
  premiumAmount: Number
  premiumFrequency: Enum [monthly, quarterly, yearly]
  minCoverAmount: Number
  maxCoverAmount: Number
  active: Boolean
  createdAt: Date
  updatedAt: Date
}

CustomerPolicy {
  _id: ObjectId
  policyId: ObjectId (ref: Policy)
  insurerId: ObjectId (ref: Insurer)
  customerId: ObjectId (ref: Customer)
  insuredPersonId: ObjectId
  insuredPersonModel: Enum [Customer, Student, Teacher]
  policyNumber: String (unique)
  startDate: Date
  endDate: Date
  status: Enum [active, lapsed, cancelled, expired]
  sumInsured: Number
  premium: Number
  premiumFrequency: String
  nextPremiumDueDate: Date
  notes: String
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId (ref: User)
}
```

---

## 8. API Specifications

### 8.1 Authentication Endpoints
```
POST /api/auth/login
- Body: { email, password }
- Response: { success, token, user }

POST /api/auth/logout
- Headers: Authorization: Bearer <token>
- Response: { success, message }

GET /api/auth/me
- Headers: Authorization: Bearer <token>
- Response: { success, user }
```

### 8.2 Core Entity Endpoints
```
GET /api/students?page=1&limit=10&search=name
POST /api/students
GET /api/students/:id
PUT /api/students/:id
DELETE /api/students/:id

GET /api/teachers?page=1&limit=10&search=name
POST /api/teachers
GET /api/teachers/:id
PUT /api/teachers/:id
DELETE /api/teachers/:id
```

### 8.3 Insurance Endpoints
```
GET /api/insurers?page=1&limit=10&search=name
POST /api/insurers
GET /api/insurers/:id
PUT /api/insurers/:id
DELETE /api/insurers/:id

GET /api/policies?page=1&limit=10&insurerId=xxx
POST /api/policies
GET /api/policies/:id
PUT /api/policies/:id
DELETE /api/policies/:id

GET /api/customer-policies?page=1&limit=10&customerId=xxx
POST /api/customer-policies
GET /api/customer-policies/:id
PUT /api/customer-policies/:id
DELETE /api/customer-policies/:id

GET /api/policy-payments?page=1&limit=10&customerPolicyId=xxx
POST /api/policy-payments
GET /api/policy-payments/:id
PUT /api/policy-payments/:id
DELETE /api/policy-payments/:id

GET /api/claims?page=1&limit=10&status=submitted
POST /api/claims
GET /api/claims/:id
PUT /api/claims/:id
DELETE /api/claims/:id
```

---

## 9. Security Requirements

### 9.1 Authentication Security
- JWT tokens with secure secret
- httpOnly cookies for token storage
- Password hashing with bcryptjs (12 rounds)
- Session timeout after 7 days

### 9.2 Authorization Security
- Role-based access control (RBAC)
- Permission checks on all operations
- Resource-level access control
- Admin-only operations protection

### 9.3 Data Security
- Input validation and sanitization
- XSS prevention
- CSRF protection
- SQL injection prevention
- ObjectId validation

### 9.4 Audit Security
- Activity logging for all operations
- User action tracking
- Data change audit trail
- Error logging and monitoring

---

## 10. Performance Requirements

### 10.1 Response Times
- Page load: < 2 seconds
- API response: < 500ms
- Database queries: < 100ms
- Search operations: < 1 second

### 10.2 Scalability
- Support 1000+ concurrent users
- Handle 10,000+ records per entity
- Efficient pagination for large datasets
- Optimized database queries

### 10.3 Availability
- 99.9% uptime target
- Graceful error handling
- Fallback mechanisms
- Data backup and recovery

---

## 11. Reporting and Analytics

### 11.1 Dashboard Metrics
- Total students, teachers, customers
- Fee collection statistics
- Outstanding payments
- Insurance policy statistics
- Claims processing metrics

### 11.2 Financial Reports
- Fee collection reports
- Payment trends
- Outstanding amounts
- Revenue analytics

### 11.3 Insurance Reports
- Policy performance metrics
- Claims processing statistics
- Premium collection reports
- Insurer performance analysis

---

## 12. Integration Requirements

### 12.1 External Integrations
- Email notifications (future)
- SMS integration (future)
- Payment gateway integration (future)
- Document storage (future)

### 12.2 Data Export/Import
- CSV export functionality
- Excel export capability
- Data backup and restore
- Bulk import operations

---

## 13. Testing Requirements

### 13.1 Unit Testing
- Component testing with React Testing Library
- Utility function testing
- Validation function testing
- API route testing

### 13.2 Integration Testing
- Authentication flow testing
- CRUD operation testing
- Business rule validation testing
- Error handling testing

### 13.3 User Acceptance Testing
- End-to-end user workflows
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing

---

## 14. Deployment and Maintenance

### 14.1 Deployment
- Production-ready build process
- Environment configuration
- Database migration scripts
- Security configuration

### 14.2 Maintenance
- Regular security updates
- Performance monitoring
- Database optimization
- User feedback collection

---

## 15. Future Enhancements

### 15.1 Planned Features
- Email notifications for premium due dates
- SMS integration for reminders
- Advanced reporting with charts
- Mobile app development
- API rate limiting
- Multi-language support

### 15.2 Scalability Improvements
- Microservices architecture
- Caching layer implementation
- CDN integration
- Load balancing
- Database sharding

---

## 16. Conclusion

The Tuition Management System with Insurance Domain provides a comprehensive solution for managing educational institutions with integrated insurance services. The system is designed with modern technologies, robust security, and scalable architecture to meet current and future requirements.

**Key Achievements:**
- ✅ Complete CRUD operations for all entities
- ✅ Role-based access control implementation
- ✅ Comprehensive insurance domain integration
- ✅ Advanced reporting and analytics
- ✅ Production-ready security measures
- ✅ Responsive and user-friendly interface

**System Status:** Production Ready ✅

---

*Document Version: 1.0*  
*Last Updated: October 2, 2024*  
*Total Pages: 16*  
*Status: Approved for Production*

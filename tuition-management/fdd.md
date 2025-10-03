# 📋 **Functional Design Document (FDD)**
## **Tuition Management System with Insurance Module**

---

## **📖 Document Information**

| Field | Value |
|-------|-------|
| **Document Title** | Functional Design Document - Tuition Management System |
| **Version** | 2.0 |
| **Date** | December 2024 |
| **Author** | Development Team |
| **Status** | Production Ready |

---

## **🎯 Executive Summary**

The Tuition Management System is a comprehensive web application designed to manage educational institutions' operations, including student management, fee collection, teacher administration, and insurance services. The system provides role-based access control, real-time reporting, and seamless integration between tuition and insurance modules.

---

## **🏗️ System Architecture Overview**

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React Pages   │    │ • REST APIs     │    │ • Collections   │
│ • Components    │    │ • Authentication│    │ • Indexes       │
│ • State Mgmt    │    │ • Validation    │    │ • Relationships │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Module Structure**
```
Tuition Management System
├── Tuition Module
│   ├── Student Management
│   ├── Teacher Management
│   ├── Customer Management
│   ├── Transport Management
│   ├── Fee Management
│   └── Reports & Analytics
└── Insurance Module
    ├── Insurer Management
    ├── Policy Management
    ├── Customer Policy Management
    ├── Policy Payment Management
    ├── Claims Management
    └── Insurance Reports
```

---

## **👥 User Roles & Permissions**

### **Role Hierarchy**
```
Admin (Level 3)
├── Full system access
├── User management
├── System settings
└── Data backup/restore

Moderator (Level 2)
├── CRUD operations on all entities
├── View reports
└── Manage data (except users)

Staff (Level 1)
├── View all data
├── Create/Update records
└── Limited delete permissions
```

### **Permission Matrix**

| Feature | Admin | Moderator | Staff |
|---------|-------|-----------|-------|
| **User Management** | ✅ Full | ❌ None | ❌ None |
| **Student CRUD** | ✅ Full | ✅ Full | ✅ Create/Update |
| **Teacher CRUD** | ✅ Full | ✅ Full | ✅ Create/Update |
| **Customer CRUD** | ✅ Full | ✅ Full | ✅ Create/Update |
| **Fee Management** | ✅ Full | ✅ Full | ✅ Create/Update |
| **Insurance CRUD** | ✅ Full | ✅ Full | ✅ Create/Update |
| **Reports** | ✅ Full | ✅ Full | ✅ View Only |
| **Settings** | ✅ Full | ❌ None | ❌ None |
| **Backup/Restore** | ✅ Full | ❌ None | ❌ None |

---

## **🎓 Tuition Module - Functional Requirements**

### **1. Student Management**

#### **1.1 Student Registration**
- **Functional Requirement**: System shall allow authorized users to register new students
- **Input Fields**:
  - First Name (Required, 2-50 characters)
  - Last Name (Required, 2-50 characters)
  - Date of Birth (Required, valid date)
  - Gender (Required, Male/Female/Other)
  - Class/Batch (Required, text)
  - Parent Name (Required, 2-100 characters)
  - Parent Phone (Required, valid phone format)
  - Address (Required, 5-500 characters)
  - Transport Opt-in (Boolean)
  - Notes (Optional, 0-1000 characters)
  - Status (Active/Inactive)

#### **1.2 Student Information Management**
- **View Student Details**: Display complete student information
- **Edit Student Information**: Update student details with validation
- **Delete Student**: Soft delete with confirmation
- **Duplicate Student**: Create copy of existing student record

#### **1.3 Student Search & Filtering**
- **Search Criteria**:
  - Name (first name, last name)
  - Class/Batch
  - Parent name
  - Phone number
- **Filter Options**:
  - Status (Active/Inactive)
  - Transport (Yes/No)
  - Date range (registration date)

#### **1.4 Student List Management**
- **Pagination**: 10, 25, 50, 100 records per page
- **Sorting**: By name, class, registration date
- **Bulk Operations**: Export, duplicate multiple records

### **2. Teacher Management**

#### **2.1 Teacher Registration**
- **Input Fields**:
  - Name (Required, 2-100 characters)
  - Email (Required, valid email format)
  - Phone (Required, valid phone format)
  - Subject (Required, text)
  - Qualification (Required, text)
  - Experience (Required, numeric)
  - Address (Required, 5-500 characters)
  - Joining Date (Required, valid date)
  - Salary (Required, numeric > 0)
  - Status (Active/Inactive)

#### **2.2 Teacher Operations**
- **CRUD Operations**: Create, Read, Update, Delete
- **Search & Filter**: By name, subject, qualification, status
- **Duplicate Functionality**: Copy teacher records

### **3. Customer Management**

#### **3.1 Customer Registration**
- **Input Fields**:
  - Name (Required, 2-100 characters)
  - Phone (Required, valid phone format)
  - Email (Optional, valid email format)
  - Address (Required, 5-500 characters)
  - Relation to Student (Required, text)
  - Notes (Optional, 0-1000 characters)
  - Status (Active/Inactive)

#### **3.2 Customer Operations**
- **CRUD Operations**: Complete customer lifecycle management
- **Relationship Management**: Link customers to students
- **Communication Tracking**: Notes and interaction history

### **4. Transport Customer Management**

#### **4.1 Transport Registration**
- **Input Fields**:
  - Name (Required, 2-100 characters)
  - Phone (Required, valid phone format)
  - Vehicle Number (Required, text)
  - Pickup Point (Required, text)
  - Drop Point (Required, text)
  - Assigned Student (Optional, dropdown)
  - Fee (Required, numeric > 0)
  - Notes (Optional, 0-1000 characters)
  - Status (Active/Inactive)

#### **4.2 Transport Operations**
- **Route Management**: Define and manage transport routes
- **Student Assignment**: Link students to transport services
- **Fee Management**: Track transport fees

### **5. Fee Management**

#### **5.1 Fee Collection**
- **Input Fields**:
  - Student (Required, dropdown)
  - Fee Type (Required, dropdown)
  - Amount (Required, numeric > 0)
  - Due Date (Required, valid date)
  - Payment Date (Optional, valid date)
  - Payment Mode (Required, dropdown)
  - Status (Paid/Pending/Overdue)
  - Notes (Optional, 0-1000 characters)

#### **5.2 Fee Tracking**
- **Payment Status**: Track payment status in real-time
- **Overdue Management**: Identify and manage overdue payments
- **Receipt Generation**: Generate payment receipts
- **Fee Reports**: Comprehensive fee collection reports

#### **5.3 Fee Analytics**
- **Collection Reports**: Monthly, quarterly, yearly reports
- **Outstanding Reports**: Pending and overdue fee reports
- **Payment Trends**: Payment pattern analysis

---

## **🛡️ Insurance Module - Functional Requirements**

### **1. Insurer Management**

#### **1.1 Insurer Registration**
- **Input Fields**:
  - Name (Required, 2-100 characters)
  - Code (Required, 2-20 characters, unique)
  - Contact Person (Required, 2-100 characters)
  - Phone (Required, valid phone format)
  - Email (Required, valid email format)
  - Address (Required, 5-500 characters)
  - Website (Optional, valid URL)
  - License Number (Required, text)
  - Status (Active/Inactive)

#### **1.2 Insurer Operations**
- **CRUD Operations**: Complete insurer lifecycle management
- **Policy Association**: Link insurers to policies
- **Performance Tracking**: Track insurer performance metrics

### **2. Policy Management**

#### **2.1 Policy Creation**
- **Input Fields**:
  - Insurer (Required, dropdown)
  - Policy Name (Required, 2-200 characters)
  - Policy Number (Auto-generated, unique)
  - Premium Amount (Required, numeric > 0)
  - Premium Frequency (Monthly/Quarterly/Yearly)
  - Min Cover Amount (Required, numeric > 0)
  - Max Cover Amount (Required, numeric > 0)
  - Description (Optional, 0-2000 characters)
  - Terms & Conditions (Optional, 0-5000 characters)
  - Status (Active/Inactive)

#### **2.2 Policy Operations**
- **Policy Lifecycle**: Create, activate, modify, deactivate
- **Coverage Management**: Define coverage limits and terms
- **Premium Calculation**: Automatic premium calculations

### **3. Customer Policy Management**

#### **3.1 Policy Assignment**
- **Input Fields**:
  - Customer (Required, dropdown)
  - Policy (Required, dropdown)
  - Start Date (Required, valid date)
  - End Date (Required, valid date)
  - Premium Amount (Required, numeric > 0)
  - Payment Frequency (Monthly/Quarterly/Yearly)
  - Next Premium Due (Auto-calculated)
  - Status (Active/Lapsed/Cancelled/Expired)

#### **3.2 Policy Tracking**
- **Status Management**: Track policy status changes
- **Renewal Management**: Handle policy renewals
- **Coverage Tracking**: Monitor coverage periods

### **4. Policy Payment Management**

#### **4.1 Payment Processing**
- **Input Fields**:
  - Customer Policy (Required, dropdown)
  - Amount (Required, numeric > 0)
  - Payment Date (Required, valid date)
  - Payment Mode (Cash/Cheque/Online/Bank Transfer)
  - Transaction ID (Required, unique)
  - Receipt Number (Auto-generated)
  - Notes (Optional, 0-1000 characters)

#### **4.2 Payment Tracking**
- **Payment History**: Complete payment history
- **Outstanding Tracking**: Track pending payments
- **Receipt Management**: Generate and manage receipts

### **5. Claims Management**

#### **5.1 Claim Submission**
- **Input Fields**:
  - Customer Policy (Required, dropdown)
  - Claim Number (Auto-generated, unique)
  - Date of Event (Required, valid date)
  - Amount Claimed (Required, numeric > 0)
  - Amount Approved (Optional, numeric)
  - Status (Draft/Submitted/Under Review/Approved/Rejected/Settled)
  - Description (Required, 10-2000 characters)
  - Supporting Documents (Optional, file upload)

#### **5.2 Claim Processing**
- **Status Workflow**: Draft → Submitted → Under Review → Approved/Rejected → Settled
- **Document Management**: Upload and manage supporting documents
- **Approval Process**: Multi-level approval workflow

---

## **📊 Reporting & Analytics**

### **1. Tuition Reports**

#### **1.1 Student Reports**
- **Student List**: Complete student directory
- **Class-wise Reports**: Students by class/batch
- **Transport Reports**: Students using transport services
- **Status Reports**: Active/inactive student reports

#### **1.2 Fee Reports**
- **Collection Reports**: Daily, monthly, yearly collection
- **Outstanding Reports**: Pending and overdue fees
- **Payment Trends**: Payment pattern analysis
- **Revenue Reports**: Income and revenue tracking

#### **1.3 Teacher Reports**
- **Teacher Directory**: Complete teacher information
- **Subject-wise Reports**: Teachers by subject
- **Performance Reports**: Teacher performance metrics

### **2. Insurance Reports**

#### **2.1 Policy Reports**
- **Policy Summary**: Active, lapsed, cancelled policies
- **Premium Reports**: Premium collection and outstanding
- **Coverage Reports**: Coverage analysis and trends

#### **2.2 Claims Reports**
- **Claims Summary**: Claims by status and amount
- **Settlement Reports**: Claims settlement analysis
- **Performance Reports**: Insurer performance metrics

---

## **🔐 Security Requirements**

### **1. Authentication**
- **JWT-based Authentication**: Secure token-based authentication
- **Session Management**: 7-day token expiration
- **Password Security**: bcrypt hashing with salt rounds

### **2. Authorization**
- **Role-based Access Control**: Admin, Moderator, Staff roles
- **Permission Matrix**: Granular permission system
- **Route Protection**: Protected routes and API endpoints

### **3. Data Security**
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery prevention
- **SQL Injection Protection**: MongoDB injection prevention

---

## **📱 User Interface Requirements**

### **1. Design Principles**
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliance
- **Consistency**: Uniform design language
- **Usability**: Intuitive user experience

### **2. Navigation**
- **Sidebar Navigation**: Collapsible sidebar with module organization
- **Breadcrumb Navigation**: Clear navigation path
- **Search Functionality**: Global and entity-specific search
- **Quick Actions**: Shortcut buttons for common actions

### **3. Forms & Input**
- **Form Validation**: Real-time validation feedback
- **Error Handling**: Clear error messages and recovery
- **Loading States**: Visual feedback during operations
- **Success Feedback**: Confirmation of successful operations

---

## **⚡ Performance Requirements**

### **1. Response Times**
- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **Search Results**: < 1 second
- **Report Generation**: < 5 seconds

### **2. Scalability**
- **Concurrent Users**: Support 100+ concurrent users
- **Data Volume**: Handle 10,000+ records per entity
- **File Uploads**: Support up to 10MB file uploads
- **Database Performance**: Optimized queries with indexes

---

## **🔄 Integration Requirements**

### **1. External Integrations**
- **WhatsApp Integration**: Send notifications via WhatsApp
- **Email Integration**: Email notifications and reports
- **SMS Integration**: SMS notifications (future)
- **Payment Gateway**: Online payment integration (future)

### **2. Data Import/Export**
- **Excel Import**: Bulk data import from Excel
- **CSV Export**: Data export in CSV format
- **PDF Reports**: Generate PDF reports
- **Backup/Restore**: Complete data backup and restore

---

## **📋 Business Rules**

### **1. Data Validation Rules**
- **Required Fields**: All mandatory fields must be filled
- **Format Validation**: Email, phone, date format validation
- **Range Validation**: Numeric ranges and limits
- **Uniqueness**: Unique constraints on key fields

### **2. Business Logic Rules**
- **Fee Calculation**: Automatic fee calculation based on rules
- **Policy Renewal**: Automatic policy renewal notifications
- **Status Transitions**: Valid status transition rules
- **Approval Workflows**: Multi-level approval processes

### **3. Audit Requirements**
- **Activity Logging**: All user actions logged
- **Data Changes**: Track all data modifications
- **User Tracking**: Track user sessions and activities
- **Compliance**: Meet data protection requirements

---

## **🎯 Success Criteria**

### **1. Functional Success**
- ✅ All CRUD operations working correctly
- ✅ Role-based access control implemented
- ✅ Reports generating accurately
- ✅ Data validation working properly

### **2. Performance Success**
- ✅ Page load times under 2 seconds
- ✅ API response times under 500ms
- ✅ System handling 100+ concurrent users
- ✅ Database queries optimized

### **3. User Experience Success**
- ✅ Intuitive navigation and user interface
- ✅ Responsive design across all devices
- ✅ Clear error messages and feedback
- ✅ Consistent user experience

---

## **📝 Appendices**

### **A. Glossary**
- **CRUD**: Create, Read, Update, Delete operations
- **RBAC**: Role-Based Access Control
- **JWT**: JSON Web Token
- **API**: Application Programming Interface
- **UI/UX**: User Interface/User Experience

### **B. References**
- Next.js Documentation
- MongoDB Documentation
- React Documentation
- Tailwind CSS Documentation

---

*This Functional Design Document serves as the comprehensive guide for the Tuition Management System's functionality and requirements.*
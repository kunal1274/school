# Tuition Management System - API Documentation

## Overview

The Tuition Management System provides a comprehensive REST API for managing students, teachers, customers, fees, and system administration.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints (except health check and login) require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check

#### GET /api/health

Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication

#### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/logout

Logout the current user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me

Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

### Students

#### GET /api/students

Get a list of students with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `class` (string): Filter by class/batch
- `status` (string): Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "dob": "2010-01-01",
      "gender": "male",
      "classOrBatch": "10th Grade",
      "parentName": "Jane Doe",
      "parentPhone": "+91-9876543210",
      "address": "123 Main St",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST /api/students

Create a new student.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "2010-01-01",
  "gender": "male",
  "classOrBatch": "10th Grade",
  "parentName": "Jane Doe",
  "parentPhone": "+91-9876543210",
  "address": "123 Main St",
  "status": "active",
  "transportOptIn": false,
  "notes": "Additional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    // ... other fields
  }
}
```

#### GET /api/students/[id]

Get a specific student by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    // ... other fields
  }
}
```

#### PUT /api/students/[id]

Update a specific student.

**Request Body:** Same as POST /api/students

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    // ... updated fields
  }
}
```

#### DELETE /api/students/[id]

Delete a specific student.

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

### Teachers

Similar endpoints exist for teachers at `/api/teachers` with the same structure.

### Customers

Similar endpoints exist for customers at `/api/customers` with the same structure.

### Transport Customers

Similar endpoints exist for transport customers at `/api/transport-customers` with the same structure.

### Fees

#### GET /api/fees

Get a list of fees with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `status` (string): Filter by status (paid, pending, overdue)
- `payerType` (string): Filter by payer type (student, teacher, customer, transport)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "transactionId": "TXN-000001",
      "payerType": "student",
      "payerId": "507f1f77bcf86cd799439012",
      "amount": 5000,
      "currency": "INR",
      "modeOfPayment": "upi",
      "payeeName": "John Doe",
      "payeePhone": "+91-9876543210",
      "reference": "Monthly tuition fee - October 2024",
      "date": "2024-10-01T00:00:00.000Z",
      "status": "paid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST /api/fees

Create a new fee record.

**Request Body:**
```json
{
  "payerType": "student",
  "payerId": "507f1f77bcf86cd799439012",
  "amount": 5000,
  "currency": "INR",
  "modeOfPayment": "upi",
  "payeeName": "John Doe",
  "payeePhone": "+91-9876543210",
  "reference": "Monthly tuition fee - October 2024",
  "date": "2024-10-01",
  "status": "paid"
}
```

### Users (Admin Only)

Similar endpoints exist for users at `/api/users` with the same structure. Only accessible by admin users.

### Activity Logs (Admin Only)

#### GET /api/activity-logs

Get system activity logs.

**Query Parameters:**
- `userId` (string): Filter by user ID
- `entityType` (string): Filter by entity type
- `action` (string): Filter by action
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date
- `limit` (number): Items per page (default: 50)
- `skip` (number): Number of items to skip

### Backup & Restore (Admin Only)

#### POST /api/backup-restore/backup

Create a system backup.

**Response:**
```json
{
  "success": true,
  "data": {
    "backupId": "backup_2024-01-01T00-00-00-000Z",
    "metadata": {
      "size": 1024000,
      "recordCount": 150,
      "collections": ["users", "students", "teachers", "customers", "transport_customers", "fees"]
    }
  }
}
```

#### GET /api/backup-restore/backups

Get list of available backups.

#### POST /api/backup-restore/restore/[id]

Restore from a specific backup.

**Request Body:**
```json
{
  "clearExisting": true,
  "collections": ["students", "teachers"]
}
```

#### DELETE /api/backup-restore/backup/[id]

Delete a specific backup.

#### GET /api/backup-restore/export

Export data in various formats.

**Query Parameters:**
- `format` (string): Export format (json, csv)
- `collections` (string): Comma-separated list of collections to export

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "Specific field error"
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse. Current limits:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

## Pagination

Most list endpoints support pagination with the following parameters:
- `page`: Page number (1-based)
- `limit`: Items per page (max 100)

Pagination metadata is included in the response:
```json
{
  "pagination": {
    "total": 1000,
    "page": 1,
    "limit": 10,
    "totalPages": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

import clientPromise from './mongodb';

export async function getDatabase() {
  const client = await clientPromise;
  return client.db('tuition-management');
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  CUSTOMERS: 'customers',
  TRANSPORT_CUSTOMERS: 'transport_customers',
  FEES: 'fees',
  ACTIVITY_LOGS: 'activity_logs'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  STAFF: 'staff'
};

// Fee payer types
export const PAYER_TYPES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  CUSTOMER: 'customer',
  TRANSPORT: 'transport'
};

// Payment modes
export const PAYMENT_MODES = {
  CASH: 'cash',
  UPI: 'upi',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  OTHER: 'other'
};

// Status types
export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Activity log actions
export const LOG_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete'
};

// Helper function to add audit fields
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

// Helper function to log activity
export async function logActivity(userId, action, collectionName, documentId, summary) {
  try {
    const db = await getDatabase();
    const activityLog = {
      userId,
      action,
      collectionName,
      documentId,
      summary,
      timestamp: new Date()
    };
    
    await db.collection(COLLECTIONS.ACTIVITY_LOGS).insertOne(activityLog);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Create indexes for better performance
export async function createIndexes() {
  try {
    const db = await getDatabase();
    
    // Users indexes
    await db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true });
    
    // Students indexes
    await db.collection(COLLECTIONS.STUDENTS).createIndex({ studentCode: 1 }, { unique: true });
    await db.collection(COLLECTIONS.STUDENTS).createIndex({ parentPhone: 1 });
    
    // Teachers indexes
    await db.collection(COLLECTIONS.TEACHERS).createIndex({ teacherCode: 1 }, { unique: true });
    
    // Fees indexes
    await db.collection(COLLECTIONS.FEES).createIndex({ transactionId: 1 }, { unique: true });
    await db.collection(COLLECTIONS.FEES).createIndex({ payerId: 1 });
    await db.collection(COLLECTIONS.FEES).createIndex({ date: -1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Failed to create indexes:', error);
  }
}

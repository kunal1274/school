import { getDatabase, COLLECTIONS } from '../models.js';

/**
 * CustomerPolicy Model - Represents policy instances assigned to customers
 */
export class CustomerPolicyModel {
  static async create(customerPolicyData) {
    const db = await getDatabase();
    const customerPolicy = {
      ...customerPolicyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTIONS.CUSTOMER_POLICIES).insertOne(customerPolicy);
    return { ...customerPolicy, _id: result.insertedId };
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CUSTOMER_POLICIES).findOne({ _id: id });
  }

  static async findAll(filters = {}, options = {}) {
    const db = await getDatabase();
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    
    const cursor = db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const customerPolicies = await cursor.toArray();
    const total = await db.collection(COLLECTIONS.CUSTOMER_POLICIES).countDocuments(filters);
    
    return {
      data: customerPolicies,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    };
  }

  static async update(id, updateData) {
    const db = await getDatabase();
    const update = {
      ...updateData,
      updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTIONS.CUSTOMER_POLICIES).updateOne(
      { _id: id },
      { $set: update }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Customer Policy not found or no changes made');
    }
    
    return await this.findById(id);
  }

  static async delete(id) {
    const db = await getDatabase();
    const result = await db.collection(COLLECTIONS.CUSTOMER_POLICIES).deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      throw new Error('Customer Policy not found');
    }
    
    return { success: true };
  }

  static async findByCustomer(customerId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .find({ customerId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findByPolicy(policyId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .find({ policyId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findByPolicyNumber(policyNumber) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CUSTOMER_POLICIES).findOne({ policyNumber });
  }

  static async findActive() {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async updateStatus(id, status) {
    const db = await getDatabase();
    const result = await db.collection(COLLECTIONS.CUSTOMER_POLICIES).updateOne(
      { _id: id },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Customer Policy not found');
    }
    
    return await this.findById(id);
  }

  static async getCustomerPolicyWithDetails(customerPolicyId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CUSTOMER_POLICIES).aggregate([
      { $match: { _id: customerPolicyId } },
      {
        $lookup: {
          from: COLLECTIONS.POLICIES,
          localField: 'policyId',
          foreignField: '_id',
          as: 'policy'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.INSURERS,
          localField: 'insurerId',
          foreignField: '_id',
          as: 'insurer'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.CUSTOMERS,
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$policy' },
      { $unwind: '$insurer' },
      { $unwind: '$customer' }
    ]).toArray();
  }

  static async generatePolicyNumber(insurerCode) {
    const db = await getDatabase();
    const year = new Date().getFullYear();
    const prefix = `INS-${insurerCode}-${year}`;
    
    // Find the highest sequence number for this prefix
    const lastPolicy = await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .findOne(
        { policyNumber: { $regex: `^${prefix}-` } },
        { sort: { policyNumber: -1 } }
      );
    
    let sequence = 1;
    if (lastPolicy) {
      const lastSequence = parseInt(lastPolicy.policyNumber.split('-').pop());
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  static async calculateNextPremiumDueDate(startDate, premiumFrequency) {
    const start = new Date(startDate);
    const nextDue = new Date(start);
    
    switch (premiumFrequency) {
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      case 'yearly':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      default:
        nextDue.setFullYear(nextDue.getFullYear() + 1);
    }
    
    return nextDue;
  }
}

// Validation schema for CustomerPolicy
export const customerPolicyValidationSchema = {
  policyId: {
    required: true,
    type: 'objectId',
    message: 'Policy ID is required'
  },
  insurerId: {
    required: true,
    type: 'objectId',
    message: 'Insurer ID is required'
  },
  customerId: {
    required: true,
    type: 'objectId',
    message: 'Customer ID is required'
  },
  insuredPersonId: {
    required: false,
    type: 'objectId',
    message: 'Insured Person ID must be a valid ObjectId'
  },
  insuredPersonModel: {
    required: false,
    type: 'string',
    enum: ['Customer', 'Student', 'Teacher'],
    message: 'Insured Person Model must be Customer, Student, or Teacher'
  },
  policyNumber: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 50,
    message: 'Policy number is required and must be 5-50 characters'
  },
  startDate: {
    required: false,
    type: 'date',
    message: 'Start date must be a valid date'
  },
  endDate: {
    required: false,
    type: 'date',
    message: 'End date must be a valid date'
  },
  status: {
    required: false,
    type: 'string',
    enum: ['active', 'lapsed', 'cancelled', 'expired'],
    message: 'Status must be active, lapsed, cancelled, or expired'
  },
  sumInsured: {
    required: false,
    type: 'number',
    min: 0,
    message: 'Sum insured must be a positive number'
  },
  premium: {
    required: false,
    type: 'number',
    min: 0,
    message: 'Premium must be a positive number'
  },
  premiumFrequency: {
    required: false,
    type: 'string',
    enum: ['monthly', 'quarterly', 'yearly'],
    message: 'Premium frequency must be monthly, quarterly, or yearly'
  },
  nextPremiumDueDate: {
    required: false,
    type: 'date',
    message: 'Next premium due date must be a valid date'
  },
  notes: {
    required: false,
    type: 'string',
    maxLength: 1000,
    message: 'Notes must be less than 1000 characters'
  }
};

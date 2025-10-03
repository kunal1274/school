import { getDatabase, COLLECTIONS } from '../models.js';

/**
 * Policy Model - Represents insurance products offered by insurers
 */
export class PolicyModel {
  static async create(policyData) {
    const db = await getDatabase();
    const policy = {
      ...policyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTIONS.POLICIES).insertOne(policy);
    return { ...policy, _id: result.insertedId };
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICIES).findOne({ _id: id });
  }

  static async findAll(filters = {}, options = {}) {
    const db = await getDatabase();
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    
    const cursor = db.collection(COLLECTIONS.POLICIES)
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const policies = await cursor.toArray();
    const total = await db.collection(COLLECTIONS.POLICIES).countDocuments(filters);
    
    return {
      data: policies,
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
    
    const result = await db.collection(COLLECTIONS.POLICIES).updateOne(
      { _id: id },
      { $set: update }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Policy not found or no changes made');
    }
    
    return await this.findById(id);
  }

  static async delete(id) {
    const db = await getDatabase();
    const result = await db.collection(COLLECTIONS.POLICIES).deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      throw new Error('Policy not found');
    }
    
    return { success: true };
  }

  static async findByInsurer(insurerId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICIES)
      .find({ insurerId, active: true })
      .sort({ name: 1 })
      .toArray();
  }

  static async findActive() {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICIES)
      .find({ active: true })
      .sort({ name: 1 })
      .toArray();
  }

  static async findByCode(code) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICIES).findOne({ code });
  }

  static async getPolicyWithInsurer(policyId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICIES).aggregate([
      { $match: { _id: policyId } },
      {
        $lookup: {
          from: COLLECTIONS.INSURERS,
          localField: 'insurerId',
          foreignField: '_id',
          as: 'insurer'
        }
      },
      { $unwind: '$insurer' }
    ]).toArray();
  }
}

// Validation schema for Policy
export const policyValidationSchema = {
  insurerId: {
    required: true,
    type: 'objectId',
    message: 'Insurer ID is required'
  },
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
    message: 'Policy name is required and must be 2-100 characters'
  },
  code: {
    required: false,
    type: 'string',
    maxLength: 20,
    pattern: /^[A-Z0-9_-]+$/,
    message: 'Policy code must contain only uppercase letters, numbers, hyphens, and underscores'
  },
  description: {
    required: false,
    type: 'string',
    maxLength: 1000,
    message: 'Description must be less than 1000 characters'
  },
  coverageDetails: {
    required: false,
    type: 'string',
    maxLength: 2000,
    message: 'Coverage details must be less than 2000 characters'
  },
  termMonths: {
    required: false,
    type: 'number',
    min: 1,
    max: 1200,
    message: 'Term must be between 1 and 1200 months'
  },
  premiumAmount: {
    required: true,
    type: 'number',
    min: 0,
    message: 'Premium amount must be a positive number'
  },
  premiumFrequency: {
    required: false,
    type: 'string',
    enum: ['monthly', 'quarterly', 'yearly'],
    message: 'Premium frequency must be monthly, quarterly, or yearly'
  },
  minCoverAmount: {
    required: false,
    type: 'number',
    min: 0,
    message: 'Minimum cover amount must be a positive number'
  },
  maxCoverAmount: {
    required: false,
    type: 'number',
    min: 0,
    message: 'Maximum cover amount must be a positive number'
  },
  active: {
    required: false,
    type: 'boolean',
    message: 'Active must be a boolean value'
  }
};

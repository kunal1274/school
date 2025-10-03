import { getDatabase, COLLECTIONS } from '../models.js';

/**
 * Insurer Model - Represents insurance companies
 */
export class InsurerModel {
  static async create(insurerData) {
    const db = await getDatabase();
    const insurer = {
      ...insurerData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTIONS.INSURERS).insertOne(insurer);
    return { ...insurer, _id: result.insertedId };
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.INSURERS).findOne({ _id: id });
  }

  static async findAll(filters = {}, options = {}) {
    const db = await getDatabase();
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    
    const cursor = db.collection(COLLECTIONS.INSURERS)
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const insurers = await cursor.toArray();
    const total = await db.collection(COLLECTIONS.INSURERS).countDocuments(filters);
    
    return {
      data: insurers,
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
    
    const result = await db.collection(COLLECTIONS.INSURERS).updateOne(
      { _id: id },
      { $set: update }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Insurer not found or no changes made');
    }
    
    return await this.findById(id);
  }

  static async delete(id) {
    const db = await getDatabase();
    const result = await db.collection(COLLECTIONS.INSURERS).deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      throw new Error('Insurer not found');
    }
    
    return { success: true };
  }

  static async findActive() {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.INSURERS)
      .find({ isActive: true })
      .sort({ name: 1 })
      .toArray();
  }

  static async findByCode(code) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.INSURERS).findOne({ code });
  }
}

// Validation schema for Insurer
export const insurerValidationSchema = {
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
    message: 'Insurer name is required and must be 2-100 characters'
  },
  code: {
    required: false,
    type: 'string',
    maxLength: 20,
    pattern: /^[A-Z0-9_-]+$/,
    message: 'Insurer code must contain only uppercase letters, numbers, hyphens, and underscores'
  },
  contactPerson: {
    required: false,
    type: 'string',
    maxLength: 100,
    message: 'Contact person name must be less than 100 characters'
  },
  phone: {
    required: false,
    type: 'string',
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Phone number must be a valid international format'
  },
  email: {
    required: false,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email must be a valid email address'
  },
  address: {
    required: false,
    type: 'string',
    maxLength: 500,
    message: 'Address must be less than 500 characters'
  },
  notes: {
    required: false,
    type: 'string',
    maxLength: 1000,
    message: 'Notes must be less than 1000 characters'
  },
  isActive: {
    required: false,
    type: 'boolean',
    message: 'isActive must be a boolean value'
  }
};

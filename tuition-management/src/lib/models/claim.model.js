import { getDatabase, COLLECTIONS } from '../models.js';

/**
 * Claim Model - Represents insurance claims raised against customer policies
 */
export class ClaimModel {
  static async create(claimData) {
    const db = await getDatabase();
    const claim = {
      ...claimData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTIONS.CLAIMS).insertOne(claim);
    return { ...claim, _id: result.insertedId };
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CLAIMS).findOne({ _id: id });
  }

  static async findAll(filters = {}, options = {}) {
    const db = await getDatabase();
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    
    const cursor = db.collection(COLLECTIONS.CLAIMS)
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const claims = await cursor.toArray();
    const total = await db.collection(COLLECTIONS.CLAIMS).countDocuments(filters);
    
    return {
      data: claims,
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
    
    const result = await db.collection(COLLECTIONS.CLAIMS).updateOne(
      { _id: id },
      { $set: update }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Claim not found or no changes made');
    }
    
    return await this.findById(id);
  }

  static async delete(id) {
    const db = await getDatabase();
    const result = await db.collection(COLLECTIONS.CLAIMS).deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      throw new Error('Claim not found');
    }
    
    return { success: true };
  }

  static async findByCustomerPolicy(customerPolicyId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CLAIMS)
      .find({ customerPolicyId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findByClaimNumber(claimNumber) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CLAIMS).findOne({ claimNumber });
  }

  static async findByStatus(status) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CLAIMS)
      .find({ status })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async updateStatus(id, status, handledBy = null) {
    const db = await getDatabase();
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (handledBy) {
      updateData.handledBy = handledBy;
    }
    
    const result = await db.collection(COLLECTIONS.CLAIMS).updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Claim not found');
    }
    
    return await this.findById(id);
  }

  static async getClaimWithDetails(claimId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CLAIMS).aggregate([
      { $match: { _id: claimId } },
      {
        $lookup: {
          from: COLLECTIONS.CUSTOMER_POLICIES,
          localField: 'customerPolicyId',
          foreignField: '_id',
          as: 'customerPolicy'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.POLICIES,
          localField: 'customerPolicy.policyId',
          foreignField: '_id',
          as: 'policy'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.INSURERS,
          localField: 'customerPolicy.insurerId',
          foreignField: '_id',
          as: 'insurer'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.CUSTOMERS,
          localField: 'customerPolicy.customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: 'claimantId',
          foreignField: '_id',
          as: 'claimant'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: 'handledBy',
          foreignField: '_id',
          as: 'handler'
        }
      },
      { $unwind: '$customerPolicy' },
      { $unwind: '$policy' },
      { $unwind: '$insurer' },
      { $unwind: '$customer' },
      { $unwind: { path: '$claimant', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$handler', preserveNullAndEmptyArrays: true } }
    ]).toArray();
  }

  static async generateClaimNumber() {
    const db = await getDatabase();
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `CLM-${year}${month}`;
    
    // Find the highest sequence number for this month
    const lastClaim = await db.collection(COLLECTIONS.CLAIMS)
      .findOne(
        { claimNumber: { $regex: `^${prefix}-` } },
        { sort: { claimNumber: -1 } }
      );
    
    let sequence = 1;
    if (lastClaim) {
      const lastSequence = parseInt(lastClaim.claimNumber.split('-').pop());
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  static async getClaimsByDateRange(startDate, endDate) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CLAIMS)
      .find({
        dateOfEvent: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
      .sort({ dateOfEvent: -1 })
      .toArray();
  }

  static async getClaimsSummaryByStatus() {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CLAIMS).aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmountClaimed: { $sum: '$amountClaimed' },
          totalAmountApproved: { $sum: '$amountApproved' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
  }

  static async getClaimsByInsurer(insurerId, startDate, endDate) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.CLAIMS).aggregate([
      {
        $lookup: {
          from: COLLECTIONS.CUSTOMER_POLICIES,
          localField: 'customerPolicyId',
          foreignField: '_id',
          as: 'customerPolicy'
        }
      },
      { $unwind: '$customerPolicy' },
      {
        $match: {
          'customerPolicy.insurerId': insurerId,
          dateOfEvent: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      { $sort: { dateOfEvent: -1 } }
    ]).toArray();
  }

  static async getClaimStatistics() {
    const db = await getDatabase();
    const stats = await db.collection(COLLECTIONS.CLAIMS).aggregate([
      {
        $group: {
          _id: null,
          totalClaims: { $sum: 1 },
          totalAmountClaimed: { $sum: '$amountClaimed' },
          totalAmountApproved: { $sum: '$amountApproved' },
          averageClaimAmount: { $avg: '$amountClaimed' },
          averageApprovedAmount: { $avg: '$amountApproved' }
        }
      }
    ]).toArray();
    
    const statusStats = await this.getClaimsSummaryByStatus();
    
    return {
      overall: stats[0] || {
        totalClaims: 0,
        totalAmountClaimed: 0,
        totalAmountApproved: 0,
        averageClaimAmount: 0,
        averageApprovedAmount: 0
      },
      byStatus: statusStats
    };
  }
}

// Validation schema for Claim
export const claimValidationSchema = {
  claimNumber: {
    required: true,
    type: 'string',
    minLength: 10,
    maxLength: 50,
    message: 'Claim number is required and must be 10-50 characters'
  },
  customerPolicyId: {
    required: true,
    type: 'objectId',
    message: 'Customer Policy ID is required'
  },
  claimantId: {
    required: false,
    type: 'objectId',
    message: 'Claimant ID must be a valid ObjectId'
  },
  dateOfEvent: {
    required: false,
    type: 'date',
    message: 'Date of event must be a valid date'
  },
  amountClaimed: {
    required: false,
    type: 'number',
    min: 0,
    message: 'Amount claimed must be a positive number'
  },
  amountApproved: {
    required: false,
    type: 'number',
    min: 0,
    message: 'Amount approved must be a positive number'
  },
  status: {
    required: false,
    type: 'string',
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'settled'],
    message: 'Status must be draft, submitted, under_review, approved, rejected, or settled'
  },
  supportingDocs: {
    required: false,
    type: 'array',
    message: 'Supporting documents must be an array of URLs'
  },
  notes: {
    required: false,
    type: 'string',
    maxLength: 2000,
    message: 'Notes must be less than 2000 characters'
  },
  handledBy: {
    required: false,
    type: 'objectId',
    message: 'Handler ID must be a valid ObjectId'
  }
};

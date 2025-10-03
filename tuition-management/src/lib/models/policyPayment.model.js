import { getDatabase, COLLECTIONS } from '../models.js';

/**
 * PolicyPayment Model - Represents premium payments for customer policies
 */
export class PolicyPaymentModel {
  static async create(paymentData) {
    const db = await getDatabase();
    const payment = {
      ...paymentData,
      createdAt: new Date()
    };
    
    const result = await db.collection(COLLECTIONS.POLICY_PAYMENTS).insertOne(payment);
    return { ...payment, _id: result.insertedId };
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICY_PAYMENTS).findOne({ _id: id });
  }

  static async findAll(filters = {}, options = {}) {
    const db = await getDatabase();
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    
    const cursor = db.collection(COLLECTIONS.POLICY_PAYMENTS)
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const payments = await cursor.toArray();
    const total = await db.collection(COLLECTIONS.POLICY_PAYMENTS).countDocuments(filters);
    
    return {
      data: payments,
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
    const result = await db.collection(COLLECTIONS.POLICY_PAYMENTS).updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Policy Payment not found or no changes made');
    }
    
    return await this.findById(id);
  }

  static async delete(id) {
    const db = await getDatabase();
    const result = await db.collection(COLLECTIONS.POLICY_PAYMENTS).deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      throw new Error('Policy Payment not found');
    }
    
    return { success: true };
  }

  static async findByCustomerPolicy(customerPolicyId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICY_PAYMENTS)
      .find({ customerPolicyId })
      .sort({ paymentDate: -1 })
      .toArray();
  }

  static async findByTransactionId(transactionId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICY_PAYMENTS).findOne({ transactionId });
  }

  static async getPaymentWithDetails(paymentId) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICY_PAYMENTS).aggregate([
      { $match: { _id: paymentId } },
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
      { $unwind: '$customerPolicy' },
      { $unwind: '$policy' },
      { $unwind: '$insurer' },
      { $unwind: '$customer' }
    ]).toArray();
  }

  static async getPaymentSummary(customerPolicyId) {
    const db = await getDatabase();
    const result = await db.collection(COLLECTIONS.POLICY_PAYMENTS).aggregate([
      { $match: { customerPolicyId } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          lastPaymentDate: { $max: '$paymentDate' },
          firstPaymentDate: { $min: '$paymentDate' }
        }
      }
    ]).toArray();
    
    return result[0] || {
      totalPayments: 0,
      totalAmount: 0,
      lastPaymentDate: null,
      firstPaymentDate: null
    };
  }

  static async generateTransactionId() {
    const db = await getDatabase();
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const prefix = `PAY-${year}${month}${day}`;
    
    // Find the highest sequence number for this date
    const lastPayment = await db.collection(COLLECTIONS.POLICY_PAYMENTS)
      .findOne(
        { transactionId: { $regex: `^${prefix}-` } },
        { sort: { transactionId: -1 } }
      );
    
    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.transactionId.split('-').pop());
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  static async getPaymentsByDateRange(startDate, endDate) {
    const db = await getDatabase();
    return await db.collection(COLLECTIONS.POLICY_PAYMENTS)
      .find({
        paymentDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
      .sort({ paymentDate: -1 })
      .toArray();
  }

  static async getTotalPaymentsByInsurer(insurerId, startDate, endDate) {
    const db = await getDatabase();
    const result = await db.collection(COLLECTIONS.POLICY_PAYMENTS).aggregate([
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
          paymentDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPayments: { $sum: 1 }
        }
      }
    ]).toArray();
    
    return result[0] || { totalAmount: 0, totalPayments: 0 };
  }
}

// Validation schema for PolicyPayment
export const policyPaymentValidationSchema = {
  transactionId: {
    required: true,
    type: 'string',
    minLength: 10,
    maxLength: 50,
    message: 'Transaction ID is required and must be 10-50 characters'
  },
  customerPolicyId: {
    required: true,
    type: 'objectId',
    message: 'Customer Policy ID is required'
  },
  payerId: {
    required: false,
    type: 'objectId',
    message: 'Payer ID must be a valid ObjectId'
  },
  amount: {
    required: true,
    type: 'number',
    min: 0.01,
    message: 'Amount must be a positive number greater than 0'
  },
  currency: {
    required: false,
    type: 'string',
    enum: ['INR', 'USD', 'EUR'],
    message: 'Currency must be INR, USD, or EUR'
  },
  paymentDate: {
    required: false,
    type: 'date',
    message: 'Payment date must be a valid date'
  },
  modeOfPayment: {
    required: false,
    type: 'string',
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'],
    message: 'Mode of payment must be cash, upi, card, bank_transfer, or other'
  },
  reference: {
    required: false,
    type: 'string',
    maxLength: 200,
    message: 'Reference must be less than 200 characters'
  },
  receiptUrl: {
    required: false,
    type: 'string',
    maxLength: 500,
    message: 'Receipt URL must be less than 500 characters'
  }
};

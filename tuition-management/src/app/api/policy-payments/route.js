import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getDatabase } from '@/lib/models';
import { COLLECTIONS, logActivity } from '@/lib/models';
import { validatePolicyPaymentData } from '@/lib/validation-insurance';
import { ObjectId } from 'mongodb';

// GET /api/policy-payments - List policy payments with filtering
export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const customerPolicyId = searchParams.get('customerPolicyId');
    const status = searchParams.get('status');
    const modeOfPayment = searchParams.get('modeOfPayment');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDatabase();
    const collection = db.collection(COLLECTIONS.POLICY_PAYMENTS);

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    if (customerPolicyId) {
      filter.customerPolicyId = new ObjectId(customerPolicyId);
    }

    if (modeOfPayment) {
      filter.modeOfPayment = modeOfPayment;
    }

    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await collection.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Fetch payments with population
    const payments = await collection
      .aggregate([
        { $match: filter },
        { $sort: { paymentDate: -1 } },
        { $skip: skip },
        { $limit: limit },
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
            localField: 'policy.insurerId',
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
            localField: 'payerId',
            foreignField: '_id',
            as: 'payer'
          }
        },
        {
          $addFields: {
            customerPolicy: { $arrayElemAt: ['$customerPolicy', 0] },
            policy: { $arrayElemAt: ['$policy', 0] },
            insurer: { $arrayElemAt: ['$insurer', 0] },
            customer: { $arrayElemAt: ['$customer', 0] },
            payer: { $arrayElemAt: ['$payer', 0] }
          }
        }
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching policy payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch policy payments' },
      { status: 500 }
    );
  }
});

// POST /api/policy-payments - Create new policy payment
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    
    // Validate payment data
    const validation = validatePolicyPaymentData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const paymentsCollection = db.collection(COLLECTIONS.POLICY_PAYMENTS);
    const customerPoliciesCollection = db.collection(COLLECTIONS.CUSTOMER_POLICIES);

    // Check if customer policy exists and is active
    const customerPolicy = await customerPoliciesCollection.findOne({
      _id: new ObjectId(body.customerPolicyId)
    });

    if (!customerPolicy) {
      return NextResponse.json(
        { success: false, error: 'Customer policy not found' },
        { status: 404 }
      );
    }

    if (customerPolicy.status === 'cancelled' || customerPolicy.status === 'expired') {
      return NextResponse.json(
        { success: false, error: 'Cannot make payments for cancelled or expired policies' },
        { status: 400 }
      );
    }

    // Generate unique transaction ID
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await paymentsCollection.countDocuments({
      transactionId: { $regex: `^PAY-${dateStr}-` }
    });
    const transactionId = `PAY-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Prepare payment data
    const paymentData = {
      ...body,
      customerPolicyId: new ObjectId(body.customerPolicyId),
      payerId: body.payerId ? new ObjectId(body.payerId) : null,
      transactionId,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      createdBy: new ObjectId(request.user._id),
      createdAt: new Date()
    };

    // Create payment
    const result = await paymentsCollection.insertOne(paymentData);

    // Update next premium due date based on frequency
    if (customerPolicy.premiumFrequency && customerPolicy.premiumFrequency !== 'one-time') {
      const nextDueDate = calculateNextPremiumDueDate(
        new Date(paymentData.paymentDate),
        customerPolicy.premiumFrequency
      );

      await customerPoliciesCollection.updateOne(
        { _id: new ObjectId(body.customerPolicyId) },
        { 
          $set: { 
            nextPremiumDueDate: nextDueDate,
            updatedAt: new Date()
          }
        }
      );
    }

    // Log activity
    await logActivity(
      new ObjectId(request.user._id),
      'CREATE',
      'PolicyPayment',
      result.insertedId,
      `Created payment ${transactionId} for policy ${customerPolicy.policyNumber}`,
      { paymentData }
    );

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...paymentData },
      message: 'Policy payment created successfully'
    });

  } catch (error) {
    console.error('Error creating policy payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create policy payment' },
      { status: 500 }
    );
  }
});

// Helper function to calculate next premium due date
function calculateNextPremiumDueDate(currentDate, frequency) {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      // For one-time payments, don't set next due date
      return null;
  }
  
  return nextDate;
}

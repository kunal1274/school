import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES, PAYER_TYPES } from '@/lib/models';
import { withAuth, canEditAllRecords } from '@/lib/auth';
import { validateFeeData } from '@/lib/validation';

// Generate unique transaction ID
async function generateTransactionId(db) {
  const lastFee = await db.collection(COLLECTIONS.FEES)
    .findOne({}, { sort: { transactionId: -1 } });
  
  let nextNumber = 1;
  if (lastFee && lastFee.transactionId) {
    const match = lastFee.transactionId.match(/TXN-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `TXN-${nextNumber.toString().padStart(6, '0')}`;
}

// GET /api/fees - List fees
export const GET = withAuth(async (req, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const payerType = searchParams.get('payerType') || '';
    const modeOfPayment = searchParams.get('modeOfPayment') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDatabase();
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { payeeName: { $regex: search, $options: 'i' } },
        { payeePhone: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }
    if (payerType) {
      query.payerType = payerType;
    }
    if (modeOfPayment) {
      query.modeOfPayment = modeOfPayment;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // If user is staff, only show their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    // Get total count
    const total = await db.collection(COLLECTIONS.FEES).countDocuments(query);

    // Get fees with pagination
    const fees = await db.collection(COLLECTIONS.FEES)
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: fees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get fees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/fees - Create fee
export const POST = withAuth(async (req, context) => {
  try {
    const data = await req.json();

    // Validate data
    const validation = validateFeeData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Verify payer exists
    let payerCollection;
    switch (data.payerType) {
      case PAYER_TYPES.STUDENT:
        payerCollection = COLLECTIONS.STUDENTS;
        break;
      case PAYER_TYPES.TEACHER:
        payerCollection = COLLECTIONS.TEACHERS;
        break;
      case PAYER_TYPES.CUSTOMER:
        payerCollection = COLLECTIONS.CUSTOMERS;
        break;
      case PAYER_TYPES.TRANSPORT:
        payerCollection = COLLECTIONS.TRANSPORT_CUSTOMERS;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid payer type' },
          { status: 400 }
        );
    }

    const payer = await db.collection(payerCollection).findOne({ _id: new ObjectId(data.payerId) });
    if (!payer) {
      return NextResponse.json(
        { error: 'Payer not found' },
        { status: 400 }
      );
    }

    // Generate unique transaction ID
    const transactionId = await generateTransactionId(db);

    // Prepare fee data
    const feeData = {
      transactionId,
      payerType: data.payerType,
      payerId: data.payerId,
      amount: parseFloat(data.amount),
      currency: data.currency || 'INR',
      modeOfPayment: data.modeOfPayment,
      payeeName: data.payeeName,
      payeePhone: data.payeePhone,
      reference: data.reference || '',
      date: new Date(data.date)
    };

    addAuditFields(feeData, req.user._id);

    // Insert fee
    const result = await db.collection(COLLECTIONS.FEES).insertOne(feeData);

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.CREATE, COLLECTIONS.FEES, result.insertedId, `Created fee: ${feeData.transactionId} - ₹${feeData.amount}`);

    feeData._id = result.insertedId;

    return NextResponse.json({
      success: true,
      data: feeData
    }, { status: 201 });
  } catch (error) {
    console.error('Create fee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

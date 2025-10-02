import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES, PAYER_TYPES } from '@/lib/models';
import { withAuth, canEditAllRecords, canDeleteRecords } from '@/lib/auth';
import { validateFeeData } from '@/lib/validation';

// GET /api/fees/[id] - Get fee by ID
export const GET = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid fee ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const fee = await db.collection(COLLECTIONS.FEES).findOne({ _id: new ObjectId(id) });

    if (!fee) {
      return NextResponse.json(
        { error: 'Fee not found' },
        { status: 404 }
      );
    }

    // If user is staff, only allow access to their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      if (fee.createdBy.toString() !== req.user._id.toString()) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Get payer information
    let payerCollection;
    switch (fee.payerType) {
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
        payerCollection = null;
    }

    let payer = null;
    if (payerCollection) {
      payer = await db.collection(payerCollection).findOne({ _id: new ObjectId(fee.payerId) });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...fee,
        payer
      }
    });
  } catch (error) {
    console.error('Get fee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/fees/[id] - Update fee
export const PUT = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid fee ID' },
        { status: 400 }
      );
    }

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
    
    // Check if fee exists
    const existingFee = await db.collection(COLLECTIONS.FEES).findOne({ _id: new ObjectId(id) });
    
    if (!existingFee) {
      return NextResponse.json(
        { error: 'Fee not found' },
        { status: 404 }
      );
    }

    // If user is staff, only allow editing their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      if (existingFee.createdBy.toString() !== req.user._id.toString()) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

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

    // Prepare update data
    const updateData = {
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

    addAuditFields(updateData, req.user._id, true);

    // Update fee
    const result = await db.collection(COLLECTIONS.FEES).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Fee not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.UPDATE, COLLECTIONS.FEES, new ObjectId(id), `Updated fee: ${existingFee.transactionId} - ₹${updateData.amount}`);

    // Get updated fee
    const updatedFee = await db.collection(COLLECTIONS.FEES).findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      data: updatedFee
    });
  } catch (error) {
    console.error('Update fee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/fees/[id] - Delete fee
export const DELETE = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid fee ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if fee exists
    const existingFee = await db.collection(COLLECTIONS.FEES).findOne({ _id: new ObjectId(id) });
    
    if (!existingFee) {
      return NextResponse.json(
        { error: 'Fee not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (req.user.role === USER_ROLES.STAFF && !canDeleteRecords(req.user.role)) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to delete fees.' },
        { status: 403 }
      );
    }

    // If user is staff, only allow deleting their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      if (existingFee.createdBy.toString() !== req.user._id.toString()) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Delete fee
    const result = await db.collection(COLLECTIONS.FEES).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Fee not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.DELETE, COLLECTIONS.FEES, new ObjectId(id), `Deleted fee: ${existingFee.transactionId} - ₹${existingFee.amount}`);

    return NextResponse.json({
      success: true,
      message: 'Fee deleted successfully'
    });
  } catch (error) {
    console.error('Delete fee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

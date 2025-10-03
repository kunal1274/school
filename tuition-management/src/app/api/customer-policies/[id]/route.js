import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getDatabase, COLLECTIONS, logActivity, LOG_ACTIONS } from '@/lib/models';
import { validateInsuranceData } from '@/lib/validation-insurance';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (request, context) => {
  try {
    const { id } = context.params;
    const db = await getDatabase();
    
    const customerPolicy = await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
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
        {
          $unwind: { path: '$policy', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: '$insurer', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: '$customer', preserveNullAndEmptyArrays: true }
        }
      ])
      .toArray();

    if (customerPolicy.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customerPolicy[0]
    });
  } catch (error) {
    console.error('Customer Policy GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer policy' },
      { status: 500 }
    );
  }
}, 'staff'); // All roles can view customer policies

export const PUT = withAuth(async (request, context) => {
  try {
    const { id } = context.params;
    const user = context.user;
    const body = await request.json();
    const db = await getDatabase();

    // Validate input data
    const validation = validateInsuranceData(body, 'customerPolicy');
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Check if customer policy exists
    const existingPolicy = await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .findOne({ _id: new ObjectId(id) });

    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Customer policy not found' },
        { status: 404 }
      );
    }

    // Check for duplicate policy number if changed
    if (body.policyNumber && body.policyNumber !== existingPolicy.policyNumber) {
      const duplicatePolicy = await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
        .findOne({ policyNumber: body.policyNumber });
      
      if (duplicatePolicy) {
        return NextResponse.json(
          { success: false, error: 'Policy number already exists' },
          { status: 409 }
        );
      }
    }

    // Update customer policy
    const updateData = {
      ...body,
      updatedAt: new Date(),
      updatedBy: new ObjectId(user._id)
    };

    const result = await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes made' },
        { status: 400 }
      );
    }

    // Log activity
    await logActivity(
      request.user._id,
      LOG_ACTIONS.UPDATE,
      COLLECTIONS.CUSTOMER_POLICIES,
      new ObjectId(id),
      `Updated customer policy: ${existingPolicy.policyNumber}`
    );

    // Fetch updated customer policy
    const updatedPolicy = await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
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
        {
          $unwind: { path: '$policy', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: '$insurer', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: '$customer', preserveNullAndEmptyArrays: true }
        }
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: updatedPolicy[0]
    });
  } catch (error) {
    console.error('Customer Policy PUT API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer policy' },
      { status: 500 }
    );
  }
}, 'moderator'); // Admin and Moderator can update customer policies

export const DELETE = withAuth(async (request, context) => {
  try {
    const { id } = context.params;
    const db = await getDatabase();

    // Check if customer policy exists
    const existingPolicy = await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .findOne({ _id: new ObjectId(id) });

    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Customer policy not found' },
        { status: 404 }
      );
    }

    // Check if there are any payments or claims associated with this policy
    const paymentsCount = await db.collection(COLLECTIONS.POLICY_PAYMENTS)
      .countDocuments({ customerPolicyId: new ObjectId(id) });
    
    const claimsCount = await db.collection(COLLECTIONS.CLAIMS)
      .countDocuments({ customerPolicyId: new ObjectId(id) });

    if (paymentsCount > 0 || claimsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete customer policy with associated payments or claims' 
        },
        { status: 400 }
      );
    }

    // Delete customer policy
    const result = await db.collection(COLLECTIONS.CUSTOMER_POLICIES)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete customer policy' },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity(
      request.user._id,
      LOG_ACTIONS.DELETE,
      COLLECTIONS.CUSTOMER_POLICIES,
      new ObjectId(id),
      `Deleted customer policy: ${existingPolicy.policyNumber}`
    );

    return NextResponse.json({
      success: true,
      message: 'Customer policy deleted successfully'
    });
  } catch (error) {
    console.error('Customer Policy DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer policy' },
      { status: 500 }
    );
  }
}, 'admin'); // Only Admin can delete customer policies

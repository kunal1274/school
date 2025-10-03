import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getDatabase } from '@/lib/models';
import { COLLECTIONS, logActivity } from '@/lib/models';
import { validatePolicyPaymentData } from '@/lib/validation-insurance';
import { ObjectId } from 'mongodb';

// GET /api/policy-payments/[id] - Get specific policy payment
export async function GET(request, { params }) {
  return withAuth(request, async (user) => {
    try {
      const { id } = params;
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment ID' },
          { status: 400 }
        );
      }

      const db = await getDatabase();
      const collection = db.collection(COLLECTIONS.POLICY_PAYMENTS);

      const payment = await collection
        .aggregate([
          { $match: { _id: new ObjectId(id) } },
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

      if (!payment.length) {
        return NextResponse.json(
          { success: false, error: 'Policy payment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: payment[0]
      });

    } catch (error) {
      console.error('Error fetching policy payment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch policy payment' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/policy-payments/[id] - Update policy payment
export async function PUT(request, { params }) {
  return withAuth(request, async (user) => {
    try {
      const { id } = params;
      const body = await request.json();
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment ID' },
          { status: 400 }
        );
      }

      // Validate payment data
      const validation = validatePolicyPaymentData(body, true);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, errors: validation.errors },
          { status: 400 }
        );
      }

      const db = await getDatabase();
      const collection = db.collection(COLLECTIONS.POLICY_PAYMENTS);

      // Check if payment exists
      const existingPayment = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingPayment) {
        return NextResponse.json(
          { success: false, error: 'Policy payment not found' },
          { status: 404 }
        );
      }

      // Prepare update data
      const updateData = {
        ...body,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : existingPayment.paymentDate,
        updatedAt: new Date()
      };

      // Update payment
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Policy payment not found' },
          { status: 404 }
        );
      }

      // Log activity
      await logActivity(
        user._id,
        'UPDATE',
        'PolicyPayment',
        new ObjectId(id),
        `Updated payment ${existingPayment.transactionId}`,
        { 
          before: existingPayment,
          after: updateData
        }
      );

      return NextResponse.json({
        success: true,
        data: { _id: id, ...updateData },
        message: 'Policy payment updated successfully'
      });

    } catch (error) {
      console.error('Error updating policy payment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update policy payment' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/policy-payments/[id] - Delete policy payment
export async function DELETE(request, { params }) {
  return withAuth(request, async (user) => {
    try {
      const { id } = params;
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment ID' },
          { status: 400 }
        );
      }

      // Check if user has delete permissions (Admin only)
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions to delete policy payments' },
          { status: 403 }
        );
      }

      const db = await getDatabase();
      const collection = db.collection(COLLECTIONS.POLICY_PAYMENTS);

      // Check if payment exists
      const existingPayment = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingPayment) {
        return NextResponse.json(
          { success: false, error: 'Policy payment not found' },
          { status: 404 }
        );
      }

      // Delete payment
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Policy payment not found' },
          { status: 404 }
        );
      }

      // Log activity
      await logActivity(
        user._id,
        'DELETE',
        'PolicyPayment',
        new ObjectId(id),
        `Deleted payment ${existingPayment.transactionId}`,
        { deletedPayment: existingPayment }
      );

      return NextResponse.json({
        success: true,
        message: 'Policy payment deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting policy payment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete policy payment' },
        { status: 500 }
      );
    }
  });
}

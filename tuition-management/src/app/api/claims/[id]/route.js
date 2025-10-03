import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getDatabase } from '@/lib/models';
import { COLLECTIONS, logActivity } from '@/lib/models';
import { validateClaimData } from '@/lib/validation-insurance';
import { ObjectId } from 'mongodb';

// GET /api/claims/[id] - Get specific claim
export async function GET(request, { params }) {
  return withAuth(request, async (user) => {
    try {
      const { id } = params;
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid claim ID' },
          { status: 400 }
        );
      }

      const db = await getDatabase();
      const collection = db.collection(COLLECTIONS.CLAIMS);

      const claim = await collection
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
          {
            $addFields: {
              customerPolicy: { $arrayElemAt: ['$customerPolicy', 0] },
              policy: { $arrayElemAt: ['$policy', 0] },
              insurer: { $arrayElemAt: ['$insurer', 0] },
              customer: { $arrayElemAt: ['$customer', 0] },
              claimant: { $arrayElemAt: ['$claimant', 0] },
              handler: { $arrayElemAt: ['$handler', 0] }
            }
          }
        ])
        .toArray();

      if (!claim.length) {
        return NextResponse.json(
          { success: false, error: 'Claim not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: claim[0]
      });

    } catch (error) {
      console.error('Error fetching claim:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch claim' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/claims/[id] - Update claim
export async function PUT(request, { params }) {
  return withAuth(request, async (user) => {
    try {
      const { id } = params;
      const body = await request.json();
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid claim ID' },
          { status: 400 }
        );
      }

      // Validate claim data
      const validation = validateClaimData(body, true);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, errors: validation.errors },
          { status: 400 }
        );
      }

      const db = await getDatabase();
      const collection = db.collection(COLLECTIONS.CLAIMS);

      // Check if claim exists
      const existingClaim = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingClaim) {
        return NextResponse.json(
          { success: false, error: 'Claim not found' },
          { status: 404 }
        );
      }

      // Validate status transition
      if (body.status && !isValidStatusTransition(existingClaim.status, body.status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status transition from ${existingClaim.status} to ${body.status}` },
          { status: 400 }
        );
      }

      // Prepare update data
      const updateData = {
        ...body,
        dateOfEvent: body.dateOfEvent ? new Date(body.dateOfEvent) : existingClaim.dateOfEvent,
        updatedAt: new Date()
      };

      // If status is being updated to under_review, approved, or rejected, set handledBy
      if (body.status && ['under_review', 'approved', 'rejected', 'settled'].includes(body.status)) {
        updateData.handledBy = user._id;
      }

      // Update claim
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Claim not found' },
          { status: 404 }
        );
      }

      // Log activity
      await logActivity(
        user._id,
        'UPDATE',
        'Claim',
        new ObjectId(id),
        `Updated claim ${existingClaim.claimNumber} - Status: ${existingClaim.status} → ${body.status || existingClaim.status}`,
        { 
          before: existingClaim,
          after: updateData
        }
      );

      return NextResponse.json({
        success: true,
        data: { _id: id, ...updateData },
        message: 'Claim updated successfully'
      });

    } catch (error) {
      console.error('Error updating claim:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update claim' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/claims/[id] - Delete claim
export async function DELETE(request, { params }) {
  return withAuth(request, async (user) => {
    try {
      const { id } = params;
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid claim ID' },
          { status: 400 }
        );
      }

      // Check if user has delete permissions (Admin only)
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions to delete claims' },
          { status: 403 }
        );
      }

      const db = await getDatabase();
      const collection = db.collection(COLLECTIONS.CLAIMS);

      // Check if claim exists
      const existingClaim = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingClaim) {
        return NextResponse.json(
          { success: false, error: 'Claim not found' },
          { status: 404 }
        );
      }

      // Only allow deletion of draft claims
      if (existingClaim.status !== 'draft') {
        return NextResponse.json(
          { success: false, error: 'Only draft claims can be deleted' },
          { status: 400 }
        );
      }

      // Delete claim
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Claim not found' },
          { status: 404 }
        );
      }

      // Log activity
      await logActivity(
        user._id,
        'DELETE',
        'Claim',
        new ObjectId(id),
        `Deleted claim ${existingClaim.claimNumber}`,
        { deletedClaim: existingClaim }
      );

      return NextResponse.json({
        success: true,
        message: 'Claim deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting claim:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete claim' },
        { status: 500 }
      );
    }
  });
}

// Helper function to validate status transitions
function isValidStatusTransition(currentStatus, newStatus) {
  const validTransitions = {
    'draft': ['submitted'],
    'submitted': ['under_review', 'draft'],
    'under_review': ['approved', 'rejected', 'submitted'],
    'approved': ['settled', 'under_review'],
    'rejected': ['under_review'],
    'settled': [] // Final state
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

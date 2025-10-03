import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getDatabase } from '@/lib/models';
import { COLLECTIONS, logActivity } from '@/lib/models';
import { validateClaimData } from '@/lib/validation-insurance';

// GET /api/claims - List claims with filtering
export const GET = withAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 10;
      const search = searchParams.get('search') || '';
      const customerPolicyId = searchParams.get('customerPolicyId');
      const status = searchParams.get('status');
      const claimantId = searchParams.get('claimantId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const db = await getDatabase();
      const collection = db.collection(COLLECTIONS.CLAIMS);

      // Build filter object
      const filter = {};
      
      if (search) {
        filter.$or = [
          { claimNumber: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      if (customerPolicyId) {
        filter.customerPolicyId = customerPolicyId;
      }

      if (status) {
        filter.status = status;
      }

      if (claimantId) {
        filter.claimantId = claimantId;
      }

      if (startDate || endDate) {
        filter.dateOfEvent = {};
        if (startDate) filter.dateOfEvent.$gte = new Date(startDate);
        if (endDate) filter.dateOfEvent.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const total = await collection.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      // Fetch claims with population
      const claims = await collection
        .aggregate([
          { $match: filter },
          { $sort: { createdAt: -1 } },
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

      return NextResponse.json({
        success: true,
        data: claims,
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
      console.error('Error fetching claims:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch claims' },
        { status: 500 }
      );
    }
}, 'staff');

// POST /api/claims - Create new claim
export const POST = withAuth(async (request) => {
    try {
      const body = await request.json();
      
      // Validate claim data
      const validation = validateClaimData(body);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, errors: validation.errors },
          { status: 400 }
        );
      }

      const db = await getDatabase();
      const claimsCollection = db.collection(COLLECTIONS.CLAIMS);
      const customerPoliciesCollection = db.collection(COLLECTIONS.CUSTOMER_POLICIES);

      // Check if customer policy exists and is active
      const customerPolicy = await customerPoliciesCollection.findOne({
        _id: body.customerPolicyId
      });

      if (!customerPolicy) {
        return NextResponse.json(
          { success: false, error: 'Customer policy not found' },
          { status: 404 }
        );
      }

      if (customerPolicy.status !== 'active') {
        return NextResponse.json(
          { success: false, error: 'Claims can only be made for active policies' },
          { status: 400 }
        );
      }

      // Generate unique claim number
      const today = new Date();
      const yearMonth = today.toISOString().slice(0, 7).replace('-', '');
      const count = await claimsCollection.countDocuments({
        claimNumber: { $regex: `^CLM-${yearMonth}-` }
      });
      const claimNumber = `CLM-${yearMonth}-${String(count + 1).padStart(4, '0')}`;

      // Prepare claim data
      const claimData = {
        ...body,
        claimNumber,
        dateOfEvent: body.dateOfEvent ? new Date(body.dateOfEvent) : new Date(),
        claimantId: body.claimantId || user._id,
        status: body.status || 'draft',
        createdAt: new Date()
      };

      // Create claim
      const result = await claimsCollection.insertOne(claimData);

      // Log activity
      await logActivity(
        user._id,
        'CREATE',
        'Claim',
        result.insertedId,
        `Created claim ${claimNumber} for policy ${customerPolicy.policyNumber}`,
        { claimData }
      );

      return NextResponse.json({
        success: true,
        data: { _id: result.insertedId, ...claimData },
        message: 'Claim created successfully'
      });

    } catch (error) {
      console.error('Error creating claim:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create claim' },
        { status: 500 }
      );
    }
}, 'staff');

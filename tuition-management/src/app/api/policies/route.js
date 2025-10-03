import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { PolicyModel } from '@/lib/models/policy.model';
import { InsurerModel } from '@/lib/models/insurer.model';
import { validateInsuranceData } from '@/lib/validation-insurance';
import { ActivityLogger } from '@/lib/activity-logger';
import { extractClientInfo } from '@/lib/activity-logger';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const insurerId = searchParams.get('insurerId');
    const active = searchParams.get('active');

    const filters = {};
    
    // Search filter
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Insurer filter
    if (insurerId && ObjectId.isValid(insurerId)) {
      filters.insurerId = new ObjectId(insurerId);
    }

    // Active filter
    if (active !== null && active !== undefined) {
      filters.active = active === 'true';
    }

    const options = {
      limit,
      skip: (page - 1) * limit,
      sort: { createdAt: -1 }
    };

    const result = await PolicyModel.findAll(filters, options);

    // Enrich with insurer information
    const enrichedPolicies = await Promise.all(
      result.data.map(async (policy) => {
        const insurer = await InsurerModel.findById(policy.insurerId);
        return {
          ...policy,
          insurer: insurer ? {
            _id: insurer._id,
            name: insurer.name,
            code: insurer.code
          } : null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedPolicies,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Policies GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}, 'staff'); // All roles can view policies

export const POST = withAuth(async (req, context) => {
  try {
    const user = context.user;
    const body = await req.json();
    const { ipAddress, userAgent } = extractClientInfo(req);

    // Validate input data
    const validation = validateInsuranceData(body, 'policy');
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Verify insurer exists and is active
    const insurer = await InsurerModel.findById(new ObjectId(body.insurerId));
    if (!insurer) {
      return NextResponse.json(
        { success: false, error: 'Insurer not found' },
        { status: 404 }
      );
    }

    if (!insurer.isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot create policy for inactive insurer' },
        { status: 400 }
      );
    }

    // Check for duplicate name within the same insurer
    const existingPolicy = await PolicyModel.findAll({ 
      insurerId: new ObjectId(body.insurerId),
      name: body.name 
    });
    if (existingPolicy.data.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Policy with this name already exists for this insurer' },
        { status: 409 }
      );
    }

    // Check for duplicate code if provided
    if (body.code) {
      const existingCode = await PolicyModel.findByCode(body.code);
      if (existingCode) {
        return NextResponse.json(
          { success: false, error: 'Policy with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Add audit fields
    const policyData = {
      ...body,
      insurerId: new ObjectId(body.insurerId),
      createdBy: user._id
    };

    const policy = await PolicyModel.create(policyData);

    // Log activity
    await ActivityLogger.logActivity({
      userId: user._id,
      action: 'create',
      entityType: 'policy',
      entityId: policy._id,
      entityName: policy.name,
      details: { 
        insurerId: policy.insurerId,
        code: policy.code,
        premiumAmount: policy.premiumAmount,
        premiumFrequency: policy.premiumFrequency
      },
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      data: policy
    }, { status: 201 });
  } catch (error) {
    console.error('Policies POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}, 'moderator'); // Admin and Moderator can create policies

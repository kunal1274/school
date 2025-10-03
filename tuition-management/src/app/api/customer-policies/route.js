import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { CustomerPolicyModel } from '@/lib/models/customerPolicy.model';
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
    const customerId = searchParams.get('customerId');
    const policyId = searchParams.get('policyId');
    const status = searchParams.get('status');

    const filters = {};
    
    // Search filter
    if (search) {
      filters.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Customer filter
    if (customerId && ObjectId.isValid(customerId)) {
      filters.customerId = new ObjectId(customerId);
    }

    // Policy filter
    if (policyId && ObjectId.isValid(policyId)) {
      filters.policyId = new ObjectId(policyId);
    }

    // Status filter
    if (status) {
      filters.status = status;
    }

    const options = {
      limit,
      skip: (page - 1) * limit,
      sort: { createdAt: -1 }
    };

    const result = await CustomerPolicyModel.findAll(filters, options);

    // Enrich with policy and insurer information
    const enrichedCustomerPolicies = await Promise.all(
      result.data.map(async (customerPolicy) => {
        const policy = await PolicyModel.findById(customerPolicy.policyId);
        const insurer = await InsurerModel.findById(customerPolicy.insurerId);
        
        return {
          ...customerPolicy,
          policy: policy ? {
            _id: policy._id,
            name: policy.name,
            code: policy.code,
            premiumAmount: policy.premiumAmount,
            premiumFrequency: policy.premiumFrequency
          } : null,
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
      data: enrichedCustomerPolicies,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Customer Policies GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer policies' },
      { status: 500 }
    );
  }
}, 'staff'); // All roles can view customer policies

export const POST = withAuth(async (req, context) => {
  try {
    const user = context.user;
    const body = await req.json();
    const { ipAddress, userAgent } = extractClientInfo(req);

    // Validate input data
    const validation = validateInsuranceData(body, 'customerPolicy');
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Verify policy exists and is active
    const policy = await PolicyModel.findById(new ObjectId(body.policyId));
    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'Policy not found' },
        { status: 404 }
      );
    }

    if (!policy.active) {
      return NextResponse.json(
        { success: false, error: 'Cannot assign inactive policy to customer' },
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
        { success: false, error: 'Cannot assign policy from inactive insurer' },
        { status: 400 }
      );
    }

    // Check for duplicate policy number
    const existingPolicyNumber = await CustomerPolicyModel.findByPolicyNumber(body.policyNumber);
    if (existingPolicyNumber) {
      return NextResponse.json(
        { success: false, error: 'Policy number already exists' },
        { status: 409 }
      );
    }

    // Generate policy number if not provided
    let policyNumber = body.policyNumber;
    if (!policyNumber) {
      policyNumber = await CustomerPolicyModel.generatePolicyNumber(insurer.code);
    }

    // Calculate next premium due date if not provided
    let nextPremiumDueDate = body.nextPremiumDueDate;
    if (!nextPremiumDueDate && body.startDate && policy.premiumFrequency) {
      nextPremiumDueDate = await CustomerPolicyModel.calculateNextPremiumDueDate(
        body.startDate, 
        policy.premiumFrequency
      );
    }

    // Add audit fields
    const customerPolicyData = {
      ...body,
      policyId: new ObjectId(body.policyId),
      insurerId: new ObjectId(body.insurerId),
      customerId: new ObjectId(body.customerId),
      policyNumber,
      nextPremiumDueDate,
      createdBy: user._id
    };

    // Convert insuredPersonId to ObjectId if provided
    if (body.insuredPersonId) {
      customerPolicyData.insuredPersonId = new ObjectId(body.insuredPersonId);
    }

    const customerPolicy = await CustomerPolicyModel.create(customerPolicyData);

    // Log activity
    await ActivityLogger.logActivity({
      userId: user._id,
      action: 'create',
      entityType: 'customerPolicy',
      entityId: customerPolicy._id,
      entityName: customerPolicy.policyNumber,
      details: { 
        policyId: customerPolicy.policyId,
        insurerId: customerPolicy.insurerId,
        customerId: customerPolicy.customerId,
        status: customerPolicy.status
      },
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      data: customerPolicy
    }, { status: 201 });
  } catch (error) {
    console.error('Customer Policies POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer policy' },
      { status: 500 }
    );
  }
}, 'staff'); // All roles can create customer policies

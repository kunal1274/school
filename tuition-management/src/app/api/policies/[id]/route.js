import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { PolicyModel } from '@/lib/models/policy.model';
import { InsurerModel } from '@/lib/models/insurer.model';
import { validateInsuranceData } from '@/lib/validation-insurance';
import { getDatabase, COLLECTIONS, logActivity, LOG_ACTIONS } from '@/lib/models';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    const policy = await PolicyModel.findById(new ObjectId(id));
    
    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'Policy not found' },
        { status: 404 }
      );
    }

    // Enrich with insurer information
    const insurer = await InsurerModel.findById(policy.insurerId);
    const enrichedPolicy = {
      ...policy,
      insurer: insurer ? {
        _id: insurer._id,
        name: insurer.name,
        code: insurer.code,
        contactPerson: insurer.contactPerson,
        phone: insurer.phone,
        email: insurer.email
      } : null
    };

    return NextResponse.json({
      success: true,
      data: enrichedPolicy
    });
  } catch (error) {
    console.error('Policy GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}, 'staff'); // All roles can view individual policies

export const PUT = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    const user = context.user;
    const body = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    // Check if policy exists
    const existingPolicy = await PolicyModel.findById(new ObjectId(id));
    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Policy not found' },
        { status: 404 }
      );
    }

    // Validate input data
    const validation = validateInsuranceData(body, 'policy');
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Verify insurer exists and is active (if insurerId is being changed)
    if (body.insurerId && body.insurerId !== existingPolicy.insurerId.toString()) {
      const insurer = await InsurerModel.findById(new ObjectId(body.insurerId));
      if (!insurer) {
        return NextResponse.json(
          { success: false, error: 'Insurer not found' },
          { status: 404 }
        );
      }

      if (!insurer.isActive) {
        return NextResponse.json(
          { success: false, error: 'Cannot assign policy to inactive insurer' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate name within the same insurer
    if (body.name && body.name !== existingPolicy.name) {
      const insurerId = body.insurerId ? new ObjectId(body.insurerId) : existingPolicy.insurerId;
      const duplicatePolicy = await PolicyModel.findAll({ 
        insurerId,
        name: body.name,
        _id: { $ne: new ObjectId(id) }
      });
      if (duplicatePolicy.data.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Policy with this name already exists for this insurer' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate code (excluding current record)
    if (body.code && body.code !== existingPolicy.code) {
      const existingCode = await PolicyModel.findByCode(body.code);
      if (existingCode && existingCode._id.toString() !== id) {
        return NextResponse.json(
          { success: false, error: 'Policy with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Add audit fields
    const updateData = {
      ...body,
      updatedBy: user._id
    };

    // Convert insurerId to ObjectId if provided
    if (body.insurerId) {
      updateData.insurerId = new ObjectId(body.insurerId);
    }

    const updatedPolicy = await PolicyModel.update(new ObjectId(id), updateData);

    // Log activity
    await logActivity(
      req.user._id,
      LOG_ACTIONS.UPDATE,
      COLLECTIONS.POLICIES,
      new ObjectId(id),
      `Updated policy: ${existingPolicy.name} → ${updateData.name || existingPolicy.name}`
    );

    return NextResponse.json({
      success: true,
      data: updatedPolicy
    });
  } catch (error) {
    console.error('Policy PUT API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}, 'moderator'); // Admin and Moderator can update policies

export const DELETE = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    const user = context.user;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    // Check if policy exists
    const existingPolicy = await PolicyModel.findById(new ObjectId(id));
    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Policy not found' },
        { status: 404 }
      );
    }

    // Check if policy has associated customer policies
    const { CustomerPolicyModel } = await import('@/lib/models/customerPolicy.model');
    const associatedCustomerPolicies = await CustomerPolicyModel.findByPolicy(new ObjectId(id));
    if (associatedCustomerPolicies.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete policy with associated customer policies' },
        { status: 409 }
      );
    }

    await PolicyModel.delete(new ObjectId(id));

    // Log activity
    await logActivity(
      req.user._id,
      LOG_ACTIONS.DELETE,
      COLLECTIONS.POLICIES,
      new ObjectId(id),
      `Deleted policy: ${existingPolicy.name} (${existingPolicy.policyNumber})`
    );

    return NextResponse.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Policy DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete policy' },
      { status: 500 }
    );
  }
}, 'admin'); // Only Admin can delete policies

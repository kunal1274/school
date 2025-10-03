import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { InsurerModel } from '@/lib/models/insurer.model';
import { validateInsuranceData } from '@/lib/validation-insurance';
import { ActivityLogger } from '@/lib/activity-logger';
import { extractClientInfo } from '@/lib/activity-logger';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid insurer ID' },
        { status: 400 }
      );
    }

    const insurer = await InsurerModel.findById(new ObjectId(id));
    
    if (!insurer) {
      return NextResponse.json(
        { success: false, error: 'Insurer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: insurer
    });
  } catch (error) {
    console.error('Insurer GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insurer' },
      { status: 500 }
    );
  }
}, 'staff'); // All roles can view individual insurers

export const PUT = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    const user = context.user;
    const body = await req.json();
    const { ipAddress, userAgent } = extractClientInfo(req);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid insurer ID' },
        { status: 400 }
      );
    }

    // Check if insurer exists
    const existingInsurer = await InsurerModel.findById(new ObjectId(id));
    if (!existingInsurer) {
      return NextResponse.json(
        { success: false, error: 'Insurer not found' },
        { status: 404 }
      );
    }

    // Validate input data
    const validation = validateInsuranceData(body, 'insurer');
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Check for duplicate name (excluding current record)
    if (body.name && body.name !== existingInsurer.name) {
      const duplicateInsurer = await InsurerModel.findAll({ name: body.name });
      if (duplicateInsurer.data.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Insurer with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate code (excluding current record)
    if (body.code && body.code !== existingInsurer.code) {
      const existingCode = await InsurerModel.findByCode(body.code);
      if (existingCode) {
        return NextResponse.json(
          { success: false, error: 'Insurer with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Add audit fields
    const updateData = {
      ...body,
      updatedBy: user._id
    };

    const updatedInsurer = await InsurerModel.update(new ObjectId(id), updateData);

    // Log activity
    await ActivityLogger.logActivity({
      userId: user._id,
      action: 'update',
      entityType: 'insurer',
      entityId: updatedInsurer._id,
      entityName: updatedInsurer.name,
      details: { 
        changes: Object.keys(body),
        previousValues: existingInsurer
      },
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      data: updatedInsurer
    });
  } catch (error) {
    console.error('Insurer PUT API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update insurer' },
      { status: 500 }
    );
  }
}, 'moderator'); // Admin and Moderator can update insurers

export const DELETE = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    const user = context.user;
    const { ipAddress, userAgent } = extractClientInfo(req);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid insurer ID' },
        { status: 400 }
      );
    }

    // Check if insurer exists
    const existingInsurer = await InsurerModel.findById(new ObjectId(id));
    if (!existingInsurer) {
      return NextResponse.json(
        { success: false, error: 'Insurer not found' },
        { status: 404 }
      );
    }

    // Check if insurer has associated policies
    const { PolicyModel } = await import('@/lib/models/policy.model');
    const associatedPolicies = await PolicyModel.findByInsurer(new ObjectId(id));
    if (associatedPolicies.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete insurer with associated policies' },
        { status: 409 }
      );
    }

    await InsurerModel.delete(new ObjectId(id));

    // Log activity
    await ActivityLogger.logActivity({
      userId: user._id,
      action: 'delete',
      entityType: 'insurer',
      entityId: existingInsurer._id,
      entityName: existingInsurer.name,
      details: { 
        code: existingInsurer.code,
        isActive: existingInsurer.isActive
      },
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      message: 'Insurer deleted successfully'
    });
  } catch (error) {
    console.error('Insurer DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete insurer' },
      { status: 500 }
    );
  }
}, 'admin'); // Only Admin can delete insurers

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
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
    const isActive = searchParams.get('isActive');

    const filters = {};
    
    // Search filter
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }

    // Active filter
    if (isActive !== null && isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const options = {
      limit,
      skip: (page - 1) * limit,
      sort: { createdAt: -1 }
    };

    const result = await InsurerModel.findAll(filters, options);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Insurers GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insurers' },
      { status: 500 }
    );
  }
}, 'staff'); // All roles can view insurers

export const POST = withAuth(async (req, context) => {
  try {
    const user = context.user;
    const body = await req.json();
    const { ipAddress, userAgent } = extractClientInfo(req);

    // Validate input data
    const validation = validateInsuranceData(body, 'insurer');
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existingInsurer = await InsurerModel.findAll({ name: body.name });
    if (existingInsurer.data.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Insurer with this name already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate code if provided
    if (body.code) {
      const existingCode = await InsurerModel.findByCode(body.code);
      if (existingCode) {
        return NextResponse.json(
          { success: false, error: 'Insurer with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Add audit fields
    const insurerData = {
      ...body,
      createdBy: new ObjectId(user._id),
      updatedBy: new ObjectId(user._id)
    };

    const insurer = await InsurerModel.create(insurerData);

    // Log activity
    await ActivityLogger.logActivity({
      userId: new ObjectId(user._id),
      action: 'create',
      entityType: 'insurer',
      entityId: insurer._id,
      entityName: insurer.name,
      details: { code: insurer.code },
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      data: insurer
    }, { status: 201 });
  } catch (error) {
    console.error('Insurers POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create insurer' },
      { status: 500 }
    );
  }
}, 'moderator'); // Admin and Moderator can create insurers

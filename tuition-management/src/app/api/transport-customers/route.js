import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES, STATUS_TYPES } from '@/lib/models';
import { withAuth, canEditAllRecords } from '@/lib/auth';
import { validateTransportCustomerData } from '@/lib/validation';

// GET /api/transport-customers - List transport customers
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const db = await getDatabase();
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { vehicleNo: { $regex: search, $options: 'i' } },
        { pickupPoint: { $regex: search, $options: 'i' } },
        { dropPoint: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    // If user is staff, only show their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    // Get total count
    const total = await db.collection(COLLECTIONS.TRANSPORT_CUSTOMERS).countDocuments(query);

    // Get transport customers with pagination
    const transportCustomers = await db.collection(COLLECTIONS.TRANSPORT_CUSTOMERS)
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: transportCustomers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transport customers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/transport-customers - Create transport customer
export const POST = withAuth(async (req) => {
  try {
    const data = await req.json();

    // Validate data
    const validation = validateTransportCustomerData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Prepare transport customer data
    const transportCustomerData = {
      name: data.name,
      phone: data.phone,
      vehicleNo: data.vehicleNo || '',
      pickupPoint: data.pickupPoint || '',
      dropPoint: data.dropPoint || '',
      assignedToStudentId: data.assignedToStudentId || null,
      fee: data.fee ? parseFloat(data.fee) : null,
      notes: data.notes || '',
      status: data.status || STATUS_TYPES.ACTIVE
    };

    addAuditFields(transportCustomerData, req.user._id);

    // Insert transport customer
    const result = await db.collection(COLLECTIONS.TRANSPORT_CUSTOMERS).insertOne(transportCustomerData);

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.CREATE, COLLECTIONS.TRANSPORT_CUSTOMERS, result.insertedId, `Created transport customer: ${transportCustomerData.name}`);

    transportCustomerData._id = result.insertedId;

    return NextResponse.json({
      success: true,
      data: transportCustomerData
    }, { status: 201 });
  } catch (error) {
    console.error('Create transport customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
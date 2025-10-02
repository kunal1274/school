import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES } from '@/lib/models';
import { withAuth, canEditAllRecords } from '@/lib/auth';
import { validateCustomerData } from '@/lib/validation';

// GET /api/customers - List customers
export const GET = withAuth(async (req, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    const db = await getDatabase();
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // If user is staff, only show their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    // Get total count
    const total = await db.collection(COLLECTIONS.CUSTOMERS).countDocuments(query);

    // Get customers with pagination
    const customers = await db.collection(COLLECTIONS.CUSTOMERS)
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/customers - Create customer
export const POST = withAuth(async (req, context) => {
  try {
    const data = await req.json();

    // Validate data
    const validation = validateCustomerData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Prepare customer data
    const customerData = {
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      address: data.address || '',
      relationToStudent: data.relationToStudent || '',
      notes: data.notes || ''
    };

    addAuditFields(customerData, req.user._id);

    // Insert customer
    const result = await db.collection(COLLECTIONS.CUSTOMERS).insertOne(customerData);

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.CREATE, COLLECTIONS.CUSTOMERS, result.insertedId, `Created customer: ${customerData.name}`);

    customerData._id = result.insertedId;

    return NextResponse.json({
      success: true,
      data: customerData
    }, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

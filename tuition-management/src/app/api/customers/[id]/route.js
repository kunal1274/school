import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES } from '@/lib/models';
import { withAuth, canEditAllRecords, canDeleteRecords } from '@/lib/auth';
import { validateCustomerData } from '@/lib/validation';

// GET /api/customers/[id] - Get customer by ID
export const GET = withAuth(async (req, context) => {
  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Build query based on user role
    const query = { _id: new ObjectId(id) };
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    const customer = await db.collection(COLLECTIONS.CUSTOMERS).findOne(query);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/customers/[id] - Update customer
export const PUT = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    const data = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    // Validate data
    const validation = validateCustomerData(data, true);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if customer exists and user has permission
    const query = { _id: new ObjectId(id) };
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    const existingCustomer = await db.collection(COLLECTIONS.CUSTOMERS).findOne(query);
    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.relationToStudent !== undefined) updateData.relationToStudent = data.relationToStudent;
    if (data.notes !== undefined) updateData.notes = data.notes;

    addAuditFields(updateData, req.user._id, true);

    // Update customer
    const result = await db.collection(COLLECTIONS.CUSTOMERS).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.UPDATE, COLLECTIONS.CUSTOMERS, id, `Updated customer: ${data.name || existingCustomer.name}`);

    // Get updated customer
    const updatedCustomer = await db.collection(COLLECTIONS.CUSTOMERS).findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      data: updatedCustomer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/customers/[id] - Delete customer
export const DELETE = withAuth(async (req, context) => {
  try {
    if (!canDeleteRecords(req.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if customer exists
    const existingCustomer = await db.collection(COLLECTIONS.CUSTOMERS).findOne({ _id: new ObjectId(id) });
    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has associated fees
    const associatedFees = await db.collection(COLLECTIONS.FEES).findOne({
      payerType: 'customer',
      payerId: id
    });

    if (associatedFees) {
      return NextResponse.json(
        { error: 'Cannot delete customer with associated fee records' },
        { status: 400 }
      );
    }

    // Delete customer
    const result = await db.collection(COLLECTIONS.CUSTOMERS).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.DELETE, COLLECTIONS.CUSTOMERS, id, `Deleted customer: ${existingCustomer.name}`);

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

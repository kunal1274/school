import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES, STATUS_TYPES } from '@/lib/models';
import { withAuth, canEditAllRecords, canDeleteRecords } from '@/lib/auth';
import { validateTransportCustomerData } from '@/lib/validation';

// GET /api/transport-customers/[id] - Get transport customer by ID
export const GET = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid transport customer ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const transportCustomer = await db.collection(COLLECTIONS.TRANSPORT_CUSTOMERS).findOne({ _id: new ObjectId(id) });

    if (!transportCustomer) {
      return NextResponse.json(
        { error: 'Transport customer not found' },
        { status: 404 }
      );
    }

    // If user is staff, only allow access to their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      if (transportCustomer.createdBy.toString() !== req.user._id.toString()) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: transportCustomer
    });
  } catch (error) {
    console.error('Get transport customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/transport-customers/[id] - Update transport customer
export const PUT = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid transport customer ID' },
        { status: 400 }
      );
    }

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
    
    // Check if transport customer exists
    const existingTransportCustomer = await db.collection(COLLECTIONS.TRANSPORT_CUSTOMERS).findOne({ _id: new ObjectId(id) });
    
    if (!existingTransportCustomer) {
      return NextResponse.json(
        { error: 'Transport customer not found' },
        { status: 404 }
      );
    }

    // If user is staff, only allow editing their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      if (existingTransportCustomer.createdBy.toString() !== req.user._id.toString()) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData = {
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

    addAuditFields(updateData, req.user._id, true);

    // Update transport customer
    const result = await db.collection(COLLECTIONS.TRANSPORT_CUSTOMERS).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Transport customer not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.UPDATE, COLLECTIONS.TRANSPORT_CUSTOMERS, new ObjectId(id), `Updated transport customer: ${updateData.name}`);

    // Get updated transport customer
    const updatedTransportCustomer = await db.collection(COLLECTIONS.TRANSPORT_CUSTOMERS).findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      data: updatedTransportCustomer
    });
  } catch (error) {
    console.error('Update transport customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/transport-customers/[id] - Delete transport customer
export const DELETE = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid transport customer ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if transport customer exists
    const existingTransportCustomer = await db.collection(COLLECTIONS.TRANSPORT_CUSTOMERS).findOne({ _id: new ObjectId(id) });
    
    if (!existingTransportCustomer) {
      return NextResponse.json(
        { error: 'Transport customer not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (req.user.role === USER_ROLES.STAFF && !canDeleteRecords(req.user.role)) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to delete transport customers.' },
        { status: 403 }
      );
    }

    // If user is staff, only allow deleting their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      if (existingTransportCustomer.createdBy.toString() !== req.user._id.toString()) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Delete transport customer
    const result = await db.collection(COLLECTIONS.TRANSPORT_CUSTOMERS).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Transport customer not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.DELETE, COLLECTIONS.TRANSPORT_CUSTOMERS, new ObjectId(id), `Deleted transport customer: ${existingTransportCustomer.name}`);

    return NextResponse.json({
      success: true,
      message: 'Transport customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete transport customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

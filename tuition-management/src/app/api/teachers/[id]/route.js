import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES } from '@/lib/models';
import { withAuth, canEditAllRecords, canDeleteRecords } from '@/lib/auth';
import { validateTeacherData } from '@/lib/validation';

// GET /api/teachers/[id] - Get teacher by ID
export const GET = withAuth(async (req, context) => {
  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid teacher ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Build query based on user role
    const query = { _id: new ObjectId(id) };
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    const teacher = await db.collection(COLLECTIONS.TEACHERS).findOne(query);

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/teachers/[id] - Update teacher
export const PUT = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    const data = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid teacher ID' },
        { status: 400 }
      );
    }

    // Validate data
    const validation = validateTeacherData(data, true);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if teacher exists and user has permission
    const query = { _id: new ObjectId(id) };
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    const existingTeacher = await db.collection(COLLECTIONS.TEACHERS).findOne(query);
    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Check if email already exists (if provided and different from current)
    if (data.email && data.email !== existingTeacher.email) {
      const emailExists = await db.collection(COLLECTIONS.TEACHERS).findOne({ 
        email: data.email,
        _id: { $ne: new ObjectId(id) }
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.subjectOrRole) updateData.subjectOrRole = data.subjectOrRole;
    if (data.phone) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.joiningDate !== undefined) updateData.joiningDate = data.joiningDate ? new Date(data.joiningDate) : null;
    if (data.salary !== undefined) updateData.salary = data.salary;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status) updateData.status = data.status;

    addAuditFields(updateData, req.user._id, true);

    // Update teacher
    const result = await db.collection(COLLECTIONS.TEACHERS).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.UPDATE, COLLECTIONS.TEACHERS, id, `Updated teacher: ${data.name || existingTeacher.name}`);

    // Get updated teacher
    const updatedTeacher = await db.collection(COLLECTIONS.TEACHERS).findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      data: updatedTeacher
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/teachers/[id] - Delete teacher
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
        { error: 'Invalid teacher ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if teacher exists
    const existingTeacher = await db.collection(COLLECTIONS.TEACHERS).findOne({ _id: new ObjectId(id) });
    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Check if teacher has associated fees
    const associatedFees = await db.collection(COLLECTIONS.FEES).findOne({
      payerType: 'teacher',
      payerId: id
    });

    if (associatedFees) {
      return NextResponse.json(
        { error: 'Cannot delete teacher with associated fee records' },
        { status: 400 }
      );
    }

    // Delete teacher
    const result = await db.collection(COLLECTIONS.TEACHERS).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.DELETE, COLLECTIONS.TEACHERS, id, `Deleted teacher: ${existingTeacher.name}`);

    return NextResponse.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

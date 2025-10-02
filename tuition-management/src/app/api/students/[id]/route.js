import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES } from '@/lib/models';
import { withAuth, canEditAllRecords, canDeleteRecords } from '@/lib/auth';
import { validateStudentData } from '@/lib/validation';

// GET /api/students/[id] - Get student by ID
export const GET = withAuth(async (req, context) => {
  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Build query based on user role
    const query = { _id: new ObjectId(id) };
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    const student = await db.collection(COLLECTIONS.STUDENTS).findOne(query);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/students/[id] - Update student
export const PUT = withAuth(async (req, context) => {
  try {
    const { id } = context.params;
    const data = await req.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Validate data
    const validation = validateStudentData(data, true);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if student exists and user has permission
    const query = { _id: new ObjectId(id) };
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    const existingStudent = await db.collection(COLLECTIONS.STUDENTS).findOne(query);
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.dob !== undefined) updateData.dob = data.dob ? new Date(data.dob) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.classOrBatch) updateData.classOrBatch = data.classOrBatch;
    if (data.parentName) updateData.parentName = data.parentName;
    if (data.parentPhone) updateData.parentPhone = data.parentPhone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.transportOptIn !== undefined) updateData.transportOptIn = data.transportOptIn;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status) updateData.status = data.status;

    addAuditFields(updateData, req.user._id, true);

    // Update student
    const result = await db.collection(COLLECTIONS.STUDENTS).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.UPDATE, COLLECTIONS.STUDENTS, id, `Updated student: ${data.firstName || existingStudent.firstName} ${data.lastName || existingStudent.lastName}`);

    // Get updated student
    const updatedStudent = await db.collection(COLLECTIONS.STUDENTS).findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/students/[id] - Delete student
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
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if student exists
    const existingStudent = await db.collection(COLLECTIONS.STUDENTS).findOne({ _id: new ObjectId(id) });
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if student has associated fees
    const associatedFees = await db.collection(COLLECTIONS.FEES).findOne({
      payerType: 'student',
      payerId: id
    });

    if (associatedFees) {
      return NextResponse.json(
        { error: 'Cannot delete student with associated fee records' },
        { status: 400 }
      );
    }

    // Delete student
    const result = await db.collection(COLLECTIONS.STUDENTS).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.DELETE, COLLECTIONS.STUDENTS, id, `Deleted student: ${existingStudent.firstName} ${existingStudent.lastName}`);

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

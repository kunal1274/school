import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES, STATUS_TYPES } from '@/lib/models';
import { withAuth, canEditAllRecords } from '@/lib/auth';
import { validateTeacherData } from '@/lib/validation';

// Generate unique teacher code
async function generateTeacherCode(db) {
  const lastTeacher = await db.collection(COLLECTIONS.TEACHERS)
    .findOne({}, { sort: { teacherCode: -1 } });
  
  let nextNumber = 1;
  if (lastTeacher && lastTeacher.teacherCode) {
    const match = lastTeacher.teacherCode.match(/T-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `T-${nextNumber.toString().padStart(4, '0')}`;
}

// GET /api/teachers - List teachers
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
        { teacherCode: { $regex: search, $options: 'i' } },
        { subjectOrRole: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
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
    const total = await db.collection(COLLECTIONS.TEACHERS).countDocuments(query);

    // Get teachers with pagination
    const teachers = await db.collection(COLLECTIONS.TEACHERS)
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/teachers - Create teacher
export const POST = withAuth(async (req) => {
  try {
    const data = await req.json();

    // Validate data
    const validation = validateTeacherData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Generate unique teacher code
    const teacherCode = await generateTeacherCode(db);

    // Check if email already exists (if provided)
    if (data.email) {
      const existingTeacher = await db.collection(COLLECTIONS.TEACHERS).findOne({ email: data.email });
      if (existingTeacher) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare teacher data
    const teacherData = {
      teacherCode,
      name: data.name,
      subjectOrRole: data.subjectOrRole,
      phone: data.phone,
      email: data.email || '',
      address: data.address || '',
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      salary: data.salary || null,
      notes: data.notes || '',
      status: data.status || STATUS_TYPES.ACTIVE
    };

    addAuditFields(teacherData, req.user._id);

    // Insert teacher
    const result = await db.collection(COLLECTIONS.TEACHERS).insertOne(teacherData);

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.CREATE, COLLECTIONS.TEACHERS, result.insertedId, `Created teacher: ${teacherData.name}`);

    teacherData._id = result.insertedId;

    return NextResponse.json({
      success: true,
      data: teacherData
    }, { status: 201 });
  } catch (error) {
    console.error('Create teacher error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
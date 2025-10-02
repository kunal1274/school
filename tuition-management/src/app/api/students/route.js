import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES, STATUS_TYPES } from '@/lib/models';
import { withAuth, canEditAllRecords } from '@/lib/auth';
import { validateStudentData } from '@/lib/validation';

// Generate unique student code
async function generateStudentCode(db) {
  const lastStudent = await db.collection(COLLECTIONS.STUDENTS)
    .findOne({}, { sort: { studentCode: -1 } });
  
  let nextNumber = 1;
  if (lastStudent && lastStudent.studentCode) {
    const match = lastStudent.studentCode.match(/S-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `S-${nextNumber.toString().padStart(4, '0')}`;
}

// GET /api/students - List students
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const classOrBatch = searchParams.get('class') || '';
    const status = searchParams.get('status') || '';

    const db = await getDatabase();
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentCode: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { parentPhone: { $regex: search, $options: 'i' } }
      ];
    }
    if (classOrBatch) {
      query.classOrBatch = { $regex: classOrBatch, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    // If user is staff, only show their created records
    if (req.user.role === USER_ROLES.STAFF && !canEditAllRecords(req.user.role)) {
      query.createdBy = req.user._id;
    }

    // Get total count
    const total = await db.collection(COLLECTIONS.STUDENTS).countDocuments(query);

    // Get students with pagination
    const students = await db.collection(COLLECTIONS.STUDENTS)
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/students - Create student
export const POST = withAuth(async (req) => {
  try {
    const data = await req.json();

    // Validate data
    const validation = validateStudentData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Generate unique student code
    const studentCode = await generateStudentCode(db);

    // Prepare student data
    const studentData = {
      studentCode,
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob ? new Date(data.dob) : null,
      gender: data.gender || '',
      classOrBatch: data.classOrBatch,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      address: data.address || '',
      transportOptIn: data.transportOptIn || false,
      photoUrl: data.photoUrl || '',
      notes: data.notes || '',
      status: data.status || STATUS_TYPES.ACTIVE
    };

    addAuditFields(studentData, req.user._id);

    // Insert student
    const result = await db.collection(COLLECTIONS.STUDENTS).insertOne(studentData);

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.CREATE, COLLECTIONS.STUDENTS, result.insertedId, `Created student: ${studentData.firstName} ${studentData.lastName}`);

    studentData._id = result.insertedId;

    return NextResponse.json({
      success: true,
      data: studentData
    }, { status: 201 });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
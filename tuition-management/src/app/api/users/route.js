import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, addAuditFields, logActivity, LOG_ACTIONS, USER_ROLES } from '@/lib/models';
import { withAuth, hashPassword, canManageUsers } from '@/lib/auth';
import { validateUserData } from '@/lib/validation';

// GET /api/users - List users (Admin only)
export const GET = withAuth(async (req) => {
  try {
    if (!canManageUsers(req.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const db = await getDatabase();
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    // Get total count
    const total = await db.collection(COLLECTIONS.USERS).countDocuments(query);

    // Get users with pagination
    const users = await db.collection(COLLECTIONS.USERS)
      .find(query, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, USER_ROLES.ADMIN);

// POST /api/users - Create user (Admin only)
export const POST = withAuth(async (req) => {
  try {
    if (!canManageUsers(req.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Validate data
    const validation = validateUserData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if email already exists
    const existingUser = await db.collection(COLLECTIONS.USERS).findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Prepare user data
    const userData = {
      email: data.email,
      passwordHash,
      role: data.role,
      name: data.name,
      phone: data.phone || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      lastLoginAt: null
    };

    addAuditFields(userData, req.user._id);

    // Insert user
    const result = await db.collection(COLLECTIONS.USERS).insertOne(userData);

    // Log activity
    await logActivity(req.user._id, LOG_ACTIONS.CREATE, COLLECTIONS.USERS, result.insertedId, `Created user: ${userData.name}`);

    // Remove password hash from response
    const { passwordHash: _, ...userResponse } = userData;
    userResponse._id = result.insertedId;

    return NextResponse.json({
      success: true,
      data: userResponse
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, USER_ROLES.ADMIN);
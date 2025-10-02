import { NextResponse } from 'next/server';
import { getDatabase, COLLECTIONS, logActivity, LOG_ACTIONS } from '@/lib/models';
import { verifyPassword, generateToken } from '@/lib/auth';
import { validateEmail, validateRequired } from '@/lib/validation';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!validateRequired(email) || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!validateRequired(password)) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Find user
    const db = await getDatabase();
    const user = await db.collection(COLLECTIONS.USERS).findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await db.collection(COLLECTIONS.USERS).updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );

    // Log activity
    await logActivity(user._id, LOG_ACTIONS.READ, COLLECTIONS.USERS, user._id, 'User login');

    // Generate token
    const token = generateToken(user);

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    // Set cookie and return response
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

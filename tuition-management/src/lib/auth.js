import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS, USER_ROLES } from './models';

// JWT_SECRET will be accessed when needed to ensure it's loaded

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return null;
    }
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

export async function getUserFromToken(token) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const db = await getDatabase();
    const user = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { passwordHash: 0 } }
    );

    return user;
  } catch (error) {
    console.error('getUserFromToken error:', error);
    return null;
  }
}

// Role-based access control helpers
export function hasPermission(userRole, requiredRole) {
  const roleHierarchy = {
    [USER_ROLES.STAFF]: 1,
    [USER_ROLES.MODERATOR]: 2,
    [USER_ROLES.ADMIN]: 3
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canManageUsers(userRole) {
  return userRole === USER_ROLES.ADMIN;
}

export function canDeleteRecords(userRole) {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.MODERATOR;
}

export function canEditAllRecords(userRole) {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.MODERATOR;
}

export function canViewAllRecords(userRole) {
  return true; // All roles can view records
}

// Middleware to protect API routes (Next.js App Router compatible)
export function withAuth(handler, requiredRole = null) {
  return async (req, context) => {
    try {
      const { NextResponse } = await import('next/server');
      const { cookies } = await import('next/headers');
      
      // Get token from cookies or authorization header
      const authHeader = req.headers.get('authorization');
      const cookieStore = await cookies();
      const token = authHeader?.replace('Bearer ', '') || 
                   cookieStore.get('token')?.value;

      console.log('Token debug:', {
        hasAuthHeader: !!authHeader,
        hasCookie: !!cookieStore.get('token')?.value,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...'
      });

      if (!token) {
        console.log('Auth failed: No token provided');
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
      }

      const user = await getUserFromToken(token);
      if (!user) {
        console.log('Auth failed: Invalid token');
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      if (!user.isActive) {
        console.log('Auth failed: Account inactive');
        return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
      }

      console.log('Auth success:', { userId: user._id, role: user.role, requiredRole });

      if (requiredRole && !hasPermission(user.role, requiredRole)) {
        console.log('Auth failed: Insufficient permissions', { userRole: user.role, requiredRole });
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      // Add user to request object
      req.user = user;
      return handler(req, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      const { NextResponse } = await import('next/server');
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
  };
}

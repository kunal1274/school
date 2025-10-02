import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, COLLECTIONS, USER_ROLES } from './models';

const JWT_SECRET = process.env.JWT_SECRET;

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user) {
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
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const db = await getDatabase();
    const user = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: decoded.userId },
      { projection: { passwordHash: 0 } }
    );

    return user;
  } catch (error) {
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

// Middleware to protect API routes
export function withAuth(handler, requiredRole = null) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || 
                   req.cookies?.token;

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const user = await getUserFromToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      if (requiredRole && !hasPermission(user.role, requiredRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  };
}
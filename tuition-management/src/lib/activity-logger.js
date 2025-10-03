import { getDatabase, COLLECTIONS } from './models.js';

/**
 * Activity Logger for tracking user actions and system events
 */
export class ActivityLogger {
  static async logActivity({
    userId,
    action,
    entityType,
    entityId,
    entityName,
    details = {},
    ipAddress = null,
    userAgent = null
  }) {
    try {
      const db = await getDatabase();
      
      const activityLog = {
        userId,
        action, // 'create', 'update', 'delete', 'view', 'login', 'logout', etc.
        entityType, // 'student', 'teacher', 'customer', 'fee', 'user', etc.
        entityId,
        entityName,
        details,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        createdAt: new Date()
      };

      await db.collection(COLLECTIONS.ACTIVITY_LOGS).insertOne(activityLog);
      
      return activityLog;
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error to avoid breaking the main operation
      return null;
    }
  }

  static async getActivityLogs({
    userId = null,
    entityType = null,
    action = null,
    startDate = null,
    endDate = null,
    limit = 100,
    skip = 0
  } = {}) {
    try {
      const db = await getDatabase();
      
      const filter = {};
      
      if (userId) filter.userId = userId;
      if (entityType) filter.entityType = entityType;
      if (action) filter.action = action;
      
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
      }

      const logs = await db.collection(COLLECTIONS.ACTIVITY_LOGS)
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await db.collection(COLLECTIONS.ACTIVITY_LOGS).countDocuments(filter);

      return {
        success: true,
        data: logs,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total
        }
      };
    } catch (error) {
      console.error('Failed to get activity logs:', error);
      return {
        success: false,
        error: 'Failed to fetch activity logs',
        data: []
      };
    }
  }

  static async getUserActivitySummary(userId, days = 30) {
    try {
      const db = await getDatabase();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const pipeline = [
        {
          $match: {
            userId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              action: '$action',
              entityType: '$entityType'
            },
            count: { $sum: 1 },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ];

      const summary = await db.collection(COLLECTIONS.ACTIVITY_LOGS)
        .aggregate(pipeline)
        .toArray();

      return {
        success: true,
        data: summary
      };
    } catch (error) {
      console.error('Failed to get user activity summary:', error);
      return {
        success: false,
        error: 'Failed to fetch activity summary',
        data: []
      };
    }
  }

  static async getSystemStats(days = 30) {
    try {
      const db = await getDatabase();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const pipeline = [
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              action: '$action',
              entityType: '$entityType'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ];

      const stats = await db.collection(COLLECTIONS.ACTIVITY_LOGS)
        .aggregate(pipeline)
        .toArray();

      // Get daily activity counts
      const dailyPipeline = [
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ];

      const dailyStats = await db.collection(COLLECTIONS.ACTIVITY_LOGS)
        .aggregate(dailyPipeline)
        .toArray();

      return {
        success: true,
        data: {
          activityStats: stats,
          dailyActivity: dailyStats
        }
      };
    } catch (error) {
      console.error('Failed to get system stats:', error);
      return {
        success: false,
        error: 'Failed to fetch system stats',
        data: { activityStats: [], dailyActivity: [] }
      };
    }
  }
}

// Helper function to extract client info from request
export function extractClientInfo(req) {
  const ipAddress = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   req.socket?.remoteAddress ||
                   'unknown';
  
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  return { ipAddress, userAgent };
}

// Helper function to format activity message
export function formatActivityMessage(action, entityType, entityName) {
  const actionMap = {
    create: 'created',
    update: 'updated',
    delete: 'deleted',
    view: 'viewed',
    login: 'logged in',
    logout: 'logged out',
    export: 'exported',
    import: 'imported',
    duplicate: 'duplicated'
  };

  const entityMap = {
    student: 'student',
    teacher: 'teacher',
    customer: 'customer',
    'transport-customer': 'transport customer',
    fee: 'fee',
    user: 'user'
  };

  const actionText = actionMap[action] || action;
  const entityText = entityMap[entityType] || entityType;

  return `${actionText} ${entityText}${entityName ? ` "${entityName}"` : ''}`;
}

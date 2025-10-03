import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { ActivityLogger } from '@/lib/activity-logger';

export const GET = withAuth(async (req, context) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters = {
      userId: searchParams.get('userId'),
      entityType: searchParams.get('entityType'),
      action: searchParams.get('action'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      limit: parseInt(searchParams.get('limit')) || 50,
      skip: parseInt(searchParams.get('skip')) || 0
    };

    const result = await ActivityLogger.getActivityLogs(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Activity logs API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}, 'admin'); // Only admins can view activity logs

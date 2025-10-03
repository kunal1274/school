import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { BackupRestore } from '@/lib/backup-restore';

export const GET = withAuth(async (req, context) => {
  try {
    const user = context.user;
    const result = await BackupRestore.getBackups(user._id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Backups fetch API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}, 'admin'); // Only admins can view backups

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { BackupRestore } from '@/lib/backup-restore';

export const POST = withAuth(async (req, context) => {
  try {
    const user = context.user;
    const result = await BackupRestore.createBackup(user._id);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Backup creation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}, 'admin'); // Only admins can create backups

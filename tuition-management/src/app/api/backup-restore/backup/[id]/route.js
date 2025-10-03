import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { BackupRestore } from '@/lib/backup-restore';

export const DELETE = withAuth(async (req, context) => {
  try {
    const user = context.user;
    const { id } = context.params;
    
    const result = await BackupRestore.deleteBackup(id, user._id);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error('Backup deletion API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}, 'admin'); // Only admins can delete backups

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { BackupRestore } from '@/lib/backup-restore';

export const POST = withAuth(async (req, context) => {
  try {
    const user = context.user;
    const { id } = context.params;
    const body = await req.json();
    
    const result = await BackupRestore.restoreBackup(id, user._id, body);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Backup restore API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}, 'admin'); // Only admins can restore backups

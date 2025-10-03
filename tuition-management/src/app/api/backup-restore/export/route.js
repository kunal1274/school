import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { BackupRestore } from '@/lib/backup-restore';

export const GET = withAuth(async (req, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const collections = searchParams.get('collections')?.split(',') || [];

    const result = await BackupRestore.exportData(format, collections);

    if (result.success) {
      const headers = new Headers();
      if (format === 'csv') {
        headers.set('Content-Type', 'text/csv');
      } else {
        headers.set('Content-Type', 'application/json');
      }
      
      return new NextResponse(result.data, { headers });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Data export API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}, 'admin'); // Only admins can export data

'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmationDialog } from '@/components/CustomDialog';
import { LoadingSpinner } from '@/components/LoadingStates';

export default function BackupRestorePage() {
  const { user } = useAuth();
  const { confirm, alert, DialogComponent } = useConfirmationDialog();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backup-restore/backups', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    const confirmed = await confirm(
      'Create Backup',
      'Are you sure you want to create a new backup? This may take a few moments.',
      'info'
    );

    if (!confirmed) return;

    setCreatingBackup(true);
    try {
      const response = await fetch('/api/backup-restore/backup', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        alert('Success', 'Backup created successfully!', 'success');
        fetchBackups(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Error', error.error || 'Failed to create backup', 'error');
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Error', 'Failed to create backup. Please try again.', 'error');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    const confirmed = await confirm(
      'Restore Backup',
      'Are you sure you want to restore this backup? This will overwrite existing data and cannot be undone.',
      'warning'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/backup-restore/restore/${backupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clearExisting: true }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        alert('Success', `Backup restored successfully! ${data.data.restoredCount} records restored.`, 'success');
      } else {
        const error = await response.json();
        alert('Error', error.error || 'Failed to restore backup', 'error');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert('Error', 'Failed to restore backup. Please try again.', 'error');
    }
  };

  const handleDeleteBackup = async (backupId) => {
    const confirmed = await confirm(
      'Delete Backup',
      'Are you sure you want to delete this backup? This action cannot be undone.',
      'warning'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/backup-restore/backup/${backupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Success', 'Backup deleted successfully!', 'success');
        fetchBackups(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Error', error.error || 'Failed to delete backup', 'error');
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
      alert('Error', 'Failed to delete backup. Please try again.', 'error');
    }
  };

  const handleExportData = async (format) => {
    setExporting(true);
    try {
      const response = await fetch(`/api/backup-restore/export?format=${format}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create and download file
        const blob = new Blob([data.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tuition-management-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('Success', `Data exported successfully as ${format.toUpperCase()}!`, 'success');
      } else {
        const error = await response.json();
        alert('Error', error.error || 'Failed to export data', 'error');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Error', 'Failed to export data. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
            <p className="text-gray-600">Manage system backups and data exports</p>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingBackup ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Backup...
                  </>
                ) : (
                  'Create New Backup'
                )}
              </button>

              <button
                onClick={() => handleExportData('json')}
                disabled={exporting}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Exporting...
                  </>
                ) : (
                  'Export as JSON'
                )}
              </button>

              <button
                onClick={() => handleExportData('csv')}
                disabled={exporting}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Exporting...
                  </>
                ) : (
                  'Export as CSV'
                )}
              </button>
            </div>
          </div>

          {/* Backups List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                System Backups ({backups.length})
              </h3>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading backups...</p>
                </div>
              ) : backups.length > 0 ? (
                <div className="space-y-4">
                  {backups.map((backup) => (
                    <div key={backup._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-lg">💾</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {backup._id}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Created: {formatDate(backup.timestamp)} • 
                              Size: {formatFileSize(backup.size)} • 
                              Records: {backup.recordCount}
                            </p>
                            <p className="text-xs text-gray-500">
                              Collections: {backup.collections.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRestoreBackup(backup._id)}
                          className="px-3 py-2 text-sm font-medium text-green-600 hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup._id)}
                          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">💾</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Backups</h3>
                  <p className="text-gray-600 mb-4">No system backups found. Create your first backup to get started.</p>
                  <button
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Create First Backup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogComponent />
      </Layout>
    </ProtectedRoute>
  );
}

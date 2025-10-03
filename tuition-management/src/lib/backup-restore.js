import { getDatabase, COLLECTIONS } from './models.js';
import { ActivityLogger } from './activity-logger.js';

/**
 * Backup and Restore functionality for the tuition management system
 */
export class BackupRestore {
  static async createBackup(userId) {
    try {
      const db = await getDatabase();
      const timestamp = new Date().toISOString();
      const backupId = `backup_${timestamp.replace(/[:.]/g, '-')}`;

      // Collect all data from collections
      const collections = [
        COLLECTIONS.USERS,
        COLLECTIONS.STUDENTS,
        COLLECTIONS.TEACHERS,
        COLLECTIONS.CUSTOMERS,
        COLLECTIONS.TRANSPORT_CUSTOMERS,
        COLLECTIONS.FEES,
        COLLECTIONS.ACTIVITY_LOGS
      ];

      const backupData = {
        id: backupId,
        timestamp: new Date(),
        version: '1.0',
        collections: {}
      };

      // Export data from each collection
      for (const collectionName of collections) {
        const collection = db.collection(collectionName);
        const data = await collection.find({}).toArray();
        backupData.collections[collectionName] = data;
      }

      // Store backup metadata
      const backupRecord = {
        _id: backupId,
        userId,
        timestamp: new Date(),
        size: JSON.stringify(backupData).length,
        collections: collections,
        recordCount: Object.values(backupData.collections).reduce((sum, data) => sum + data.length, 0),
        createdAt: new Date()
      };

      await db.collection('backups').insertOne(backupRecord);

      // Log the backup activity
      await ActivityLogger.logActivity({
        userId,
        action: 'backup',
        entityType: 'system',
        entityId: backupId,
        entityName: `Backup ${backupId}`,
        details: {
          collections: collections,
          recordCount: backupRecord.recordCount,
          size: backupRecord.size
        }
      });

      return {
        success: true,
        data: {
          backupId,
          backupData,
          metadata: backupRecord
        }
      };
    } catch (error) {
      console.error('Backup creation failed:', error);
      return {
        success: false,
        error: 'Failed to create backup'
      };
    }
  }

  static async getBackups(userId = null) {
    try {
      const db = await getDatabase();
      
      const filter = userId ? { userId } : {};
      const backups = await db.collection('backups')
        .find(filter)
        .sort({ timestamp: -1 })
        .toArray();

      return {
        success: true,
        data: backups
      };
    } catch (error) {
      console.error('Failed to get backups:', error);
      return {
        success: false,
        error: 'Failed to fetch backups',
        data: []
      };
    }
  }

  static async restoreBackup(backupId, userId, options = {}) {
    try {
      const db = await getDatabase();
      
      // Get backup data
      const backupRecord = await db.collection('backups').findOne({ _id: backupId });
      if (!backupRecord) {
        return {
          success: false,
          error: 'Backup not found'
        };
      }

      // For now, we'll need to recreate the backup data from the stored backup
      // In a real implementation, you'd store the actual backup data
      const backupData = await this.getBackupData(backupId);
      if (!backupData) {
        return {
          success: false,
          error: 'Backup data not found'
        };
      }

      const { clearExisting = false, collections = [] } = options;
      const collectionsToRestore = collections.length > 0 ? collections : Object.keys(backupData.collections);

      // Clear existing data if requested
      if (clearExisting) {
        for (const collectionName of collectionsToRestore) {
          await db.collection(collectionName).deleteMany({});
        }
      }

      // Restore data
      let restoredCount = 0;
      for (const collectionName of collectionsToRestore) {
        if (backupData.collections[collectionName]) {
          const data = backupData.collections[collectionName];
          if (data.length > 0) {
            await db.collection(collectionName).insertMany(data);
            restoredCount += data.length;
          }
        }
      }

      // Log the restore activity
      await ActivityLogger.logActivity({
        userId,
        action: 'restore',
        entityType: 'system',
        entityId: backupId,
        entityName: `Restore from ${backupId}`,
        details: {
          collections: collectionsToRestore,
          recordCount: restoredCount,
          clearExisting
        }
      });

      return {
        success: true,
        data: {
          backupId,
          restoredCount,
          collections: collectionsToRestore
        }
      };
    } catch (error) {
      console.error('Backup restore failed:', error);
      return {
        success: false,
        error: 'Failed to restore backup'
      };
    }
  }

  static async deleteBackup(backupId, userId) {
    try {
      const db = await getDatabase();
      
      const result = await db.collection('backups').deleteOne({ _id: backupId });
      
      if (result.deletedCount === 0) {
        return {
          success: false,
          error: 'Backup not found'
        };
      }

      // Log the delete activity
      await ActivityLogger.logActivity({
        userId,
        action: 'delete',
        entityType: 'backup',
        entityId: backupId,
        entityName: `Backup ${backupId}`,
        details: { action: 'backup_deleted' }
      });

      return {
        success: true,
        data: { backupId }
      };
    } catch (error) {
      console.error('Backup deletion failed:', error);
      return {
        success: false,
        error: 'Failed to delete backup'
      };
    }
  }

  static async getBackupData(backupId) {
    // In a real implementation, this would retrieve the actual backup data
    // For now, we'll return null as we don't have persistent storage for backup data
    return null;
  }

  static async exportData(format = 'json', collections = []) {
    try {
      const db = await getDatabase();
      
      const collectionsToExport = collections.length > 0 ? collections : [
        COLLECTIONS.USERS,
        COLLECTIONS.STUDENTS,
        COLLECTIONS.TEACHERS,
        COLLECTIONS.CUSTOMERS,
        COLLECTIONS.TRANSPORT_CUSTOMERS,
        COLLECTIONS.FEES
      ];

      const exportData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        collections: {}
      };

      for (const collectionName of collectionsToExport) {
        const collection = db.collection(collectionName);
        const data = await collection.find({}).toArray();
        exportData.collections[collectionName] = data;
      }

      if (format === 'csv') {
        return this.convertToCSV(exportData);
      }

      return {
        success: true,
        data: exportData
      };
    } catch (error) {
      console.error('Data export failed:', error);
      return {
        success: false,
        error: 'Failed to export data'
      };
    }
  }

  static convertToCSV(data) {
    // Simple CSV conversion - in a real implementation, you'd use a proper CSV library
    const csvData = [];
    
    for (const [collectionName, records] of Object.entries(data.collections)) {
      if (records.length === 0) continue;
      
      csvData.push(`\n=== ${collectionName.toUpperCase()} ===\n`);
      
      // Get headers from first record
      const headers = Object.keys(records[0]);
      csvData.push(headers.join(','));
      
      // Add data rows
      records.forEach(record => {
        const row = headers.map(header => {
          const value = record[header];
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          return value || '';
        });
        csvData.push(row.join(','));
      });
    }
    
    return {
      success: true,
      data: csvData.join('\n')
    };
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

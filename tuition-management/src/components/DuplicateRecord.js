'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirmationDialog } from './CustomDialog';
import { LoadingSpinner } from './LoadingStates';

export default function DuplicateRecord({ 
  record, 
  recordType, 
  onDuplicate, 
  className = "" 
}) {
  const [loading, setLoading] = useState(false);
  const { alert, DialogComponent } = useConfirmationDialog();
  const router = useRouter();

  const handleDuplicate = async () => {
    if (!onDuplicate) return;

    setLoading(true);
    try {
      const duplicatedRecord = await onDuplicate(record);
      
      if (duplicatedRecord) {
        alert(
          'Success', 
          `${recordType} duplicated successfully!`, 
          'success'
        );
        
        // Navigate to the duplicated record's edit page
        setTimeout(() => {
          router.push(`/${recordType.toLowerCase()}s/${duplicatedRecord._id}/edit`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error duplicating record:', error);
      alert(
        'Error', 
        `Failed to duplicate ${recordType.toLowerCase()}. Please try again.`, 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const getRecordName = () => {
    switch (recordType) {
      case 'Student':
        return `${record.firstName} ${record.lastName}`;
      case 'Teacher':
        return `${record.firstName} ${record.lastName}`;
      case 'Customer':
        return record.name;
      case 'Transport Customer':
        return record.name;
      case 'User':
        return record.name;
      case 'Fee':
        return record.transactionId;
      default:
        return record.name || record.title || 'Record';
    }
  };

  return (
    <>
      <button
        onClick={handleDuplicate}
        disabled={loading}
        className={`inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title={`Duplicate ${recordType}`}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Duplicating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate
          </>
        )}
      </button>

      <DialogComponent />
    </>
  );
}

// Helper function to prepare record for duplication
export function prepareRecordForDuplication(record, recordType) {
  const baseRecord = { ...record };
  
  // Remove fields that shouldn't be duplicated
  delete baseRecord._id;
  delete baseRecord.createdAt;
  delete baseRecord.updatedAt;
  delete baseRecord.createdBy;
  delete baseRecord.updatedBy;

  switch (recordType) {
    case 'Student':
      // Add "Copy" to name and generate new student code
      baseRecord.firstName = `${baseRecord.firstName} (Copy)`;
      delete baseRecord.studentCode; // Will be auto-generated
      break;
      
    case 'Teacher':
      // Add "Copy" to name and generate new teacher code
      baseRecord.firstName = `${baseRecord.firstName} (Copy)`;
      delete baseRecord.teacherCode; // Will be auto-generated
      break;
      
    case 'Customer':
      // Add "Copy" to name
      baseRecord.name = `${baseRecord.name} (Copy)`;
      break;
      
    case 'Transport Customer':
      // Add "Copy" to name
      baseRecord.name = `${baseRecord.name} (Copy)`;
      break;
      
    case 'User':
      // Add "Copy" to name and generate new email
      baseRecord.name = `${baseRecord.name} (Copy)`;
      baseRecord.email = `${baseRecord.email.split('@')[0]}_copy@${baseRecord.email.split('@')[1]}`;
      break;
      
    case 'Fee':
      // Add "Copy" to reference and generate new transaction ID
      baseRecord.reference = `${baseRecord.reference} (Copy)`;
      delete baseRecord.transactionId; // Will be auto-generated
      break;
      
    default:
      // Generic handling
      if (baseRecord.name) {
        baseRecord.name = `${baseRecord.name} (Copy)`;
      }
      if (baseRecord.title) {
        baseRecord.title = `${baseRecord.title} (Copy)`;
      }
  }

  return baseRecord;
}

// Hook for duplicate functionality
export function useDuplicateRecord(recordType) {
  const [loading, setLoading] = useState(false);

  const duplicateRecord = async (record) => {
    setLoading(true);
    try {
      const preparedRecord = prepareRecordForDuplication(record, recordType);
      
      const response = await fetch(`/api/${recordType.toLowerCase()}s`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedRecord),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate record');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error duplicating record:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    duplicateRecord,
    loading
  };
}

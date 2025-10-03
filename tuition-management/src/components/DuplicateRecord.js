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
  const { duplicateRecord: duplicateRecordHook, error: duplicateError } = useDuplicateRecord(recordType);

  const handleDuplicate = async () => {
    if (!onDuplicate) return;

    setLoading(true);
    try {
      const duplicatedRecord = await duplicateRecordHook(record);
      
      if (duplicatedRecord) {
        alert(
          'Success', 
          `${recordType} duplicated successfully!`, 
          'success'
        );
        
        // Call the onDuplicate callback to refresh the list
        if (onDuplicate) {
          onDuplicate();
        }
        
        // Navigate to the duplicated record's edit page
        setTimeout(() => {
          const getEditUrl = (type, id) => {
            switch (type) {
              case 'CustomerPolicy':
                return `/customer-policies/${id}/edit`;
              case 'PolicyPayment':
                return `/policy-payments/${id}/edit`;
              case 'Transport Customer':
                return `/transport-customers/${id}/edit`;
              default:
                return `/${type.toLowerCase()}s/${id}/edit`;
            }
          };
          router.push(getEditUrl(recordType, duplicatedRecord._id));
        }, 1500);
      } else {
        // Show specific error message if available, otherwise generic
        const errorMessage = duplicateError || `Failed to duplicate ${recordType.toLowerCase()}. Please try again.`;
        alert(
          'Error', 
          errorMessage, 
          'error'
        );
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
        return record.name;
      case 'Customer':
        return record.name;
      case 'Transport Customer':
        return record.name;
      case 'User':
        return record.name;
      case 'Fee':
        return record.transactionId;
      case 'Insurer':
        return record.name;
      case 'Policy':
        return record.name;
      case 'CustomerPolicy':
        return record.policyNumber;
      case 'PolicyPayment':
        return record.transactionId;
      case 'Claim':
        return record.claimNumber;
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
      baseRecord.name = `${baseRecord.name} (Copy)`;
      delete baseRecord.teacherCode; // Will be auto-generated
      
      // Handle duplicate email by adding Copy1, Copy2, etc.
      if (baseRecord.email) {
        const emailParts = baseRecord.email.split('@');
        baseRecord.email = `${emailParts[0]}_copy@${emailParts[1]}`;
      }
      break;
      
    case 'Customer':
      // Add "Copy" to name
      baseRecord.name = `${baseRecord.name} (Copy)`;
      
      // Handle duplicate email by adding _copy
      if (baseRecord.email) {
        const emailParts = baseRecord.email.split('@');
        baseRecord.email = `${emailParts[0]}_copy@${emailParts[1]}`;
      }
      break;
      
    case 'Transport Customer':
      // Add "Copy" to name
      baseRecord.name = `${baseRecord.name} (Copy)`;
      
      // Handle duplicate email by adding _copy
      if (baseRecord.email) {
        const emailParts = baseRecord.email.split('@');
        baseRecord.email = `${emailParts[0]}_copy@${emailParts[1]}`;
      }
      break;
      
    case 'User':
      // Add "Copy" to name and generate new email
      baseRecord.name = `${baseRecord.name} (Copy)`;
      if (baseRecord.email) {
        const emailParts = baseRecord.email.split('@');
        baseRecord.email = `${emailParts[0]}_copy@${emailParts[1]}`;
      }
      break;
      
    case 'Fee':
      // Add "Copy" to reference and generate new transaction ID
      baseRecord.reference = `${baseRecord.reference} (Copy)`;
      delete baseRecord.transactionId; // Will be auto-generated
      break;
      
    case 'Insurer':
      // Add "Copy" to name and generate new code
      baseRecord.name = `${baseRecord.name} (Copy)`;
      delete baseRecord.code; // Will be auto-generated
      
      // Handle duplicate email by adding _copy
      if (baseRecord.email) {
        const emailParts = baseRecord.email.split('@');
        baseRecord.email = `${emailParts[0]}_copy@${emailParts[1]}`;
      }
      break;
      
    case 'Policy':
      // Add "Copy" to name and generate new policy number
      baseRecord.name = `${baseRecord.name} (Copy)`;
      delete baseRecord.policyNumber; // Will be auto-generated
      break;
      
    case 'CustomerPolicy':
      // Add "Copy" to policy number and generate new policy number
      baseRecord.policyNumber = `${baseRecord.policyNumber} (Copy)`;
      delete baseRecord.policyNumber; // Will be auto-generated
      break;
      
    case 'PolicyPayment':
      // Add "Copy" to transaction ID and generate new transaction ID
      baseRecord.transactionId = `${baseRecord.transactionId} (Copy)`;
      delete baseRecord.transactionId; // Will be auto-generated
      break;
      
    case 'Claim':
      // Add "Copy" to claim number and generate new claim number
      baseRecord.claimNumber = `${baseRecord.claimNumber} (Copy)`;
      delete baseRecord.claimNumber; // Will be auto-generated
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
  const [error, setError] = useState(null);

  const duplicateRecord = async (record) => {
    setLoading(true);
    setError(null); // Clear previous errors
    
    // Try to duplicate with automatic email conflict resolution
    let attempt = 0;
    const maxAttempts = 5;
    
    while (attempt < maxAttempts) {
      try {
        const preparedRecord = prepareRecordForDuplication(record, recordType);
        
        // Handle email conflicts by adding Copy1, Copy2, etc.
        if (preparedRecord.email && attempt > 0) {
          const emailParts = preparedRecord.email.split('@');
          const baseEmail = emailParts[0].replace(/_copy\d*$/, ''); // Remove existing _copy suffix
          preparedRecord.email = `${baseEmail}_copy${attempt}@${emailParts[1]}`;
        }
        
        // Map record types to correct API endpoints
        const getApiEndpoint = (type) => {
          switch (type) {
            case 'CustomerPolicy':
              return '/api/customer-policies';
            case 'PolicyPayment':
              return '/api/policy-payments';
            case 'Transport Customer':
              return '/api/transport-customers';
            default:
              return `/api/${type.toLowerCase()}s`;
          }
        };
        
        const response = await fetch(getApiEndpoint(recordType), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preparedRecord),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error Response:', errorData);
          console.error('Prepared Record:', preparedRecord);
          
          // If it's an email conflict and we haven't reached max attempts, try again
          if (errorData.error === 'Email already exists' && attempt < maxAttempts - 1) {
            attempt++;
            continue;
          }
          
          // Show detailed validation errors if available
          if (errorData.details) {
            console.error('Validation Errors:', errorData.details);
            const errorMessages = Object.entries(errorData.details)
              .map(([field, message]) => `${field}: ${message}`)
              .join(', ');
            throw new Error(`Validation failed: ${errorMessages}`);
          }
          
          throw new Error(errorData.error || `Failed to duplicate ${recordType.toLowerCase()}`);
        }

        const data = await response.json();
        return data.data;
      } catch (error) {
        // If it's an email conflict and we haven't reached max attempts, try again
        if (error.message === 'Email already exists' && attempt < maxAttempts - 1) {
          attempt++;
          continue;
        }
        
        console.error('Error duplicating record:', error);
        setError(error.message);
        return null;
      }
    }
    
    setLoading(false);
    return null;
  };

  return {
    duplicateRecord,
    loading,
    error
  };
}

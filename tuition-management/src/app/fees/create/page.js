'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useConfirmationDialog } from '@/components/CustomDialog';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';

export default function CreateFeePage() {
  const router = useRouter();
  const { alert, DialogComponent } = useConfirmationDialog();
  const [loading, setLoading] = useState(false);
  const [payers, setPayers] = useState([]);
  const [loadingPayers, setLoadingPayers] = useState(false);
  const [payersError, setPayersError] = useState(null);
  const [formData, setFormData] = useState({
    payerType: '',
    payerId: '',
    amount: '',
    currency: 'INR',
    modeOfPayment: '',
    payeeName: '',
    payeePhone: '',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  const payerTypeOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'customer', label: 'Customer' },
    { value: 'transport', label: 'Transport Customer' }
  ];

  const modeOfPaymentOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'netbanking', label: 'Net Banking' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'other', label: 'Other' }
  ];

  const currencyOptions = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' }
  ];

  const fetchPayers = async (payerType) => {
    if (!payerType) {
      setPayers([]);
      return;
    }

    try {
      setLoadingPayers(true);
      setPayersError(null);
      let endpoint = '';
      
      switch (payerType) {
        case 'student':
          endpoint = '/api/students';
          break;
        case 'teacher':
          endpoint = '/api/teachers';
          break;
        case 'customer':
          endpoint = '/api/customers';
          break;
        case 'transport':
          endpoint = '/api/transport-customers';
          break;
        default:
          setPayers([]);
          return;
      }

      console.log(`Fetching payers from: ${endpoint}`);
      const response = await fetch(`${endpoint}?limit=1000`);
      const data = await response.json();

      console.log('Payers response:', { status: response.status, data });

      if (response.ok) {
        const payersData = data.data || [];
        setPayers(payersData);
        console.log(`Loaded ${payersData.length} ${payerType}s:`, payersData.map(p => {
          if (payerType === 'student' && p.firstName && p.lastName) {
            return `${p.firstName} ${p.lastName}`;
          } else if (payerType === 'student' && p.firstName) {
            return p.firstName;
          }
          return p.name || 'Unnamed';
        }));
      } else {
        console.error('Failed to fetch payers:', data.error);
        setPayers([]);
        setPayersError(data.error || 'Failed to fetch payers');
      }
    } catch (error) {
      console.error('Error fetching payers:', error);
      setPayers([]);
      setPayersError('Network error while fetching payers');
    } finally {
      setLoadingPayers(false);
    }
  };

  useEffect(() => {
    if (formData.payerType) {
      fetchPayers(formData.payerType);
    } else {
      setPayers([]);
    }
  }, [formData.payerType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset payer selection when payer type changes
    if (name === 'payerType') {
      setFormData(prev => ({
        ...prev,
        payerType: value,
        payerId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Success', 'Fee record created successfully!', 'success');
        setTimeout(() => {
          router.push('/fees');
        }, 1500);
      } else {
        alert('Error', data.error || 'Failed to create fee record', 'error');
      }
    } catch (error) {
      console.error('Error creating fee record:', error);
      alert('Error', 'Network error while creating fee record', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/fees" className="text-gray-400 hover:text-gray-500">
                  Fees
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">Create New</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Create Fee Record</h1>
          <p className="mt-2 text-gray-600">
            Record a new fee payment from students, teachers, customers, or transport
          </p>
        </div>

        {/* Debug Info (temporary) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>Payer Type: {formData.payerType || 'None'}</p>
              <p>Payer ID: {formData.payerId || 'None'}</p>
              <p>Payers Count: {payers.length}</p>
              <p>Loading Payers: {loadingPayers ? 'Yes' : 'No'}</p>
              <p>Available Payers: {payers.length > 0 ? payers.map(p => {
                if (formData.payerType === 'student' && p.firstName && p.lastName) {
                  return `${p.firstName} ${p.lastName}`;
                } else if (formData.payerType === 'student' && p.firstName) {
                  return p.firstName;
                }
                return p.name || 'Unnamed';
              }).join(', ') : 'None'}</p>
              {payersError && <p className="text-red-600 font-medium">Error: {payersError}</p>}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Payer Type */}
              <div>
                <FormSelect
                  label="Payer Type"
                  name="payerType"
                  value={formData.payerType}
                  onChange={handleInputChange}
                  required
                  options={payerTypeOptions}
                />
              </div>

              {/* Payer Selection */}
              <div>
                <label htmlFor="payerId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Payer *
                </label>
                <select
                  id="payerId"
                  name="payerId"
                  value={formData.payerId}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.payerType || loadingPayers}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900"
                >
                  <option value="">
                    {loadingPayers ? 'Loading...' : formData.payerType ? 'Select a payer' : 'First select payer type'}
                  </option>
                  {payers.map((payer) => {
                    // For students, construct name from firstName and lastName
                    let displayName = payer.name;
                    if (formData.payerType === 'student' && payer.firstName && payer.lastName) {
                      displayName = `${payer.firstName} ${payer.lastName}`;
                    } else if (formData.payerType === 'student' && payer.firstName) {
                      displayName = payer.firstName;
                    }
                    
                    const phone = payer.phone || payer.parentPhone;
                    
                    return (
                      <option key={payer._id} value={payer._id}>
                        {displayName || 'Unnamed'} {phone ? `(${phone})` : ''}
                      </option>
                    );
                  })}
                </select>
                {formData.payerType && payers.length === 0 && !loadingPayers && !payersError && (
                  <p className="mt-1 text-sm text-red-600">No {formData.payerType}s found</p>
                )}
                {payersError && (
                  <p className="mt-1 text-sm text-red-600">Error loading {formData.payerType}s: {payersError}</p>
                )}
                {formData.payerId && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-800 mb-1">Selected Payer ID:</p>
                    <p className="font-mono text-sm bg-white px-3 py-2 rounded border text-gray-900">{formData.payerId}</p>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <FormInput
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Currency */}
              <div>
                <FormSelect
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  options={currencyOptions}
                />
              </div>

              {/* Mode of Payment */}
              <div>
                <FormSelect
                  label="Mode of Payment"
                  name="modeOfPayment"
                  value={formData.modeOfPayment}
                  onChange={handleInputChange}
                  required
                  options={modeOfPaymentOptions}
                />
              </div>

              {/* Date */}
              <div>
                <FormInput
                  label="Payment Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Payee Name */}
              <div>
                <FormInput
                  label="Payee Name"
                  name="payeeName"
                  type="text"
                  value={formData.payeeName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter payee name"
                />
              </div>

              {/* Payee Phone */}
              <div>
                <FormInput
                  label="Payee Phone"
                  name="payeePhone"
                  type="tel"
                  value={formData.payeePhone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter payee phone number"
                />
              </div>
            </div>

            {/* Reference */}
            <div>
              <FormTextarea
                label="Reference/Notes"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="Enter any reference number or additional notes (optional)"
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/fees"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Fee Record'
                )}
              </button>
            </div>
          </form>
        </div>

        <DialogComponent />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

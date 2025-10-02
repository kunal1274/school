'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';

export default function EditFeePage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    transactionId: '',
    feeType: '',
    amount: '',
    payeeName: '',
    payeePhone: '',
    payerType: '',
    payerId: '',
    dueDate: '',
    paymentDate: '',
    paymentMethod: '',
    referenceNumber: '',
    status: 'pending',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchFee();
    }
  }, [params.id]);

  const fetchFee = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fees/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const fee = data.data;
        
        // Format dates for input fields
        const dueDate = fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '';
        const paymentDate = fee.paymentDate ? new Date(fee.paymentDate).toISOString().split('T')[0] : '';
        
        setFormData({
          transactionId: fee.transactionId || '',
          feeType: fee.feeType || '',
          amount: fee.amount || '',
          payeeName: fee.payeeName || '',
          payeePhone: fee.payeePhone || '',
          payerType: fee.payerType || '',
          payerId: fee.payerId || '',
          dueDate: dueDate,
          paymentDate: paymentDate,
          paymentMethod: fee.paymentMethod || '',
          referenceNumber: fee.referenceNumber || '',
          status: fee.status || 'pending',
          notes: fee.notes || ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch fee record');
      }
    } catch (error) {
      console.error('Error fetching fee record:', error);
      setError('Failed to fetch fee record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`/api/fees/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/fees/${params.id}`);
      } else {
        if (data.details) {
          setErrors(data.details);
        } else {
          setError(data.error || 'Failed to update fee record');
        }
      }
    } catch (error) {
      console.error('Error updating fee record:', error);
      setError('Failed to update fee record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feeTypeOptions = [
    { value: 'tuition', label: 'Tuition' },
    { value: 'transport', label: 'Transport' },
    { value: 'exam', label: 'Exam' },
    { value: 'other', label: 'Other' }
  ];

  const payerTypeOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'customer', label: 'Customer' },
    { value: 'transport', label: 'Transport Customer' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'online', label: 'Online Payment' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/fees')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Fees
            </button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Fee Record</h1>
            <p className="text-gray-600">Update fee record information</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-soft p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                id="transactionId"
                name="transactionId"
                label="Transaction ID"
                type="text"
                value={formData.transactionId}
                onChange={handleChange}
                error={errors.transactionId}
                required
              />
              <FormSelect
                id="feeType"
                name="feeType"
                label="Fee Type"
                value={formData.feeType}
                onChange={handleChange}
                error={errors.feeType}
                options={feeTypeOptions}
                required
              />
              <FormInput
                id="amount"
                name="amount"
                label="Amount (₹)"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                error={errors.amount}
                required
              />
              <FormSelect
                id="status"
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                error={errors.status}
                options={statusOptions}
                required
              />
              <FormInput
                id="payeeName"
                name="payeeName"
                label="Payee Name"
                type="text"
                value={formData.payeeName}
                onChange={handleChange}
                error={errors.payeeName}
                required
              />
              <FormInput
                id="payeePhone"
                name="payeePhone"
                label="Payee Phone"
                type="tel"
                value={formData.payeePhone}
                onChange={handleChange}
                error={errors.payeePhone}
                required
              />
              <FormSelect
                id="payerType"
                name="payerType"
                label="Payer Type"
                value={formData.payerType}
                onChange={handleChange}
                error={errors.payerType}
                options={payerTypeOptions}
                required
              />
              <FormInput
                id="payerId"
                name="payerId"
                label="Payer ID"
                type="text"
                value={formData.payerId}
                onChange={handleChange}
                error={errors.payerId}
                required
              />
              <FormInput
                id="dueDate"
                name="dueDate"
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                error={errors.dueDate}
                required
              />
              <FormInput
                id="paymentDate"
                name="paymentDate"
                label="Payment Date"
                type="date"
                value={formData.paymentDate}
                onChange={handleChange}
                error={errors.paymentDate}
              />
              <FormSelect
                id="paymentMethod"
                name="paymentMethod"
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={handleChange}
                error={errors.paymentMethod}
                options={paymentMethodOptions}
              />
              <FormInput
                id="referenceNumber"
                name="referenceNumber"
                label="Reference Number"
                type="text"
                value={formData.referenceNumber}
                onChange={handleChange}
                error={errors.referenceNumber}
              />
            </div>

            <FormTextarea
              id="notes"
              name="notes"
              label="Notes"
              value={formData.notes}
              onChange={handleChange}
              error={errors.notes}
              rows={3}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(`/fees/${params.id}`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Fee Record'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
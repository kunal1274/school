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

export default function CreateTransportCustomerPage() {
  const router = useRouter();
  const { alert, DialogComponent } = useConfirmationDialog();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleNo: '',
    pickupPoint: '',
    dropPoint: '',
    assignedToStudentId: '',
    fee: '',
    notes: '',
    status: 'active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/transport-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        setShowSuccessModal(true);
        setTimeout(() => {
          router.push('/transport-customers');
        }, 1500);
      } else {
        setLoading(false);
        alert('Error', data.error || 'Failed to create transport customer', 'error');
      }
    } catch (error) {
      console.error('Error creating transport customer:', error);
      setLoading(false);
      alert('Error', 'Network error while creating transport customer', 'error');
    }
  };

  // Prefetch target list page to make transition instant
  useEffect(() => {
    router.prefetch('/transport-customers');
  }, [router]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-3"></div>
              <p className="text-base font-medium text-gray-800">Creating transport customer...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we process your request</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/transport-customers" className="text-gray-400 hover:text-gray-500">
                  Transport Customers
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
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Create Transport Customer</h1>
          <p className="mt-2 text-gray-600">
            Add a new transport customer to the system
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-700">Creating transport customer...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while we process your request</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2">
                <FormInput
                  label="Customer Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter customer name"
                />
              </div>

              {/* Phone */}
              <div>
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>

              {/* Vehicle Number */}
              <div>
                <FormInput
                  label="Vehicle Number"
                  name="vehicleNo"
                  type="text"
                  value={formData.vehicleNo}
                  onChange={handleInputChange}
                  placeholder="Enter vehicle number (optional)"
                />
              </div>

              {/* Pickup Point */}
              <div>
                <FormInput
                  label="Pickup Point"
                  name="pickupPoint"
                  type="text"
                  value={formData.pickupPoint}
                  onChange={handleInputChange}
                  placeholder="Enter pickup location (optional)"
                />
              </div>

              {/* Drop Point */}
              <div>
                <FormInput
                  label="Drop Point"
                  name="dropPoint"
                  type="text"
                  value={formData.dropPoint}
                  onChange={handleInputChange}
                  placeholder="Enter drop location (optional)"
                />
              </div>

              {/* Fee */}
              <div>
                <FormInput
                  label="Transport Fee"
                  name="fee"
                  type="number"
                  value={formData.fee}
                  onChange={handleInputChange}
                  placeholder="Enter monthly fee (optional)"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Status */}
              <div>
                <FormSelect
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <FormTextarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes (optional)"
                rows={4}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/transport-customers"
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
                  'Create Transport Customer'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal Overlay */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-fadeIn">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 animate-bounce">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">🎉 Success!</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Transport customer <span className="font-semibold text-green-700">&quot;{formData.name}&quot;</span> has been created successfully!
                </p>
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                  <span className="font-medium">Redirecting to transport customers list...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogComponent />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

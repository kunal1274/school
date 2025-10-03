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

export default function CreateClaimPage() {
  const router = useRouter();
  const { showDialog } = useConfirmationDialog();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [customerPolicies, setCustomerPolicies] = useState([]);

  const [formData, setFormData] = useState({
    customerPolicyId: '',
    claimNumber: '',
    dateOfEvent: '',
    amountClaimed: '',
    amountApproved: '',
    status: 'draft',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCustomerPolicies();
  }, []);

  const fetchCustomerPolicies = async () => {
    try {
      const response = await fetch('/api/customer-policies?limit=100');
      const data = await response.json();
      if (data.success) {
        setCustomerPolicies(data.data);
      }
    } catch (error) {
      console.error('Error fetching customer policies:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerPolicyId) {
      newErrors.customerPolicyId = 'Customer Policy is required';
    }

    if (!formData.claimNumber.trim()) {
      newErrors.claimNumber = 'Claim number is required';
    }

    if (formData.amountClaimed && formData.amountClaimed <= 0) {
      newErrors.amountClaimed = 'Claimed amount must be greater than 0';
    }

    if (formData.amountApproved && formData.amountApproved <= 0) {
      newErrors.amountApproved = 'Approved amount must be greater than 0';
    }

    if (formData.amountClaimed && formData.amountApproved && 
        parseFloat(formData.amountApproved) > parseFloat(formData.amountClaimed)) {
      newErrors.amountApproved = 'Approved amount cannot be greater than claimed amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccessModal(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/claims');
        }, 2000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          await showDialog('Error', data.error || 'Failed to create claim');
        }
      }
    } catch (error) {
      console.error('Error creating claim:', error);
      await showDialog('Error', 'Failed to create claim');
    } finally {
      setLoading(false);
    }
  };

  const claimStatusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'settled', label: 'Settled' }
  ];

  const customerPolicyOptions = customerPolicies.map(policy => ({
    value: policy._id,
    label: `${policy.policyNumber} - ${policy.customer?.name || 'Unknown Customer'}`
  }));

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Claim</h1>
              <p className="text-gray-600">Create a new insurance claim</p>
            </div>
            <Link
              href="/claims"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Claims
            </Link>
          </div>

          {/* Breadcrumb */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/dashboard" className="text-gray-700 hover:text-orange-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <Link href="/claims" className="text-gray-700 hover:text-orange-600">
                    Claims
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">Create</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  
                  <FormSelect
                    label="Customer Policy *"
                    name="customerPolicyId"
                    value={formData.customerPolicyId}
                    onChange={handleInputChange}
                    options={customerPolicyOptions}
                    error={errors.customerPolicyId}
                    placeholder="Select customer policy"
                    required
                  />

                  <FormInput
                    label="Claim Number *"
                    name="claimNumber"
                    value={formData.claimNumber}
                    onChange={handleInputChange}
                    error={errors.claimNumber}
                    placeholder="Enter claim number"
                    required
                  />

                  <FormInput
                    label="Date of Event"
                    name="dateOfEvent"
                    type="date"
                    value={formData.dateOfEvent}
                    onChange={handleInputChange}
                    error={errors.dateOfEvent}
                  />

                  <FormSelect
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    options={claimStatusOptions}
                    error={errors.status}
                  />
                </div>

                {/* Amount Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Amount Information</h3>
                  
                  <FormInput
                    label="Amount Claimed"
                    name="amountClaimed"
                    type="number"
                    value={formData.amountClaimed}
                    onChange={handleInputChange}
                    error={errors.amountClaimed}
                    placeholder="Enter claimed amount"
                    min="0"
                    step="0.01"
                  />

                  <FormInput
                    label="Amount Approved"
                    name="amountApproved"
                    type="number"
                    value={formData.amountApproved}
                    onChange={handleInputChange}
                    error={errors.amountApproved}
                    placeholder="Enter approved amount"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <FormTextarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  error={errors.notes}
                  placeholder="Enter any additional notes or information about the claim"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/claims"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Claim'}
                </button>
              </div>
            </form>
          </div>

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Claim Created Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  The claim has been added to the system.
                </p>
                <div className="text-sm text-gray-500">
                  Redirecting to claims list...
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

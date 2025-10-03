'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { useConfirmationDialog } from '@/components/CustomDialog';

export default function EditClaimPage() {
  const params = useParams();
  const router = useRouter();
  const { showDialog } = useConfirmationDialog();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerPolicies, setCustomerPolicies] = useState([]);

  useEffect(() => {
    if (params.id) {
      fetchClaim();
      fetchCustomerPolicies();
    }
  }, [params.id]);

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

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/claims/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const claim = data.data;
        setFormData({
          customerPolicyId: claim.customerPolicyId || '',
          claimNumber: claim.claimNumber || '',
          dateOfEvent: claim.dateOfEvent ? new Date(claim.dateOfEvent).toISOString().split('T')[0] : '',
          amountClaimed: claim.amountClaimed || '',
          amountApproved: claim.amountApproved || '',
          status: claim.status || 'draft',
          notes: claim.notes || ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch claim');
      }
    } catch (error) {
      console.error('Error fetching claim:', error);
      setError('Failed to fetch claim');
    } finally {
      setLoading(false);
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

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/claims/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await showDialog('Success', 'Claim updated successfully');
        router.push(`/claims/${params.id}`);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          await showDialog('Error', data.error || 'Failed to update claim');
        }
      }
    } catch (error) {
      console.error('Error updating claim:', error);
      await showDialog('Error', 'Failed to update claim');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              onClick={() => router.push('/claims')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Claims
            </button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Edit Claim</h1>
              <p className="text-gray-600">Update claim information</p>
            </div>
            <button
              onClick={() => router.push(`/claims/${params.id}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Claim
            </button>
          </div>

          {/* Breadcrumb */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-700 hover:text-orange-600"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <button
                    onClick={() => router.push('/claims')}
                    className="text-gray-700 hover:text-orange-600"
                  >
                    Claims
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <button
                    onClick={() => router.push(`/claims/${params.id}`)}
                    className="text-gray-700 hover:text-orange-600"
                  >
                    #{formData.claimNumber}
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">Edit</span>
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
                <button
                  type="button"
                  onClick={() => router.push(`/claims/${params.id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

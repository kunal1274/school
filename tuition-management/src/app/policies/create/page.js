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

export default function CreatePolicyPage() {
  const router = useRouter();
  const { showDialog } = useConfirmationDialog();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [insurers, setInsurers] = useState([]);

  const [formData, setFormData] = useState({
    insurerId: '',
    name: '',
    code: '',
    description: '',
    coverageDetails: '',
    termMonths: 12,
    premiumAmount: '',
    premiumFrequency: 'yearly',
    minCoverAmount: '',
    maxCoverAmount: '',
    active: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInsurers();
  }, []);

  const fetchInsurers = async () => {
    try {
      const response = await fetch('/api/insurers?limit=100');
      const data = await response.json();
      if (data.success) {
        setInsurers(data.data);
      }
    } catch (error) {
      console.error('Error fetching insurers:', error);
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

    if (!formData.insurerId) {
      newErrors.insurerId = 'Insurer is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Policy name is required';
    }

    if (!formData.premiumAmount || formData.premiumAmount <= 0) {
      newErrors.premiumAmount = 'Premium amount must be greater than 0';
    }

    if (formData.minCoverAmount && formData.maxCoverAmount && 
        parseFloat(formData.maxCoverAmount) < parseFloat(formData.minCoverAmount)) {
      newErrors.maxCoverAmount = 'Maximum cover amount must be greater than or equal to minimum cover amount';
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
      const response = await fetch('/api/policies', {
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
          router.push('/policies');
        }, 2000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          await showDialog('Error', data.error || 'Failed to create policy');
        }
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      await showDialog('Error', 'Failed to create policy');
    } finally {
      setLoading(false);
    }
  };

  const premiumFrequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const insurerOptions = insurers.map(insurer => ({
    value: insurer._id,
    label: insurer.name
  }));

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Policy</h1>
              <p className="text-gray-600">Create a new insurance policy</p>
            </div>
            <Link
              href="/policies"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Policies
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
                  <Link href="/policies" className="text-gray-700 hover:text-orange-600">
                    Policies
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
                    label="Insurer *"
                    name="insurerId"
                    value={formData.insurerId}
                    onChange={handleInputChange}
                    options={insurerOptions}
                    error={errors.insurerId}
                    placeholder="Select insurer"
                    required
                  />

                  <FormInput
                    label="Policy Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    placeholder="Enter policy name"
                    required
                  />

                  <FormInput
                    label="Policy Code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    error={errors.code}
                    placeholder="Enter unique code"
                  />

                  <FormInput
                    label="Term (Months)"
                    name="termMonths"
                    type="number"
                    value={formData.termMonths}
                    onChange={handleInputChange}
                    error={errors.termMonths}
                    placeholder="Enter term in months"
                    min="1"
                    max="1200"
                  />
                </div>

                {/* Premium Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Premium Information</h3>
                  
                  <FormInput
                    label="Premium Amount *"
                    name="premiumAmount"
                    type="number"
                    value={formData.premiumAmount}
                    onChange={handleInputChange}
                    error={errors.premiumAmount}
                    placeholder="Enter premium amount"
                    required
                    min="0"
                    step="0.01"
                  />

                  <FormSelect
                    label="Premium Frequency"
                    name="premiumFrequency"
                    value={formData.premiumFrequency}
                    onChange={handleInputChange}
                    options={premiumFrequencyOptions}
                    error={errors.premiumFrequency}
                  />

                  <FormInput
                    label="Minimum Cover Amount"
                    name="minCoverAmount"
                    type="number"
                    value={formData.minCoverAmount}
                    onChange={handleInputChange}
                    error={errors.minCoverAmount}
                    placeholder="Enter minimum cover amount"
                    min="0"
                    step="0.01"
                  />

                  <FormInput
                    label="Maximum Cover Amount"
                    name="maxCoverAmount"
                    type="number"
                    value={formData.maxCoverAmount}
                    onChange={handleInputChange}
                    error={errors.maxCoverAmount}
                    placeholder="Enter maximum cover amount"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                <FormTextarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={errors.description}
                  placeholder="Enter policy description"
                  rows={3}
                />
              </div>

              {/* Coverage Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage Details</h3>
                <FormTextarea
                  label="Coverage Details"
                  name="coverageDetails"
                  value={formData.coverageDetails}
                  onChange={handleInputChange}
                  error={errors.coverageDetails}
                  placeholder="Enter detailed coverage information"
                  rows={4}
                />
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/policies"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Policy'}
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
                  Policy Created Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  The policy has been added to the system.
                </p>
                <div className="text-sm text-gray-500">
                  Redirecting to policies list...
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

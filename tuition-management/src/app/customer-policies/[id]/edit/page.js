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

export default function EditCustomerPolicyPage({ params }) {
  const router = useRouter();
  const { showDialog } = useConfirmationDialog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [insurers, setInsurers] = useState([]);

  const [formData, setFormData] = useState({
    policyId: '',
    insurerId: '',
    customerId: '',
    insuredPersonId: '',
    insuredPersonModel: 'Customer',
    policyNumber: '',
    startDate: '',
    endDate: '',
    status: 'active',
    sumInsured: '',
    premium: '',
    premiumFrequency: 'yearly',
    nextPremiumDueDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch data for dropdowns and current customer policy
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policiesRes, customersRes, insurersRes, customerPolicyRes] = await Promise.all([
          fetch('/api/policies'),
          fetch('/api/customers'),
          fetch('/api/insurers'),
          fetch(`/api/customer-policies/${params.id}`)
        ]);

        const [policiesData, customersData, insurersData, customerPolicyData] = await Promise.all([
          policiesRes.json(),
          customersRes.json(),
          insurersRes.json(),
          customerPolicyRes.json()
        ]);

        if (policiesData.success) setPolicies(policiesData.data);
        if (customersData.success) setCustomers(customersData.data);
        if (insurersData.success) setInsurers(insurersData.data);

        if (customerPolicyData.success) {
          const cp = customerPolicyData.data;
          setFormData({
            policyId: cp.policyId || '',
            insurerId: cp.insurerId || '',
            customerId: cp.customerId || '',
            insuredPersonId: cp.insuredPersonId || '',
            insuredPersonModel: cp.insuredPersonModel || 'Customer',
            policyNumber: cp.policyNumber || '',
            startDate: cp.startDate ? new Date(cp.startDate).toISOString().split('T')[0] : '',
            endDate: cp.endDate ? new Date(cp.endDate).toISOString().split('T')[0] : '',
            status: cp.status || 'active',
            sumInsured: cp.sumInsured || '',
            premium: cp.premium || '',
            premiumFrequency: cp.premiumFrequency || 'yearly',
            nextPremiumDueDate: cp.nextPremiumDueDate ? new Date(cp.nextPremiumDueDate).toISOString().split('T')[0] : '',
            notes: cp.notes || ''
          });
        } else {
          await showDialog('Error', customerPolicyData.error || 'Failed to fetch customer policy details');
          router.push('/customer-policies');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        await showDialog('Error', 'Failed to fetch customer policy details');
        router.push('/customer-policies');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, router, showDialog]);

  const handleInputChange = (e) => {
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

    // Auto-populate insurer when policy is selected
    if (name === 'policyId') {
      const selectedPolicy = policies.find(p => p._id === value);
      if (selectedPolicy) {
        setFormData(prev => ({
          ...prev,
          insurerId: selectedPolicy.insurerId,
          premium: selectedPolicy.premiumAmount,
          premiumFrequency: selectedPolicy.premiumFrequency
        }));
      }
    }

    // Auto-populate insured person when customer is selected
    if (name === 'customerId') {
      setFormData(prev => ({
        ...prev,
        insuredPersonId: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.policyId) {
      newErrors.policyId = 'Policy is required';
    }

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (!formData.policyNumber.trim()) {
      newErrors.policyNumber = 'Policy number is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.sumInsured && formData.sumInsured < 0) {
      newErrors.sumInsured = 'Sum insured must be positive';
    }

    if (formData.premium && formData.premium < 0) {
      newErrors.premium = 'Premium must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/customer-policies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          nextPremiumDueDate: formData.nextPremiumDueDate ? new Date(formData.nextPremiumDueDate) : null,
          sumInsured: formData.sumInsured ? parseFloat(formData.sumInsured) : null,
          premium: formData.premium ? parseFloat(formData.premium) : null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccessModal(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/customer-policies/${params.id}`);
        }, 2000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          await showDialog('Error', data.error || 'Failed to update customer policy');
        }
      }
    } catch (error) {
      console.error('Error updating customer policy:', error);
      await showDialog('Error', 'Failed to update customer policy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading customer policy details...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Customer Policy</h1>
              <p className="text-gray-600">Update customer policy information</p>
            </div>
            <Link
              href={`/customer-policies/${params.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Customer Policy
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
                  <Link href="/customer-policies" className="text-gray-700 hover:text-orange-600">
                    Customer Policies
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <Link href={`/customer-policies/${params.id}`} className="text-gray-700 hover:text-orange-600">
                    {formData.policyNumber}
                  </Link>
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
                {/* Policy Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Policy Selection</h3>
                  
                  <FormSelect
                    label="Policy *"
                    name="policyId"
                    value={formData.policyId}
                    onChange={handleInputChange}
                    error={errors.policyId}
                    required
                  >
                    <option value="">Select a policy</option>
                    {policies.map((policy) => (
                      <option key={policy._id} value={policy._id}>
                        {policy.name} - {policy.insurer?.name} (₹{policy.premiumAmount?.toLocaleString()})
                      </option>
                    ))}
                  </FormSelect>

                  <FormSelect
                    label="Customer *"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    error={errors.customerId}
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </FormSelect>

                  <FormInput
                    label="Policy Number *"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                    error={errors.policyNumber}
                    placeholder="Enter unique policy number"
                    required
                  />
                </div>

                {/* Policy Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Policy Details</h3>
                  
                  <FormInput
                    label="Start Date *"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    error={errors.startDate}
                    required
                  />

                  <FormInput
                    label="End Date *"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    error={errors.endDate}
                    required
                  />

                  <FormSelect
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    error={errors.status}
                  >
                    <option value="active">Active</option>
                    <option value="lapsed">Lapsed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </FormSelect>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Sum Insured"
                    name="sumInsured"
                    type="number"
                    value={formData.sumInsured}
                    onChange={handleInputChange}
                    error={errors.sumInsured}
                    placeholder="Enter sum insured amount"
                  />

                  <FormInput
                    label="Premium Amount"
                    name="premium"
                    type="number"
                    value={formData.premium}
                    onChange={handleInputChange}
                    error={errors.premium}
                    placeholder="Enter premium amount"
                  />

                  <FormSelect
                    label="Premium Frequency"
                    name="premiumFrequency"
                    value={formData.premiumFrequency}
                    onChange={handleInputChange}
                    error={errors.premiumFrequency}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </FormSelect>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Next Premium Due Date"
                    name="nextPremiumDueDate"
                    type="date"
                    value={formData.nextPremiumDueDate}
                    onChange={handleInputChange}
                    error={errors.nextPremiumDueDate}
                  />

                  <FormSelect
                    label="Insured Person Type"
                    name="insuredPersonModel"
                    value={formData.insuredPersonModel}
                    onChange={handleInputChange}
                    error={errors.insuredPersonModel}
                  >
                    <option value="Customer">Customer</option>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                  </FormSelect>
                </div>

                <div className="mt-4">
                  <FormTextarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    error={errors.notes}
                    placeholder="Enter any additional notes or information"
                    rows={4}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href={`/customer-policies/${params.id}`}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
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
                  Customer Policy Updated Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  The customer policy information has been updated.
                </p>
                <div className="text-sm text-gray-500">
                  Redirecting to customer policy details...
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

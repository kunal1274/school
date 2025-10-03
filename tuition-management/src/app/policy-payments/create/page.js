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

export default function CreatePolicyPaymentPage() {
  const router = useRouter();
  const { showDialog } = useConfirmationDialog();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [customerPolicies, setCustomerPolicies] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    customerPolicyId: '',
    payerId: '',
    amount: '',
    currency: 'INR',
    paymentDate: new Date().toISOString().split('T')[0],
    modeOfPayment: 'cash',
    reference: '',
    receiptUrl: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerPoliciesRes, usersRes] = await Promise.all([
          fetch('/api/customer-policies'),
          fetch('/api/users')
        ]);

        const [customerPoliciesData, usersData] = await Promise.all([
          customerPoliciesRes.json(),
          usersRes.json()
        ]);

        if (customerPoliciesData.success) setCustomerPolicies(customerPoliciesData.data);
        if (usersData.success) setUsers(usersData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerPolicyId) {
      newErrors.customerPolicyId = 'Customer policy is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (!formData.modeOfPayment) {
      newErrors.modeOfPayment = 'Payment mode is required';
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
      const response = await fetch('/api/policy-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          paymentDate: new Date(formData.paymentDate)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccessModal(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/policy-payments');
        }, 2000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          await showDialog('Error', data.error || 'Failed to create policy payment');
        }
      }
    } catch (error) {
      console.error('Error creating policy payment:', error);
      await showDialog('Error', 'Failed to create policy payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Policy Payment</h1>
              <p className="text-gray-600">Record a premium payment for a customer policy</p>
            </div>
            <Link
              href="/policy-payments"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Policy Payments
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
                  <Link href="/policy-payments" className="text-gray-700 hover:text-orange-600">
                    Policy Payments
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
                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                  
                  <FormSelect
                    label="Customer Policy *"
                    name="customerPolicyId"
                    value={formData.customerPolicyId}
                    onChange={handleInputChange}
                    error={errors.customerPolicyId}
                    required
                  >
                    <option value="">Select a customer policy</option>
                    {customerPolicies.map((policy) => (
                      <option key={policy._id} value={policy._id}>
                        {policy.policyNumber} - {policy.customer?.name} ({policy.policy?.name})
                      </option>
                    ))}
                  </FormSelect>

                  <FormInput
                    label="Amount *"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    error={errors.amount}
                    placeholder="Enter payment amount"
                    required
                  />

                  <FormSelect
                    label="Currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    error={errors.currency}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </FormSelect>

                  <FormInput
                    label="Payment Date *"
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    error={errors.paymentDate}
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                  
                  <FormSelect
                    label="Payment Mode *"
                    name="modeOfPayment"
                    value={formData.modeOfPayment}
                    onChange={handleInputChange}
                    error={errors.modeOfPayment}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </FormSelect>

                  <FormInput
                    label="Reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    error={errors.reference}
                    placeholder="Enter payment reference (e.g., UPI ID, transaction ID)"
                  />

                  <FormInput
                    label="Receipt URL"
                    name="receiptUrl"
                    value={formData.receiptUrl}
                    onChange={handleInputChange}
                    error={errors.receiptUrl}
                    placeholder="Enter receipt URL (optional)"
                  />

                  <FormSelect
                    label="Payer"
                    name="payerId"
                    value={formData.payerId}
                    onChange={handleInputChange}
                    error={errors.payerId}
                  >
                    <option value="">Select payer (optional)</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.role})
                      </option>
                    ))}
                  </FormSelect>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/policy-payments"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Payment'}
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
                  Policy Payment Created Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  The premium payment has been recorded successfully.
                </p>
                <div className="text-sm text-gray-500">
                  Redirecting to policy payments list...
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

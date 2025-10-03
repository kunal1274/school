'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ViewCustomerPolicyPage({ params }) {
  const router = useRouter();
  const [customerPolicy, setCustomerPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerPolicy = async () => {
      try {
        const response = await fetch(`/api/customer-policies/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setCustomerPolicy(data.data);
        } else {
          setError(data.error || 'Failed to fetch customer policy details');
        }
      } catch (err) {
        setError('Failed to fetch customer policy details');
        console.error('Error fetching customer policy:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCustomerPolicy();
    }
  }, [params.id]);

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

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Link
              href="/customer-policies"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Customer Policies
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!customerPolicy) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Policy Not Found</h3>
            <p className="text-gray-500 mb-4">The requested customer policy could not be found.</p>
            <Link
              href="/customer-policies"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Customer Policies
            </Link>
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
              <h1 className="text-2xl font-bold text-gray-900">{customerPolicy.policyNumber}</h1>
              <p className="text-gray-600">Customer Policy Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/customer-policies"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Customer Policies
              </Link>
              <Link
                href={`/customer-policies/${customerPolicy._id}/edit`}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Edit Policy
              </Link>
            </div>
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
                  <span className="text-gray-500">{customerPolicy.policyNumber}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Customer Policy Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Policy Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customerPolicy.policyNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customerPolicy.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : customerPolicy.status === 'lapsed'
                          ? 'bg-yellow-100 text-yellow-800'
                          : customerPolicy.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customerPolicy.status ? customerPolicy.status.charAt(0).toUpperCase() + customerPolicy.status.slice(1) : '-'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Policy Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customerPolicy.policy?.name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Insurer</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customerPolicy.insurer?.name || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customerPolicy.customer?.name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Insured Person Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customerPolicy.insuredPersonModel || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* Financial Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Sum Insured</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customerPolicy.sumInsured ? `₹${customerPolicy.sumInsured.toLocaleString()}` : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Premium Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customerPolicy.premium ? `₹${customerPolicy.premium.toLocaleString()}` : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Premium Frequency</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customerPolicy.premiumFrequency ? customerPolicy.premiumFrequency.charAt(0).toUpperCase() + customerPolicy.premiumFrequency.slice(1) : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Next Premium Due</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customerPolicy.nextPremiumDueDate 
                        ? new Date(customerPolicy.nextPremiumDueDate).toLocaleDateString()
                        : '-'
                      }
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Policy Period */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Period</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customerPolicy.startDate 
                        ? new Date(customerPolicy.startDate).toLocaleDateString()
                        : '-'
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customerPolicy.endDate 
                        ? new Date(customerPolicy.endDate).toLocaleDateString()
                        : '-'
                      }
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Notes */}
              {customerPolicy.notes && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{customerPolicy.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/customer-policies/${customerPolicy._id}/edit`}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-center block"
                  >
                    Edit Policy
                  </Link>
                  <Link
                    href={`/policy-payments?customerPolicyId=${customerPolicy._id}`}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center block"
                  >
                    View Payments
                  </Link>
                  <Link
                    href={`/claims?customerPolicyId=${customerPolicy._id}`}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-center block"
                  >
                    View Claims
                  </Link>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(customerPolicy.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </dd>
                  </div>
                  {customerPolicy.updatedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(customerPolicy.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                  )}
                  {customerPolicy.createdBy && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customerPolicy.createdBy.firstName} {customerPolicy.createdBy.lastName}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

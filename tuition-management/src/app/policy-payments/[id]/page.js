'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ViewPolicyPaymentPage({ params }) {
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/policy-payments/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setPayment(data.data);
        } else {
          setError(data.error || 'Failed to fetch payment details');
        }
      } catch (err) {
        setError('Failed to fetch payment details');
        console.error('Error fetching payment:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPayment();
    }
  }, [params.id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payment details...</p>
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
              href="/policy-payments"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Policy Payments
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!payment) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Not Found</h3>
            <p className="text-gray-500 mb-4">The requested payment could not be found.</p>
            <Link
              href="/policy-payments"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Policy Payments
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
              <h1 className="text-2xl font-bold text-gray-900">{payment.transactionId}</h1>
              <p className="text-gray-600">Policy Payment Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/policy-payments"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Policy Payments
              </Link>
              <Link
                href={`/policy-payments/${payment._id}/edit`}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Edit Payment
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
                  <Link href="/policy-payments" className="text-gray-700 hover:text-orange-600">
                    Policy Payments
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">{payment.transactionId}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Payment Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Transaction Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{payment.transactionId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {payment.paymentDate 
                        ? new Date(payment.paymentDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '-'
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {payment.currency} {payment.amount?.toLocaleString() || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Mode</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.modeOfPayment === 'cash' 
                          ? 'bg-green-100 text-green-800'
                          : payment.modeOfPayment === 'upi'
                          ? 'bg-blue-100 text-blue-800'
                          : payment.modeOfPayment === 'card'
                          ? 'bg-purple-100 text-purple-800'
                          : payment.modeOfPayment === 'bank_transfer'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.modeOfPayment ? payment.modeOfPayment.charAt(0).toUpperCase() + payment.modeOfPayment.slice(1).replace('_', ' ') : '-'}
                      </span>
                    </dd>
                  </div>
                  {payment.reference && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Reference</dt>
                      <dd className="mt-1 text-sm text-gray-900">{payment.reference}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Policy Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer</dt>
                    <dd className="mt-1 text-sm text-gray-900">{payment.customer?.name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{payment.customerPolicy?.policyNumber || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Policy Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{payment.policy?.name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Insurer</dt>
                    <dd className="mt-1 text-sm text-gray-900">{payment.insurer?.name || '-'}</dd>
                  </div>
                </dl>
              </div>

              {/* Payer Information */}
              {payment.payer && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payer Information</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payer Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {payment.payer.firstName} {payment.payer.lastName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payer Role</dt>
                      <dd className="mt-1 text-sm text-gray-900">{payment.payer.role || '-'}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Receipt Information */}
              {payment.receiptUrl && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt</h3>
                  <div>
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-500 underline"
                    >
                      View Receipt
                    </a>
                  </div>
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
                    href={`/policy-payments/${payment._id}/edit`}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-center block"
                  >
                    Edit Payment
                  </Link>
                  {payment.customerPolicy && (
                    <Link
                      href={`/customer-policies/${payment.customerPolicy._id}`}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center block"
                    >
                      View Policy
                    </Link>
                  )}
                  {payment.customer && (
                    <Link
                      href={`/customers/${payment.customer._id}`}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-center block"
                    >
                      View Customer
                    </Link>
                  )}
                </div>
              </div>

              {/* System Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </dd>
                  </div>
                  {payment.updatedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(payment.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                  )}
                  {payment.createdBy && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {payment.createdBy.firstName} {payment.createdBy.lastName}
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

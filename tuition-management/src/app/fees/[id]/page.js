'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import WhatsAppButton from '@/components/WhatsAppButton';
import Link from 'next/link';

export default function FeeViewPage() {
  const params = useParams();
  const router = useRouter();
  const [fee, setFee] = useState(null);
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
        setFee(data.data);
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
            <Link
              href="/fees"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Fees
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!fee) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-gray-500">Fee record not found</p>
            <Link
              href="/fees"
              className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Fees
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {fee.transactionId}
              </h1>
              <p className="text-gray-600">Fee Record Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/fees/${fee._id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Fee Record
              </Link>
              <Link
                href="/fees"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Fees
              </Link>
            </div>
          </div>

          {/* Fee Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Transaction ID</label>
                    <p className="mt-1 text-sm text-gray-900">{fee.transactionId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fee Type</label>
                    <p className="mt-1 text-sm text-gray-900">{fee.feeType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Amount</label>
                    <p className="mt-1 text-sm text-green-600 font-medium">₹{fee.amount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fee.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : fee.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {fee.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Due Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payment Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : 'Not paid'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payee Information */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payee Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payee Name</label>
                    <p className="mt-1 text-sm text-gray-900">{fee.payeeName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-sm text-gray-900">{fee.payeePhone}</p>
                      <WhatsAppButton
                        phone={fee.payeePhone}
                        name={fee.payeeName}
                        message={`Hello ${fee.payeeName}, this is regarding your fee payment for transaction ${fee.transactionId}. Please contact us for more details.`}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payer Type</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{fee.payerType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payer ID</label>
                    <p className="mt-1 text-sm text-gray-900">{fee.payerId}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {fee.paymentMethod && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                      <p className="mt-1 text-sm text-gray-900">{fee.paymentMethod}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Reference Number</label>
                      <p className="mt-1 text-sm text-gray-900">{fee.referenceNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {fee.notes && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{fee.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Status */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
                <div className="flex items-center">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    fee.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : fee.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {fee.status === 'paid' ? 'Paid' : fee.status === 'pending' ? 'Pending' : 'Overdue'}
                  </span>
                </div>
                {fee.status === 'paid' && fee.paymentDate && (
                  <p className="mt-2 text-sm text-gray-600">
                    Paid on {new Date(fee.paymentDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {fee.status !== 'paid' && (
                    <button
                      onClick={() => {
                        // Mark as paid functionality
                        alert('Mark as paid functionality would be implemented here');
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <span className="mr-2">✅</span>
                      Mark as Paid
                    </button>
                  )}
                  <WhatsAppButton
                    phone={fee.payeePhone}
                    name={fee.payeeName}
                    message={`Hello ${fee.payeeName}, this is regarding your fee payment for transaction ${fee.transactionId}. Please contact us for more details.`}
                    className="w-full"
                    variant="outline"
                  />
                </div>
              </div>

              {/* System Information */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">
                      {new Date(fee.createdAt).toLocaleDateString()} at {new Date(fee.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {fee.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900">
                        {new Date(fee.updatedAt).toLocaleDateString()} at {new Date(fee.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
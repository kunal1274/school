'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useConfirmationDialog } from '@/components/CustomDialog';
import DuplicateRecord, { useDuplicateRecord } from '@/components/DuplicateRecord';

export default function PolicyPaymentsPage() {
  const router = useRouter();
  const { showConfirmation } = useConfirmationDialog();
  const { duplicateRecord } = useDuplicateRecord('PolicyPayment');

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    customerPolicyId: '',
    modeOfPayment: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch policy payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/policy-payments?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch policy payments');
      }
    } catch (err) {
      setError('Failed to fetch policy payments');
      console.error('Error fetching policy payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle delete
  const handleDelete = async (payment) => {
    const confirmed = await showConfirmation(
      'Delete Policy Payment',
      `Are you sure you want to delete payment "${payment.transactionId}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/policy-payments/${payment._id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          fetchPayments(); // Refresh the list
        } else {
          setError(data.error || 'Failed to delete policy payment');
        }
      } catch (err) {
        setError('Failed to delete policy payment');
        console.error('Error deleting policy payment:', err);
      }
    }
  };

  // Handle duplicate
  const handleDuplicate = async (payment) => {
    await duplicateRecord(payment);
    fetchPayments(); // Refresh the list
  };

  if (loading && payments.length === 0) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading policy payments...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Policy Payments</h1>
              <p className="text-gray-600">Manage insurance premium payments</p>
            </div>
            <Link
              href="/policy-payments/create"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Payment
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
                  <span className="text-gray-500">Policy Payments</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by transaction ID or reference..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={filters.modeOfPayment}
                  onChange={(e) => handleFilterChange('modeOfPayment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  <option value="">All Payment Modes</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items per page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Policy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.transactionId}
                        </div>
                        {payment.reference && (
                          <div className="text-sm text-gray-500">
                            {payment.reference}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.customer?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.customerPolicy?.policyNumber || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.policy?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payment.amount?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paymentDate 
                          ? new Date(payment.paymentDate).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/policy-payments/${payment._id}`}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/policy-payments/${payment._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <DuplicateRecord
                            record={payment}
                            recordType="PolicyPayment"
                            onDuplicate={handleDuplicate}
                          />
                          <button
                            onClick={() => handleDelete(payment)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {payments.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💳</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No policy payments found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.search || filters.modeOfPayment || filters.startDate || filters.endDate 
                    ? 'Try adjusting your search criteria.' 
                    : 'Get started by adding your first policy payment.'
                  }
                </p>
                {!filters.search && !filters.modeOfPayment && !filters.startDate && !filters.endDate && (
                  <Link
                    href="/policy-payments/create"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add Payment
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

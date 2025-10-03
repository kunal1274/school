'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useConfirmationDialog } from '@/components/CustomDialog';
import DuplicateRecord, { useDuplicateRecord } from '@/components/DuplicateRecord';

export default function CustomerPoliciesPage() {
  const router = useRouter();
  const { showConfirmation } = useConfirmationDialog();
  const { duplicateRecord } = useDuplicateRecord('CustomerPolicy');

  const [customerPolicies, setCustomerPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    customerId: '',
    insurerId: '',
    status: '',
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

  // Fetch customer policies
  const fetchCustomerPolicies = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/customer-policies?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCustomerPolicies(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch customer policies');
      }
    } catch (err) {
      setError('Failed to fetch customer policies');
      console.error('Error fetching customer policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerPolicies();
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
  const handleDelete = async (customerPolicy) => {
    const confirmed = await showConfirmation(
      'Delete Customer Policy',
      `Are you sure you want to delete policy "${customerPolicy.policyNumber}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/customer-policies/${customerPolicy._id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          fetchCustomerPolicies(); // Refresh the list
        } else {
          setError(data.error || 'Failed to delete customer policy');
        }
      } catch (err) {
        setError('Failed to delete customer policy');
        console.error('Error deleting customer policy:', err);
      }
    }
  };

  // Handle duplicate
  const handleDuplicate = async (customerPolicy) => {
    await duplicateRecord(customerPolicy);
    fetchCustomerPolicies(); // Refresh the list
  };

  if (loading && customerPolicies.length === 0) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading customer policies...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Customer Policies</h1>
              <p className="text-gray-600">Manage customer insurance policy assignments</p>
            </div>
            <Link
              href="/customer-policies/create"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Customer Policy
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
                  <span className="text-gray-500">Customer Policies</span>
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
                  placeholder="Search by policy number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <select
                  value={filters.customerId}
                  onChange={(e) => handleFilterChange('customerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  <option value="">All Customers</option>
                  {/* This would be populated from customers API */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurer
                </label>
                <select
                  value={filters.insurerId}
                  onChange={(e) => handleFilterChange('insurerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  <option value="">All Insurers</option>
                  {/* This would be populated from insurers API */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="lapsed">Lapsed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
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

          {/* Customer Policies Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Policy Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Policy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Insurer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Premium
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerPolicies.map((customerPolicy) => (
                    <tr key={customerPolicy._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customerPolicy.policyNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customerPolicy.customer?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customerPolicy.policy?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customerPolicy.insurer?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{customerPolicy.premium?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customerPolicy.nextPremiumDueDate 
                          ? new Date(customerPolicy.nextPremiumDueDate).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/customer-policies/${customerPolicy._id}`}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/customer-policies/${customerPolicy._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <DuplicateRecord
                            record={customerPolicy}
                            recordType="CustomerPolicy"
                            onDuplicate={handleDuplicate}
                          />
                          <button
                            onClick={() => handleDelete(customerPolicy)}
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
            {customerPolicies.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customer policies found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.search || filters.customerId || filters.insurerId || filters.status 
                    ? 'Try adjusting your search criteria.' 
                    : 'Get started by adding your first customer policy.'
                  }
                </p>
                {!filters.search && !filters.customerId && !filters.insurerId && !filters.status && (
                  <Link
                    href="/customer-policies/create"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add Customer Policy
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

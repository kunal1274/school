'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useConfirmationDialog } from '@/components/CustomDialog';
import DuplicateRecord, { useDuplicateRecord } from '@/components/DuplicateRecord';

export default function ClaimsPage() {
  const router = useRouter();
  const { showConfirmation } = useConfirmationDialog();
  const { duplicateRecord } = useDuplicateRecord('Claim');

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    customerPolicyId: '',
    status: '',
    claimantId: '',
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

  // Fetch claims
  const fetchClaims = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/claims?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setClaims(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch claims');
      }
    } catch (err) {
      setError('Failed to fetch claims');
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
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
  const handleDelete = async (claim) => {
    const confirmed = await showConfirmation(
      'Delete Claim',
      `Are you sure you want to delete claim "${claim.claimNumber}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/claims/${claim._id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          fetchClaims(); // Refresh the list
        } else {
          setError(data.error || 'Failed to delete claim');
        }
      } catch (err) {
        setError('Failed to delete claim');
        console.error('Error deleting claim:', err);
      }
    }
  };

  // Handle duplicate
  const handleDuplicate = async (claim) => {
    await duplicateRecord(claim);
    fetchClaims(); // Refresh the list
  };

  if (loading && claims.length === 0) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading claims...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
              <p className="text-gray-600">Manage insurance claims</p>
            </div>
            <Link
              href="/claims/create"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Claim
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
                  <span className="text-gray-500">Claims</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by claim number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 placeholder-gray-500"
                />
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
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="settled">Settled</option>
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

          {/* Claims Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claim Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Policy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Claimed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Approved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {claim.claimNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {claim.customer?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {claim.customerPolicy?.policyNumber || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {claim.policy?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {claim.amountClaimed ? `₹${claim.amountClaimed.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {claim.amountApproved ? `₹${claim.amountApproved.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          claim.status === 'draft' 
                            ? 'bg-gray-100 text-gray-800'
                            : claim.status === 'submitted'
                            ? 'bg-blue-100 text-blue-800'
                            : claim.status === 'under_review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : claim.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : claim.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : claim.status === 'settled'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {claim.status ? claim.status.charAt(0).toUpperCase() + claim.status.slice(1).replace('_', ' ') : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {claim.dateOfEvent 
                          ? new Date(claim.dateOfEvent).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/claims/${claim._id}`}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/claims/${claim._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <DuplicateRecord
                            record={claim}
                            recordType="Claim"
                            onDuplicate={handleDuplicate}
                          />
                          <button
                            onClick={() => handleDelete(claim)}
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
            {claims.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⚖️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.search || filters.status || filters.startDate || filters.endDate 
                    ? 'Try adjusting your search criteria.' 
                    : 'Get started by adding your first claim.'
                  }
                </p>
                {!filters.search && !filters.status && !filters.startDate && !filters.endDate && (
                  <Link
                    href="/claims/create"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add Claim
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

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function PolicyViewPage() {
  const params = useParams();
  const router = useRouter();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchPolicy();
    }
  }, [params.id]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/policies/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPolicy(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch policy');
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
      setError('Failed to fetch policy');
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
              href="/policies"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Policies
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!policy) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-gray-500">Policy not found</p>
            <Link
              href="/policies"
              className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Policies
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
                {policy.name}
              </h1>
              <p className="text-gray-600">Policy Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/policies/${policy._id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Policy
              </Link>
              <Link
                href="/policies"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Policies
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
                  <Link href="/policies" className="text-gray-700 hover:text-orange-600">
                    Policies
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">{policy.name}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Policy Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Policy Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{policy.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Policy Code</dt>
                    <dd className="mt-1 text-sm text-gray-900">{policy.code || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Insurer</dt>
                    <dd className="mt-1 text-sm text-gray-900">{policy.insurer?.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        policy.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {policy.active ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Premium Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Premium Information</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Premium Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">₹{policy.premiumAmount?.toLocaleString() || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Premium Frequency</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{policy.premiumFrequency || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Term (Months)</dt>
                    <dd className="mt-1 text-sm text-gray-900">{policy.termMonths || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Minimum Cover</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {policy.minCoverAmount ? `₹${policy.minCoverAmount.toLocaleString()}` : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Maximum Cover</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {policy.maxCoverAmount ? `₹${policy.maxCoverAmount.toLocaleString()}` : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Description */}
              {policy.description && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{policy.description}</p>
                </div>
              )}

              {/* Coverage Details */}
              {policy.coverageDetails && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage Details</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{policy.coverageDetails}</p>
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
                    href={`/policies/${policy._id}/edit`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Edit Policy
                  </Link>
                  <Link
                    href="/customer-policies/create"
                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    Assign to Customer
                  </Link>
                </div>
              </div>

              {/* Policy Statistics */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {policy.updatedAt ? new Date(policy.updatedAt).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

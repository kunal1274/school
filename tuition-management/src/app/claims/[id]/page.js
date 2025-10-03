'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function ClaimViewPage() {
  const params = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchClaim();
    }
  }, [params.id]);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/claims/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setClaim(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch claim');
      }
    } catch (error) {
      console.error('Error fetching claim:', error);
      setError('Failed to fetch claim');
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
              href="/claims"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Claims
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!claim) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-gray-500">Claim not found</p>
            <Link
              href="/claims"
              className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Claims
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'settled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'settled': return 'Settled';
      default: return status;
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Claim #{claim.claimNumber}
              </h1>
              <p className="text-gray-600">Claim Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/claims/${claim._id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Claim
              </Link>
              <Link
                href="/claims"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Claims
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
                  <Link href="/claims" className="text-gray-700 hover:text-orange-600">
                    Claims
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">#{claim.claimNumber}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Claim Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Claim Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">#{claim.claimNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                        {getStatusLabel(claim.status)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer Policy</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {claim.customerPolicy?.policyNumber || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {claim.customerPolicy?.customer?.name || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Event</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {claim.dateOfEvent ? new Date(claim.dateOfEvent).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Claimant</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {claim.claimant?.name || 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Amount Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Amount Information</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount Claimed</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {claim.amountClaimed ? `₹${claim.amountClaimed.toLocaleString()}` : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount Approved</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {claim.amountApproved ? `₹${claim.amountApproved.toLocaleString()}` : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Handled By</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {claim.handledBy?.name || 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Notes */}
              {claim.notes && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{claim.notes}</p>
                </div>
              )}

              {/* Supporting Documents */}
              {claim.supportingDocs && claim.supportingDocs.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Supporting Documents</h3>
                  <div className="space-y-2">
                    {claim.supportingDocs.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Document {index + 1}:</span>
                        <a
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Document
                        </a>
                      </div>
                    ))}
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
                    href={`/claims/${claim._id}/edit`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Edit Claim
                  </Link>
                  <Link
                    href={`/customer-policies/${claim.customerPolicyId}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    View Policy
                  </Link>
                </div>
              </div>

              {/* Claim Statistics */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {claim.updatedAt ? new Date(claim.updatedAt).toLocaleDateString() : 'N/A'}
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

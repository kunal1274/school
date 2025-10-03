'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ViewInsurerPage({ params }) {
  const router = useRouter();
  const [insurer, setInsurer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsurer = async () => {
      try {
        const response = await fetch(`/api/insurers/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setInsurer(data.data);
        } else {
          setError(data.error || 'Failed to fetch insurer details');
        }
      } catch (err) {
        setError('Failed to fetch insurer details');
        console.error('Error fetching insurer:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInsurer();
    }
  }, [params.id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading insurer details...</p>
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
              href="/insurers"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Insurers
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!insurer) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Insurer Not Found</h3>
            <p className="text-gray-500 mb-4">The requested insurer could not be found.</p>
            <Link
              href="/insurers"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Insurers
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
              <h1 className="text-2xl font-bold text-gray-900">{insurer.name}</h1>
              <p className="text-gray-600">Insurer Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/insurers"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Insurers
              </Link>
              <Link
                href={`/insurers/${insurer._id}/edit`}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Edit Insurer
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
                  <Link href="/insurers" className="text-gray-700 hover:text-orange-600">
                    Insurers
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">{insurer.name}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Insurer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Insurer Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{insurer.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Insurer Code</dt>
                    <dd className="mt-1 text-sm text-gray-900">{insurer.code || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                    <dd className="mt-1 text-sm text-gray-900">{insurer.contactPerson || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        insurer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {insurer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {insurer.phone ? (
                        <a href={`tel:${insurer.phone}`} className="text-orange-600 hover:text-orange-500">
                          {insurer.phone}
                        </a>
                      ) : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {insurer.email ? (
                        <a href={`mailto:${insurer.email}`} className="text-orange-600 hover:text-orange-500">
                          {insurer.email}
                        </a>
                      ) : '-'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Address */}
              {insurer.address && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{insurer.address}</p>
                </div>
              )}

              {/* Notes */}
              {insurer.notes && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{insurer.notes}</p>
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
                    href={`/insurers/${insurer._id}/edit`}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-center block"
                  >
                    Edit Insurer
                  </Link>
                  <Link
                    href={`/policies?insurerId=${insurer._id}`}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center block"
                  >
                    View Policies
                  </Link>
                  <Link
                    href={`/customer-policies?insurerId=${insurer._id}`}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-center block"
                  >
                    View Customer Policies
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
                      {new Date(insurer.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </dd>
                  </div>
                  {insurer.updatedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(insurer.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                  )}
                  {insurer.createdBy && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {insurer.createdBy.firstName} {insurer.createdBy.lastName}
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

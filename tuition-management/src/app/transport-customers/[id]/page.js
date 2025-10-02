'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import WhatsAppButton from '@/components/WhatsAppButton';
import Link from 'next/link';

export default function TransportCustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const [transportCustomer, setTransportCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchTransportCustomer();
    }
  }, [params.id]);

  const fetchTransportCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transport-customers/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTransportCustomer(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch transport customer');
      }
    } catch (error) {
      console.error('Error fetching transport customer:', error);
      setError('Failed to fetch transport customer');
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
              href="/transport-customers"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Transport Customers
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!transportCustomer) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-gray-500">Transport customer not found</p>
            <Link
              href="/transport-customers"
              className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Transport Customers
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
                {transportCustomer.name}
              </h1>
              <p className="text-gray-600">Transport Customer Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/transport-customers/${transportCustomer._id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Customer
              </Link>
              <Link
                href="/transport-customers"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Transport Customers
              </Link>
            </div>
          </div>

          {/* Transport Customer Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Customer Name</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-sm text-gray-900">{transportCustomer.phone}</p>
                      <WhatsAppButton
                        phone={transportCustomer.phone}
                        name={transportCustomer.name}
                        message={`Hello ${transportCustomer.name}, this is regarding your transport service. Please contact us for more details.`}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transportCustomer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transportCustomer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Vehicle Number</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.vehicleNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Vehicle Type</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.vehicleType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Driver Name</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.driverName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Driver Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.driverPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Route Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Pickup Point</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.pickupPoint}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Drop Point</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.dropPoint}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Pickup Time</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.pickupTime || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Drop Time</label>
                    <p className="mt-1 text-sm text-gray-900">{transportCustomer.dropTime || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {transportCustomer.address && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{transportCustomer.address}</p>
                </div>
              )}

              {/* Notes */}
              {transportCustomer.notes && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{transportCustomer.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Service Status */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
                <div className="flex items-center">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    transportCustomer.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {transportCustomer.status === 'active' ? 'Active Service' : 'Inactive Service'}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/fees/create?payerType=transport&payerId=${transportCustomer._id}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <span className="mr-2">💰</span>
                    Add Transport Fee
                  </Link>
                  <WhatsAppButton
                    phone={transportCustomer.phone}
                    name={transportCustomer.name}
                    message={`Hello ${transportCustomer.name}, this is regarding your transport service. Please contact us for more details.`}
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
                      {new Date(transportCustomer.createdAt).toLocaleDateString()} at {new Date(transportCustomer.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {transportCustomer.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900">
                        {new Date(transportCustomer.updatedAt).toLocaleDateString()} at {new Date(transportCustomer.updatedAt).toLocaleTimeString()}
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
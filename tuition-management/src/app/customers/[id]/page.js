'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import WhatsAppButton from '@/components/WhatsAppButton';
import Link from 'next/link';

export default function CustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch customer');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError('Failed to fetch customer');
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
              href="/customers"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Customers
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!customer) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-gray-500">Customer not found</p>
            <Link
              href="/customers"
              className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Customers
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
                {customer.name}
              </h1>
              <p className="text-gray-600">Customer Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/customers/${customer._id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Customer
              </Link>
              <Link
                href="/customers"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Customers
              </Link>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Relation to Student</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.relationToStudent || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-sm text-gray-900">{customer.phone}</p>
                      <WhatsAppButton
                        phone={customer.phone}
                        name={customer.name}
                        message={`Hello ${customer.name}, this is regarding your account. Please contact us for more details.`}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {customer.address && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{customer.address}</p>
                </div>
              )}

              {/* Notes */}
              {customer.notes && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{customer.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/fees/create?payerType=customer&payerId=${customer._id}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <span className="mr-2">💰</span>
                    Add Payment
                  </Link>
                  <WhatsAppButton
                    phone={customer.phone}
                    name={customer.name}
                    message={`Hello ${customer.name}, this is regarding your account. Please contact us for more details.`}
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
                      {new Date(customer.createdAt).toLocaleDateString()} at {new Date(customer.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {customer.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900">
                        {new Date(customer.updatedAt).toLocaleDateString()} at {new Date(customer.updatedAt).toLocaleTimeString()}
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

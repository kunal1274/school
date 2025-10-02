'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import WhatsAppButton from '@/components/WhatsAppButton';
import Link from 'next/link';

export default function TeacherViewPage() {
  const params = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchTeacher();
    }
  }, [params.id]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teachers/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTeacher(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch teacher');
      }
    } catch (error) {
      console.error('Error fetching teacher:', error);
      setError('Failed to fetch teacher');
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
              href="/teachers"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Teachers
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!teacher) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-gray-500">Teacher not found</p>
            <Link
              href="/teachers"
              className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Teachers
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
                {teacher.name}
              </h1>
              <p className="text-gray-600">Teacher Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/teachers/${teacher._id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Teacher
              </Link>
              <Link
                href="/teachers"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Teachers
              </Link>
            </div>
          </div>

          {/* Teacher Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Teacher Code</label>
                    <p className="mt-1 text-sm text-gray-900">{teacher.teacherCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{teacher.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Subject/Role</label>
                    <p className="mt-1 text-sm text-gray-900">{teacher.subjectOrRole}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      teacher.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {teacher.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Joining Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Salary</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {teacher.salary ? `₹${teacher.salary.toLocaleString()}` : 'Not set'}
                    </p>
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
                      <p className="text-sm text-gray-900">{teacher.phone}</p>
                      {teacher.phone && (
                        <WhatsAppButton
                          phone={teacher.phone}
                          name={teacher.name}
                          message={`Hello ${teacher.name}, this is regarding your teaching schedule. Please contact us for more details.`}
                          size="sm"
                          variant="outline"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                    <p className="mt-1 text-sm text-gray-900">{teacher.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {teacher.address && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{teacher.address}</p>
                </div>
              )}

              {/* Notes */}
              {teacher.notes && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{teacher.notes}</p>
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
                    href={`/fees/create?payerType=teacher&payerId=${teacher._id}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <span className="mr-2">💰</span>
                    Add Salary Payment
                  </Link>
                  {teacher.phone && (
                    <WhatsAppButton
                      phone={teacher.phone}
                      name={teacher.name}
                      message={`Hello ${teacher.name}, this is regarding your teaching schedule. Please contact us for more details.`}
                      className="w-full"
                      variant="outline"
                    />
                  )}
                </div>
              </div>

              {/* System Information */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">
                      {new Date(teacher.createdAt).toLocaleDateString()} at {new Date(teacher.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {teacher.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900">
                        {new Date(teacher.updatedAt).toLocaleDateString()} at {new Date(teacher.updatedAt).toLocaleTimeString()}
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

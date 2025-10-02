'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import WhatsAppButton from '@/components/WhatsAppButton';
import Link from 'next/link';

export default function StudentViewPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStudent(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch student');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      setError('Failed to fetch student');
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
              href="/students"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Students
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!student) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-gray-500">Student not found</p>
            <Link
              href="/students"
              className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Students
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
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-gray-600">Student Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/students/${student._id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Student
              </Link>
              <Link
                href="/students"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Students
              </Link>
            </div>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Student Code</label>
                    <p className="mt-1 text-sm text-gray-900">{student.studentCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{student.firstName} {student.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.dob ? new Date(student.dob).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Gender</label>
                    <p className="mt-1 text-sm text-gray-900">{student.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Class/Batch</label>
                    <p className="mt-1 text-sm text-gray-900">{student.classOrBatch}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Parent/Guardian Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Parent/Guardian Name</label>
                    <p className="mt-1 text-sm text-gray-900">{student.parentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-sm text-gray-900">{student.parentPhone}</p>
                      <WhatsAppButton
                        phone={student.parentPhone}
                        name={`${student.firstName} ${student.lastName}`}
                        message={`Hello ${student.parentName}, this is regarding ${student.firstName}'s tuition. Please contact us for more details.`}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {student.address && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{student.address}</p>
                </div>
              )}

              {/* Notes */}
              {student.notes && (
                <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{student.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Transport Status */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Service</h3>
                <div className="flex items-center">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    student.transportOptIn
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.transportOptIn ? 'Opted In' : 'Not Opted In'}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/fees/create?payerType=student&payerId=${student._id}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <span className="mr-2">💰</span>
                    Add Fee Payment
                  </Link>
                  <WhatsAppButton
                    phone={student.parentPhone}
                    name={`${student.firstName} ${student.lastName}`}
                    message={`Hello ${student.parentName}, this is regarding ${student.firstName}'s tuition fees. Please contact us for more details.`}
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
                      {new Date(student.createdAt).toLocaleDateString()} at {new Date(student.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {student.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900">
                        {new Date(student.updatedAt).toLocaleDateString()} at {new Date(student.updatedAt).toLocaleTimeString()}
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

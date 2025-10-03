'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import WhatsAppButton from '@/components/WhatsAppButton';
import DuplicateRecord, { useDuplicateRecord } from '@/components/DuplicateRecord';
import Link from 'next/link';

export default function TeachersPage() {
  const { user } = useAuth();
  const { duplicateRecord } = useDuplicateRecord('Teacher');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchTeachers();
  }, [filters]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/teachers?${queryParams}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.data || []);
        setPagination(data.pagination || {});
      } else {
        console.error('Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleDelete = async (teacherId, teacherName) => {
    if (!window.confirm(`Are you sure you want to delete ${teacherName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchTeachers(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Failed to delete teacher');
    }
  };

  const canDelete = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">Teachers</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
              <p className="text-gray-600">Manage teacher records</p>
            </div>
            <Link
              href="/teachers/create"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Teacher
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search teachers..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Per Page
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

          {/* Teachers Table */}
          <div className="bg-white rounded-lg shadow-soft overflow-hidden">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : teachers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teacher
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject/Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teachers.map((teacher) => (
                        <tr key={teacher._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {teacher.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {teacher.teacherCode}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {teacher.subjectOrRole}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{teacher.phone}</div>
                            {teacher.email && (
                              <div className="text-sm text-gray-500">{teacher.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {teacher.salary ? `₹${teacher.salary.toLocaleString()}` : 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              teacher.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {teacher.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Link
                              href={`/teachers/${teacher._id}`}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              View
                            </Link>
                            <Link
                              href={`/teachers/${teacher._id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                            <DuplicateRecord
                              record={teacher}
                              recordType="Teacher"
                              onDuplicate={duplicateRecord}
                            />
                            {teacher.phone && (
                              <WhatsAppButton
                                phone={teacher.phone}
                                name={teacher.name}
                                message={`Hello ${teacher.name}, this is regarding your teaching schedule. Please contact us for more details.`}
                                size="xs"
                                variant="outline"
                              />
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(teacher._id, teacher.name)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-sm">
                          {pagination.page} of {pagination.pages}
                        </span>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.pages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No teachers found</p>
                <Link
                  href="/teachers/create"
                  className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add First Teacher
                </Link>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

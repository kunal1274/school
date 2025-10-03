'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingStates';

export default function ActivityLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
    limit: 50
  });
  const [pagination, setPagination] = useState({
    total: 0,
    hasMore: false,
    skip: 0
  });

  useEffect(() => {
    fetchActivityLogs();
  }, [filters]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.entityType) queryParams.append('entityType', filters.entityType);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      queryParams.append('limit', filters.limit);
      queryParams.append('skip', pagination.skip);

      const response = await fetch(`/api/activity-logs?${queryParams}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, skip: 0 }));
  };

  const loadMore = () => {
    setPagination(prev => ({ ...prev, skip: prev.skip + filters.limit }));
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action) => {
    const colors = {
      create: 'text-green-600 bg-green-100',
      update: 'text-blue-600 bg-blue-100',
      delete: 'text-red-600 bg-red-100',
      view: 'text-gray-600 bg-gray-100',
      login: 'text-purple-600 bg-purple-100',
      logout: 'text-orange-600 bg-orange-100',
      export: 'text-indigo-600 bg-indigo-100',
      import: 'text-pink-600 bg-pink-100',
      duplicate: 'text-cyan-600 bg-cyan-100'
    };
    return colors[action] || 'text-gray-600 bg-gray-100';
  };

  const getEntityIcon = (entityType) => {
    const icons = {
      student: '👨‍🎓',
      teacher: '👩‍🏫',
      customer: '👥',
      'transport-customer': '🚌',
      fee: '💰',
      user: '👤'
    };
    return icons[entityType] || '📄';
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600">Track all system activities and user actions</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="view">View</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="export">Export</option>
                  <option value="import">Import</option>
                  <option value="duplicate">Duplicate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                <select
                  value={filters.entityType}
                  onChange={(e) => handleFilterChange('entityType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  <option value="">All Types</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="customer">Customer</option>
                  <option value="transport-customer">Transport Customer</option>
                  <option value="fee">Fee</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Activity Logs ({pagination.total} total)
              </h3>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading activity logs...</p>
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log._id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">{getEntityIcon(log.entityType)}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {log.entityType}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-900 font-medium">
                          {log.entityName || `${log.entityType} #${log.entityId}`}
                        </p>
                        
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            <details className="cursor-pointer">
                              <summary className="hover:text-gray-800">View Details</summary>
                              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatTimestamp(log.timestamp)}</span>
                          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {pagination.hasMore && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMore}
                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Logs</h3>
                  <p className="text-gray-600">No activity logs found for the selected filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

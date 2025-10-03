'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function InsuranceReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState({
    summary: {
      totalInsurers: 0,
      totalPolicies: 0,
      totalCustomerPolicies: 0,
      totalPayments: 0,
      totalClaims: 0,
      activePolicies: 0,
      lapsedPolicies: 0,
      cancelledPolicies: 0,
      expiredPolicies: 0,
      premiumRevenue: 0,
      claimsAmount: 0,
      claimsSettled: 0,
      claimsPending: 0
    },
    policies: [],
    payments: [],
    claims: []
  });
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    insurer: '',
    status: ''
  });

  // Fetch insurance reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/insurance/reports?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        // Ensure arrays are always present to prevent undefined errors
        const reportData = {
          summary: data.data.summary || {},
          policies: data.data.policies || [],
          payments: data.data.payments || [],
          claims: data.data.claims || []
        };
        setReports(reportData);
      } else {
        setError(data.error || 'Failed to fetch insurance reports');
      }
    } catch (error) {
      console.error('Error fetching insurance reports:', error);
      setError('Failed to fetch insurance reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = async (type) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      queryParams.append('type', type);

      const response = await fetch(`/api/insurance/reports/export?${queryParams}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `insurance-${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Insurance Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive insurance analytics and reporting</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('summary')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Export Summary
              </button>
              <button
                onClick={() => handleExport('all')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Export All
              </button>
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
                  <Link href="/insurance" className="text-gray-700 hover:text-orange-600">
                    Insurance Module
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">Insurance Reports</span>
                </div>
              </li>
            </ol>
          </nav>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurer
                </label>
                <select
                  value={filters.insurer}
                  onChange={(e) => handleFilterChange('insurer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  <option value="">All Insurers</option>
                  {/* This would be populated from insurers data */}
                </select>
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
                  <option value="lapsed">Lapsed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📋</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Policies</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reports.summary.totalCustomerPolicies || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Premium</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{reports.summary.premiumRevenue || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">💳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Payments</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{reports.summary.premiumRevenue || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">⚖️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Claims</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reports.summary.totalClaims || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Status Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reports.summary.activePolicies || 0}
                </div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {reports.summary.lapsedPolicies || 0}
                </div>
                <div className="text-sm text-gray-500">Lapsed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {reports.summary.cancelledPolicies || 0}
                </div>
                <div className="text-sm text-gray-500">Cancelled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {reports.summary.expiredPolicies || 0}
                </div>
                <div className="text-sm text-gray-500">Expired</div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Policies */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Policies</h3>
              <div className="space-y-3">
                {(reports.policies || []).length > 0 ? (
                  (reports.policies || []).slice(0, 5).map((policy, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{policy.policyNumber}</p>
                        <p className="text-xs text-gray-500">{policy.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{policy.premium}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          policy.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {policy.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent policies found.</p>
                )}
              </div>
            </div>

            {/* Recent Claims */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Claims</h3>
              <div className="space-y-3">
                {(reports.claims || []).length > 0 ? (
                  (reports.claims || []).slice(0, 5).map((claim, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{claim.claimNumber}</p>
                        <p className="text-xs text-gray-500">{claim.policyNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{claim.amountClaimed}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          claim.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : claim.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent claims found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/insurers"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🏢</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Manage Insurers</p>
                  <p className="text-xs text-gray-500">View and manage insurance companies</p>
                </div>
              </Link>

              <Link
                href="/policies"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Manage Policies</p>
                  <p className="text-xs text-gray-500">View and manage insurance policies</p>
                </div>
              </Link>

              <Link
                href="/claims"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">⚖️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Manage Claims</p>
                  <p className="text-xs text-gray-500">View and manage insurance claims</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

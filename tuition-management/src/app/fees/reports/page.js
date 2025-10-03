'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { generateFeeReport, generateFeeInsights, calculateFeeStatistics } from '@/lib/fees-tracking';
import { LoadingSpinner, SkeletonTable } from '@/components/LoadingStates';

export default function FeesReportsPage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    payerType: '',
    status: ''
  });

  const payerTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'customer', label: 'Customer' },
    { value: 'transport', label: 'Transport' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' }
  ];

  useEffect(() => {
    fetchFees();
  }, []);

  useEffect(() => {
    if (fees.length > 0) {
      generateReport();
    }
  }, [fees, filters]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fees?limit=1000', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFees(data.data || []);
      } else {
        console.error('Failed to fetch fees');
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const reportOptions = {
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
      payerType: filters.payerType || null,
      status: filters.status || null,
      groupBy: 'month'
    };

    const report = generateFeeReport(fees, reportOptions);
    const insights = generateFeeInsights(fees);
    
    setReportData(report);
    setInsights(insights);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportData = (format) => {
    const dataToExport = reportData ? Object.values(reportData).flatMap(group => group.fees) : fees;
    
    if (format === 'csv') {
      const csv = convertToCSV(dataToExport);
      downloadFile(csv, 'fees-report.csv', 'text/csv');
    } else if (format === 'json') {
      const json = JSON.stringify(dataToExport, null, 2);
      downloadFile(json, 'fees-report.json', 'application/json');
    }
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = ['Transaction ID', 'Payer Type', 'Payer Name', 'Amount', 'Status', 'Date', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...data.map(fee => [
        fee.transactionId,
        fee.payerType,
        fee.payeeName,
        fee.amount,
        fee.status,
        fee.date,
        fee.modeOfPayment
      ].map(field => `"${field || ''}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6">
            <SkeletonTable rows={5} columns={4} />
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
              <h1 className="text-2xl font-bold text-gray-900">Fees Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive fee tracking and reporting</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => exportData('csv')}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Export CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Export JSON
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Payer Type</label>
                <select
                  value={filters.payerType}
                  onChange={(e) => handleFilterChange('payerType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  {payerTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-green-600 text-xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{insights.summary.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{insights.summary.collectionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-yellow-600 text-xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                    <p className="text-2xl font-bold text-gray-900">₹{insights.summary.pendingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue Count</p>
                    <p className="text-2xl font-bold text-gray-900">{insights.summary.overdueCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Report */}
          {reportData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Monthly Fee Report</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(reportData).map(([month, data]) => (
                      <tr key={month} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{data.statistics.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          ₹{data.statistics.paid.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                          ₹{data.statistics.pending.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Overdue Fees Alert */}
          {insights && insights.alerts.overdueFees.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-red-600 text-xl mr-2">⚠️</span>
                <h3 className="text-lg font-medium text-red-900">Overdue Fees Alert</h3>
              </div>
              <div className="space-y-2">
                {insights.alerts.overdueFees.slice(0, 5).map((fee, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                    <div>
                      <span className="font-medium">{fee.payeeName}</span>
                      <span className="text-gray-500 ml-2">({fee.transactionId})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{fee.amount}</div>
                      <div className="text-sm text-red-600">{fee.daysOverdue} days overdue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    customers: 0,
    transportCustomers: 0,
    totalFees: 0,
    recentFees: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch counts for each entity
      const [studentsRes, teachersRes, customersRes, transportRes, feesRes] = await Promise.all([
        fetch('/api/students?limit=1', { credentials: 'include' }),
        fetch('/api/teachers?limit=1', { credentials: 'include' }),
        fetch('/api/customers?limit=1', { credentials: 'include' }),
        fetch('/api/transport-customers?limit=1', { credentials: 'include' }),
        fetch('/api/fees?limit=5', { credentials: 'include' })
      ]);

      const [students, teachers, customers, transport, fees] = await Promise.all([
        studentsRes.json(),
        teachersRes.json(),
        customersRes.json(),
        transportRes.json(),
        feesRes.json()
      ]);

      // Calculate total fees amount
      let totalFeesAmount = 0;
      if (fees.success && fees.data) {
        const allFeesRes = await fetch('/api/fees?limit=1000', { credentials: 'include' });
        const allFees = await allFeesRes.json();
        if (allFees.success) {
          totalFeesAmount = allFees.data.reduce((sum, fee) => sum + fee.amount, 0);
        }
      }

      setStats({
        students: students.success ? students.pagination?.total || 0 : 0,
        teachers: teachers.success ? teachers.pagination?.total || 0 : 0,
        customers: customers.success ? customers.pagination?.total || 0 : 0,
        transportCustomers: transport.success ? transport.pagination?.total || 0 : 0,
        totalFees: totalFeesAmount,
        recentFees: fees.success ? fees.data || [] : []
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'brand-orange' }) => (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>
            {loading ? '...' : typeof value === 'number' && title.includes('Fees') ? `₹${value.toLocaleString()}` : value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={stats.students}
              icon="👨‍🎓"
              color="brand-orange"
            />
            <StatCard
              title="Total Teachers"
              value={stats.teachers}
              icon="👩‍🏫"
              color="brand-green"
            />
            <StatCard
              title="Total Customers"
              value={stats.customers}
              icon="👥"
              color="royal-blue"
            />
            <StatCard
              title="Transport Customers"
              value={stats.transportCustomers}
              icon="🚌"
              color="brand-saffron"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatCard
              title="Total Fees Collected"
              value={stats.totalFees}
              icon="💰"
              color="brand-green"
            />
            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/students/create"
                  className="flex items-center justify-center px-4 py-3 bg-brand-orange-100 text-brand-orange-700 rounded-lg hover:bg-brand-orange-200 transition-colors"
                >
                  <span className="mr-2">👨‍🎓</span>
                  Add Student
                </a>
                <a
                  href="/teachers/create"
                  className="flex items-center justify-center px-4 py-3 bg-brand-green-100 text-brand-green-700 rounded-lg hover:bg-brand-green-200 transition-colors"
                >
                  <span className="mr-2">👩‍🏫</span>
                  Add Teacher
                </a>
                <a
                  href="/fees/create"
                  className="flex items-center justify-center px-4 py-3 bg-royal-blue-100 text-royal-blue-700 rounded-lg hover:bg-royal-blue-200 transition-colors"
                >
                  <span className="mr-2">💰</span>
                  Add Fee
                </a>
                <a
                  href="/customers/create"
                  className="flex items-center justify-center px-4 py-3 bg-brand-saffron-100 text-brand-saffron-700 rounded-lg hover:bg-brand-saffron-200 transition-colors"
                >
                  <span className="mr-2">👥</span>
                  Add Customer
                </a>
              </div>
            </div>
          </div>

          {/* Recent Fees */}
          <div className="bg-white rounded-lg shadow-soft">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Fee Collections</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange-500 mx-auto"></div>
                </div>
              ) : stats.recentFees.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentFees.map((fee) => (
                    <div key={fee._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{fee.transactionId}</p>
                        <p className="text-sm text-gray-600">{fee.payeeName} • {fee.payerType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-brand-green-600">₹{fee.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{new Date(fee.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent fee collections</p>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function TuitionModulePage() {
  const router = useRouter();

  const tuitionModules = [
    {
      name: 'Students',
      href: '/students',
      icon: '👨‍🎓',
      description: 'Manage student records and information',
      color: 'bg-blue-500'
    },
    {
      name: 'Teachers',
      href: '/teachers',
      icon: '👩‍🏫',
      description: 'Manage teacher records and information',
      color: 'bg-green-500'
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: '👥',
      description: 'Manage customer relationships',
      color: 'bg-purple-500'
    },
    {
      name: 'Transport',
      href: '/transport-customers',
      icon: '🚌',
      description: 'Manage transport customers and routes',
      color: 'bg-yellow-500'
    },
    {
      name: 'Fees',
      href: '/fees',
      icon: '💰',
      description: 'Manage fee collection and payments',
      color: 'bg-orange-500'
    },
    {
      name: 'Reports',
      href: '/fees/reports',
      icon: '📈',
      description: 'View tuition reports and analytics',
      color: 'bg-red-500'
    }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tuition Module</h1>
              <p className="text-gray-600">Manage all tuition-related activities</p>
            </div>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
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
                  <span className="text-gray-500">Tuition Module</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tuitionModules.map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className="group relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-orange-300"
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200`}>
                    {module.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

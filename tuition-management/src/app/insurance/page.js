'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function InsuranceModulePage() {
  const router = useRouter();

  const insuranceModules = [
    {
      name: 'Insurers',
      href: '/insurers',
      icon: '🏢',
      description: 'Manage insurance companies',
      color: 'bg-blue-500'
    },
    {
      name: 'Policies',
      href: '/policies',
      icon: '📋',
      description: 'Manage insurance policies',
      color: 'bg-green-500'
    },
    {
      name: 'Customer Policies',
      href: '/customer-policies',
      icon: '📄',
      description: 'Manage customer policy assignments',
      color: 'bg-purple-500'
    },
    {
      name: 'Policy Payments',
      href: '/policy-payments',
      icon: '💳',
      description: 'Manage premium payments',
      color: 'bg-yellow-500'
    },
    {
      name: 'Claims',
      href: '/claims',
      icon: '⚖️',
      description: 'Manage insurance claims',
      color: 'bg-orange-500'
    },
    {
      name: 'Insurance Reports',
      href: '/insurance/reports',
      icon: '📊',
      description: 'View insurance reports and analytics',
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
              <h1 className="text-3xl font-bold text-gray-900">Insurance Module</h1>
              <p className="text-gray-600">Manage all insurance-related activities</p>
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
                  <span className="text-gray-500">Insurance Module</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insuranceModules.map((module) => (
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useConfirmationDialog } from '@/components/CustomDialog';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';

export default function CreateUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { alert, DialogComponent } = useConfirmationDialog();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    phone: '',
    isActive: true
  });

  const roleOptions = [
    { value: 'staff', label: 'Staff' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'admin', label: 'Admin' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Error', 'Passwords do not match', 'error');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      alert('Error', 'Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          isActive: formData.isActive
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        setShowSuccessModal(true);
        setTimeout(() => {
          router.push('/users');
        }, 1500);
      } else {
        alert('Error', data.error || 'Failed to create user', 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error', 'Network error while creating user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has admin permissions
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need admin permissions to create users.
          </p>
          <div className="mt-6">
            <Link
              href="/users"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/users" className="text-gray-400 hover:text-gray-500">
                  Users
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">Create New</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Create User</h1>
          <p className="mt-2 text-gray-600">
            Add a new user to the system with appropriate role and permissions
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2">
                <FormInput
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div>
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone */}
              <div>
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number (optional)"
                />
              </div>

              {/* Role */}
              <div>
                <FormSelect
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  options={roleOptions}
                />
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active user
                </label>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter password (min 6 characters)"
                    minLength={6}
                  />
                </div>
                <div>
                  <FormInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Confirm password"
                    minLength={6}
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Password must be at least 6 characters long.
              </p>
            </div>

            {/* Role Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Role Permissions</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Staff:</strong> Can view and manage students, teachers, customers, transport, and fees</p>
                <p><strong>Moderator:</strong> All staff permissions plus user management</p>
                <p><strong>Admin:</strong> Full system access including user management and system settings</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/users"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal Overlay */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-fadeIn">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 animate-bounce">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">🎉 Success!</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  User <span className="font-semibold text-green-700">&quot;{formData.name}&quot;</span> has been created successfully!
                </p>
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                  <span className="font-medium">Redirecting to users list...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogComponent />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

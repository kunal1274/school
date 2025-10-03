'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { useConfirmationDialog } from '@/components/CustomDialog';

export default function CreateStudentPage() {
  const router = useRouter();
  const { alert, DialogComponent } = useConfirmationDialog();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    classOrBatch: '',
    parentName: '',
    parentPhone: '',
    address: '',
    transportOptIn: false,
    notes: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          router.push('/students');
        }, 1500);
      } else {
        if (data.details) {
          setErrors(data.details);
        } else {
          alert('Error', data.error || 'Failed to create student', 'error');
        }
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Error', 'Failed to create student. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
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
                  <Link href="/students" className="ml-4 text-gray-400 hover:text-gray-500">
                    Students
                  </Link>
                </div>
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

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
            <p className="text-gray-600">Create a new student record</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-soft p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
                placeholder="Enter first name"
              />

              <FormInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
                placeholder="Enter last name"
              />

              <FormInput
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                error={errors.dob}
              />

              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
                error={errors.gender}
                placeholder="Select gender"
              />

              <FormInput
                label="Class/Batch"
                name="classOrBatch"
                value={formData.classOrBatch}
                onChange={handleChange}
                error={errors.classOrBatch}
                required
                placeholder="e.g., Class 10, JEE Batch A"
              />

              <FormSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                error={errors.status}
                required
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Parent/Guardian Name"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  error={errors.parentName}
                  required
                  placeholder="Enter parent/guardian name"
                />

                <FormInput
                  label="Parent/Guardian Phone"
                  name="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  error={errors.parentPhone}
                  required
                  placeholder="+91-9876543210"
                />
              </div>
            </div>

            <FormTextarea
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Enter complete address"
              rows={3}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="transportOptIn"
                name="transportOptIn"
                checked={formData.transportOptIn}
                onChange={handleChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="transportOptIn" className="ml-2 block text-sm text-gray-900">
                Opt-in for transport service
              </label>
            </div>

            <FormTextarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              error={errors.notes}
              placeholder="Any additional notes about the student"
              rows={3}
            />

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Student'}
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
                  Student <span className="font-semibold text-green-700">&quot;{formData.firstName} {formData.lastName}&quot;</span> has been created successfully!
                </p>
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                  <span className="font-medium">Redirecting to students list...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogComponent />
      </Layout>
    </ProtectedRoute>
  );
}

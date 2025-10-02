'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
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
        const student = data.data;
        
        // Format date for input field
        const dob = student.dob ? new Date(student.dob).toISOString().split('T')[0] : '';
        
        setFormData({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          dob: dob,
          gender: student.gender || '',
          classOrBatch: student.classOrBatch || '',
          parentName: student.parentName || '',
          parentPhone: student.parentPhone || '',
          address: student.address || '',
          transportOptIn: student.transportOptIn || false,
          notes: student.notes || '',
          status: student.status || 'active'
        });
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
      const response = await fetch(`/api/students/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/students/${params.id}`);
      } else {
        if (data.details) {
          setErrors(data.details);
        } else {
          alert(data.error || 'Failed to update student');
        }
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student');
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
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
            <p className="text-gray-600">Update student information</p>
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
                {isSubmitting ? 'Updating...' : 'Update Student'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

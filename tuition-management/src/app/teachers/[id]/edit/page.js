'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';

export default function EditTeacherPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    subjectOrRole: '',
    phone: '',
    email: '',
    address: '',
    joiningDate: '',
    salary: '',
    notes: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchTeacher();
    }
  }, [params.id]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teachers/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const teacher = data.data;
        
        // Format date for input field
        const joiningDate = teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : '';
        
        setFormData({
          name: teacher.name || '',
          subjectOrRole: teacher.subjectOrRole || '',
          phone: teacher.phone || '',
          email: teacher.email || '',
          address: teacher.address || '',
          joiningDate: joiningDate,
          salary: teacher.salary || '',
          notes: teacher.notes || '',
          status: teacher.status || 'active'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch teacher');
      }
    } catch (error) {
      console.error('Error fetching teacher:', error);
      setError('Failed to fetch teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : '') : value
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
      const response = await fetch(`/api/teachers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/teachers/${params.id}`);
      } else {
        if (data.details) {
          setErrors(data.details);
        } else {
          alert(data.error || 'Failed to update teacher');
        }
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      alert('Failed to update teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Teacher</h1>
            <p className="text-gray-600">Update teacher information</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-soft p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="Enter full name"
              />

              <FormInput
                label="Subject/Role"
                name="subjectOrRole"
                value={formData.subjectOrRole}
                onChange={handleChange}
                error={errors.subjectOrRole}
                required
                placeholder="e.g., Mathematics, English, Principal"
              />

              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                placeholder="+91-9876543210"
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="teacher@example.com"
              />

              <FormInput
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleChange}
                error={errors.joiningDate}
              />

              <FormInput
                label="Salary (₹)"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                error={errors.salary}
                placeholder="50000"
                min="0"
                step="1000"
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

            <FormTextarea
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Enter complete address"
              rows={3}
            />

            <FormTextarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              error={errors.notes}
              placeholder="Any additional notes about the teacher"
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
                {isSubmitting ? 'Updating...' : 'Update Teacher'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

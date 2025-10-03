'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useConfirmationDialog } from '@/components/CustomDialog';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';

export default function EditInsurerPage({ params }) {
  const router = useRouter();
  const { showDialog } = useConfirmationDialog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInsurer = async () => {
      try {
        const response = await fetch(`/api/insurers/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setFormData({
            name: data.data.name || '',
            code: data.data.code || '',
            contactPerson: data.data.contactPerson || '',
            phone: data.data.phone || '',
            email: data.data.email || '',
            address: data.data.address || '',
            notes: data.data.notes || '',
            isActive: data.data.isActive !== undefined ? data.data.isActive : true
          });
        } else {
          await showDialog('Error', data.error || 'Failed to fetch insurer details');
          router.push('/insurers');
        }
      } catch (err) {
        console.error('Error fetching insurer:', err);
        await showDialog('Error', 'Failed to fetch insurer details');
        router.push('/insurers');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInsurer();
    }
  }, [params.id, router, showDialog]);

  const handleInputChange = (e) => {
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Insurer name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/insurers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccessModal(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/insurers/${params.id}`);
        }, 2000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          await showDialog('Error', data.error || 'Failed to update insurer');
        }
      }
    } catch (error) {
      console.error('Error updating insurer:', error);
      await showDialog('Error', 'Failed to update insurer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading insurer details...</p>
            </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Insurer</h1>
              <p className="text-gray-600">Update insurer information</p>
            </div>
            <Link
              href={`/insurers/${params.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Insurer
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
                  <Link href="/insurers" className="text-gray-700 hover:text-orange-600">
                    Insurers
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <Link href={`/insurers/${params.id}`} className="text-gray-700 hover:text-orange-600">
                    {formData.name}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">Edit</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  
                  <FormInput
                    label="Insurer Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    placeholder="Enter insurer name"
                    required
                  />

                  <FormInput
                    label="Insurer Code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    error={errors.code}
                    placeholder="Enter unique code (e.g., LIC, ICICI)"
                  />

                  <FormInput
                    label="Contact Person"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    error={errors.contactPerson}
                    placeholder="Enter contact person name"
                  />
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  
                  <FormInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    placeholder="Enter phone number"
                  />

                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    placeholder="Enter email address"
                  />

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                <FormTextarea
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <FormTextarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  error={errors.notes}
                  placeholder="Enter any additional notes or information"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href={`/insurers/${params.id}`}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Insurer Updated Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  The insurer information has been updated.
                </p>
                <div className="text-sm text-gray-500">
                  Redirecting to insurer details...
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

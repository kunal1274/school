'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';

export default function EditTransportCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleNumber: '',
    vehicleType: '',
    driverName: '',
    driverPhone: '',
    pickupPoint: '',
    dropPoint: '',
    pickupTime: '',
    dropTime: '',
    address: '',
    notes: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchTransportCustomer();
    }
  }, [params.id]);

  const fetchTransportCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transport-customers/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const transportCustomer = data.data;
        
        setFormData({
          name: transportCustomer.name || '',
          phone: transportCustomer.phone || '',
          email: transportCustomer.email || '',
          vehicleNumber: transportCustomer.vehicleNumber || '',
          vehicleType: transportCustomer.vehicleType || '',
          driverName: transportCustomer.driverName || '',
          driverPhone: transportCustomer.driverPhone || '',
          pickupPoint: transportCustomer.pickupPoint || '',
          dropPoint: transportCustomer.dropPoint || '',
          pickupTime: transportCustomer.pickupTime || '',
          dropTime: transportCustomer.dropTime || '',
          address: transportCustomer.address || '',
          notes: transportCustomer.notes || '',
          status: transportCustomer.status || 'active'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch transport customer');
      }
    } catch (error) {
      console.error('Error fetching transport customer:', error);
      setError('Failed to fetch transport customer');
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
      const response = await fetch(`/api/transport-customers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/transport-customers/${params.id}`);
      } else {
        if (data.details) {
          setErrors(data.details);
        } else {
          setError(data.error || 'Failed to update transport customer');
        }
      }
    } catch (error) {
      console.error('Error updating transport customer:', error);
      setError('Failed to update transport customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleTypeOptions = [
    { value: 'Bus', label: 'Bus' },
    { value: 'Van', label: 'Van' },
    { value: 'Car', label: 'Car' },
    { value: 'Auto', label: 'Auto' },
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
              onClick={() => router.push('/transport-customers')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Transport Customers
            </button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Transport Customer</h1>
            <p className="text-gray-600">Update transport customer information</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-soft p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                id="name"
                name="name"
                label="Customer Name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
              <FormInput
                id="phone"
                name="phone"
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />
              <FormInput
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <FormInput
                id="vehicleNumber"
                name="vehicleNumber"
                label="Vehicle Number"
                type="text"
                value={formData.vehicleNumber}
                onChange={handleChange}
                error={errors.vehicleNumber}
                required
              />
              <FormSelect
                id="vehicleType"
                name="vehicleType"
                label="Vehicle Type"
                value={formData.vehicleType}
                onChange={handleChange}
                error={errors.vehicleType}
                options={vehicleTypeOptions}
                required
              />
              <FormInput
                id="driverName"
                name="driverName"
                label="Driver Name"
                type="text"
                value={formData.driverName}
                onChange={handleChange}
                error={errors.driverName}
              />
              <FormInput
                id="driverPhone"
                name="driverPhone"
                label="Driver Phone"
                type="tel"
                value={formData.driverPhone}
                onChange={handleChange}
                error={errors.driverPhone}
              />
              <FormInput
                id="pickupPoint"
                name="pickupPoint"
                label="Pickup Point"
                type="text"
                value={formData.pickupPoint}
                onChange={handleChange}
                error={errors.pickupPoint}
                required
              />
              <FormInput
                id="dropPoint"
                name="dropPoint"
                label="Drop Point"
                type="text"
                value={formData.dropPoint}
                onChange={handleChange}
                error={errors.dropPoint}
                required
              />
              <FormInput
                id="pickupTime"
                name="pickupTime"
                label="Pickup Time"
                type="time"
                value={formData.pickupTime}
                onChange={handleChange}
                error={errors.pickupTime}
              />
              <FormInput
                id="dropTime"
                name="dropTime"
                label="Drop Time"
                type="time"
                value={formData.dropTime}
                onChange={handleChange}
                error={errors.dropTime}
              />
              <FormSelect
                id="status"
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                error={errors.status}
                options={statusOptions}
                required
              />
            </div>

            <FormTextarea
              id="address"
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              rows={3}
            />

            <FormTextarea
              id="notes"
              name="notes"
              label="Notes"
              value={formData.notes}
              onChange={handleChange}
              error={errors.notes}
              rows={3}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(`/transport-customers/${params.id}`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Transport Customer'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
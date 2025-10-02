'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useConfirmationDialog } from '@/components/CustomDialog';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';

export default function SettingsPage() {
  const { user } = useAuth();
  const { alert, DialogComponent } = useConfirmationDialog();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolWebsite: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    defaultFeeAmount: '',
    lateFeePercentage: '',
    maxLateFeeDays: '',
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    allowStudentRegistration: true,
    allowOnlinePayments: false,
    paymentGateway: '',
    termsAndConditions: '',
    privacyPolicy: '',
    aboutUs: ''
  });

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('schoolSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in a real app, this would be saved to the database)
      localStorage.setItem('schoolSettings', JSON.stringify(settings));
      alert('Success', 'Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error', 'Failed to save settings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      schoolName: '',
      schoolAddress: '',
      schoolPhone: '',
      schoolEmail: '',
      schoolWebsite: '',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      defaultFeeAmount: '',
      lateFeePercentage: '',
      maxLateFeeDays: '',
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      autoBackup: true,
      backupFrequency: 'daily',
      maintenanceMode: false,
      allowStudentRegistration: true,
      allowOnlinePayments: false,
      paymentGateway: '',
      termsAndConditions: '',
      privacyPolicy: '',
      aboutUs: ''
    };
    setSettings(defaultSettings);
    alert('Info', 'Settings reset to default values.', 'info');
  };

  // Check if user has admin permissions
  if (user?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
              <p className="mt-1 text-sm text-gray-500">
                You need admin privileges to access settings.
              </p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage system settings and preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* School Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">School Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    id="schoolName"
                    name="schoolName"
                    label="School Name"
                    type="text"
                    value={settings.schoolName}
                    onChange={handleChange}
                    placeholder="Enter school name"
                  />
                  <FormInput
                    id="schoolPhone"
                    name="schoolPhone"
                    label="Phone Number"
                    type="tel"
                    value={settings.schoolPhone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                  <FormInput
                    id="schoolEmail"
                    name="schoolEmail"
                    label="Email Address"
                    type="email"
                    value={settings.schoolEmail}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                  <FormInput
                    id="schoolWebsite"
                    name="schoolWebsite"
                    label="Website"
                    type="url"
                    value={settings.schoolWebsite}
                    onChange={handleChange}
                    placeholder="Enter website URL"
                  />
                </div>
                <FormTextarea
                  id="schoolAddress"
                  name="schoolAddress"
                  label="School Address"
                  value={settings.schoolAddress}
                  onChange={handleChange}
                  placeholder="Enter complete school address"
                  className="mt-4"
                />
              </div>

              {/* Financial Settings */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormSelect
                    id="currency"
                    name="currency"
                    label="Currency"
                    value={settings.currency}
                    onChange={handleChange}
                    options={[
                      { value: 'INR', label: 'Indian Rupee (₹)' },
                      { value: 'USD', label: 'US Dollar ($)' },
                      { value: 'EUR', label: 'Euro (€)' },
                      { value: 'GBP', label: 'British Pound (£)' }
                    ]}
                  />
                  <FormInput
                    id="defaultFeeAmount"
                    name="defaultFeeAmount"
                    label="Default Fee Amount"
                    type="number"
                    value={settings.defaultFeeAmount}
                    onChange={handleChange}
                    placeholder="Enter default fee amount"
                  />
                  <FormInput
                    id="lateFeePercentage"
                    name="lateFeePercentage"
                    label="Late Fee Percentage"
                    type="number"
                    value={settings.lateFeePercentage}
                    onChange={handleChange}
                    placeholder="Enter late fee percentage"
                  />
                </div>
                <FormInput
                  id="maxLateFeeDays"
                  name="maxLateFeeDays"
                  label="Maximum Late Fee Days"
                  type="number"
                  value={settings.maxLateFeeDays}
                  onChange={handleChange}
                  placeholder="Enter maximum days for late fee"
                  className="mt-4"
                />
              </div>

              {/* System Settings */}
              <div className="bg-white rounded-lg shadow-soft p-6 mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">System Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    id="timezone"
                    name="timezone"
                    label="Timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                    options={[
                      { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                      { value: 'Europe/London', label: 'Europe/London (GMT)' }
                    ]}
                  />
                  <FormSelect
                    id="dateFormat"
                    name="dateFormat"
                    label="Date Format"
                    value={settings.dateFormat}
                    onChange={handleChange}
                    options={[
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                    ]}
                  />
                </div>
                <div className="mt-4">
                  <FormSelect
                    id="backupFrequency"
                    name="backupFrequency"
                    label="Backup Frequency"
                    value={settings.backupFrequency}
                    onChange={handleChange}
                    options={[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Notification Settings */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="smsNotifications"
                      name="smsNotifications"
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
                      SMS Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="whatsappNotifications"
                      name="whatsappNotifications"
                      type="checkbox"
                      checked={settings.whatsappNotifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="whatsappNotifications" className="ml-2 block text-sm text-gray-900">
                      WhatsApp Notifications
                    </label>
                  </div>
                </div>
              </div>

              {/* System Controls */}
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">System Controls</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="maintenanceMode"
                      name="maintenanceMode"
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                      Maintenance Mode
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="allowStudentRegistration"
                      name="allowStudentRegistration"
                      type="checkbox"
                      checked={settings.allowStudentRegistration}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowStudentRegistration" className="ml-2 block text-sm text-gray-900">
                      Allow Student Registration
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="allowOnlinePayments"
                      name="allowOnlinePayments"
                      type="checkbox"
                      checked={settings.allowOnlinePayments}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowOnlinePayments" className="ml-2 block text-sm text-gray-900">
                      Allow Online Payments
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="autoBackup"
                      name="autoBackup"
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-900">
                      Auto Backup
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Gateway */}
              {settings.allowOnlinePayments && (
                <div className="bg-white rounded-lg shadow-soft p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Gateway</h2>
                  <FormSelect
                    id="paymentGateway"
                    name="paymentGateway"
                    label="Payment Gateway"
                    value={settings.paymentGateway}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Payment Gateway' },
                      { value: 'razorpay', label: 'Razorpay' },
                      { value: 'payu', label: 'PayU' },
                      { value: 'paytm', label: 'Paytm' },
                      { value: 'stripe', label: 'Stripe' }
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Legal Documents */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Legal Documents</h2>
            <div className="grid grid-cols-1 gap-4">
              <FormTextarea
                id="termsAndConditions"
                name="termsAndConditions"
                label="Terms and Conditions"
                value={settings.termsAndConditions}
                onChange={handleChange}
                placeholder="Enter terms and conditions"
                rows={4}
              />
              <FormTextarea
                id="privacyPolicy"
                name="privacyPolicy"
                label="Privacy Policy"
                value={settings.privacyPolicy}
                onChange={handleChange}
                placeholder="Enter privacy policy"
                rows={4}
              />
              <FormTextarea
                id="aboutUs"
                name="aboutUs"
                label="About Us"
                value={settings.aboutUs}
                onChange={handleChange}
                placeholder="Enter about us information"
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
        <DialogComponent />
      </Layout>
    </ProtectedRoute>
  );
}

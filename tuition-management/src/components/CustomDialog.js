'use client';

import { useState, useEffect } from 'react';

export default function CustomDialog({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'warning', 'error'
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  onConfirm,
  onCancel
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          iconBg: 'bg-green-100',
          titleColor: 'text-green-900',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          iconBg: 'bg-yellow-100',
          titleColor: 'text-yellow-900',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'error':
        return {
          icon: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          iconBg: 'bg-red-100',
          titleColor: 'text-red-900',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return {
          icon: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-blue-100',
          titleColor: 'text-blue-900',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  if (!isVisible) return null;

  const { icon, iconBg, titleColor, buttonColor } = getIconAndColors();

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        {/* Dialog */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                {icon}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className={`text-lg leading-6 font-medium ${titleColor}`}>
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
            {showCancel && (
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleCancel}
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirmation Dialog Hook
export function useConfirmationDialog() {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null
  });

  const showDialog = ({ title, message, type = 'info', onConfirm, onCancel }) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      onCancel
    });
  };

  const hideDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const confirm = (title, message, onConfirm) => {
    showDialog({
      title,
      message,
      type: 'warning',
      showCancel: true,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm,
      onCancel: hideDialog
    });
  };

  const alert = (title, message, type = 'info') => {
    showDialog({
      title,
      message,
      type,
      onConfirm: hideDialog
    });
  };

  const DialogComponent = () => (
    <CustomDialog
      isOpen={dialog.isOpen}
      onClose={hideDialog}
      title={dialog.title}
      message={dialog.message}
      type={dialog.type}
      showCancel={dialog.showCancel}
      onConfirm={dialog.onConfirm}
      onCancel={dialog.onCancel}
    />
  );

  return {
    showDialog,
    hideDialog,
    confirm,
    alert,
    DialogComponent
  };
}

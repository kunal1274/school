'use client';

import { useState } from 'react';

// Error Boundary Component
export function ErrorBoundary({ children, fallback = null }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (error, errorInfo) => {
    console.error('Error caught by boundary:', error, errorInfo);
    setHasError(true);
    setError(error);
  };

  if (hasError) {
    return fallback || <ErrorFallback error={error} />;
  }

  return children;
}

// Error Fallback Component
export function ErrorFallback({ error, onRetry = null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          We encountered an unexpected error. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left mb-4">
            <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Error Message Component
export function ErrorMessage({ 
  message, 
  type = 'error', 
  dismissible = false, 
  onDismiss = null,
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss && onDismiss();
  };

  if (!isVisible) return null;

  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  const iconClasses = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
    success: 'text-green-400'
  };

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };

  return (
    <div className={`border rounded-md p-4 ${typeClasses[type]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={`text-lg ${iconClasses[type]}`}>
            {icons[type]}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleDismiss}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${iconClasses[type]} hover:bg-opacity-20`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Network Error Component
export function NetworkError({ onRetry = null, className = '' }) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-gray-400 text-6xl mb-4">🌐</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Network Error</h3>
      <p className="text-gray-600 mb-4">
        Unable to connect to the server. Please check your internet connection and try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Not Found Component
export function NotFound({ 
  title = "Not Found", 
  message = "The requested resource could not be found.",
  showBackButton = true,
  onBack = null,
  className = '' 
}) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-gray-400 text-6xl mb-4">🔍</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {showBackButton && (
        <button
          onClick={onBack || (() => window.history.back())}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Go Back
        </button>
      )}
    </div>
  );
}

// Validation Error Component
export function ValidationErrors({ errors = {}, className = '' }) {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(errors).map(([field, message]) => (
        <ErrorMessage
          key={field}
          message={`${field}: ${message}`}
          type="error"
          className="text-sm"
        />
      ))}
    </div>
  );
}

// Hook for error handling
export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = (error) => {
    console.error('Error:', error);
    setError(error);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    handleError,
    clearError,
    hasError: !!error
  };
}

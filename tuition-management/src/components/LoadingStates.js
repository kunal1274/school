'use client';

// Loading Spinner Component
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-orange-500 ${sizeClasses[size]} ${className}`}></div>
  );
}

// Loading Overlay Component
export function LoadingOverlay({ message = 'Loading...', show = false, className = '' }) {
  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm ${className}`}>
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader Components
export function SkeletonBox({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBox
          key={index}
          className={`h-4 mb-2 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3 text-left">
                  <SkeletonBox className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <SkeletonBox className="h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <div className="flex items-center space-x-4">
        <SkeletonBox className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <SkeletonBox className="h-4 w-32 mb-2" />
          <SkeletonBox className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-4">
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}

// Loading Button Component
export function LoadingButton({ 
  loading = false, 
  children, 
  loadingText = 'Loading...',
  className = '',
  ...props 
}) {
  return (
    <button
      className={`relative ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" className="mr-2" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          {loadingText}
        </span>
      )}
    </button>
  );
}

// Page Loading Component
export function PageLoading({ message = 'Loading page...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}

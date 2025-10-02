'use client';

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  rows = 3,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm resize-vertical ${
          error
            ? 'border-red-300 text-red-900 placeholder-red-300'
            : 'border-gray-300 text-gray-900 placeholder-gray-400'
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

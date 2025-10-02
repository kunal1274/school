'use client';

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = 'Select an option',
  disabled = false,
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
          error
            ? 'border-red-300 text-red-900'
            : 'border-gray-300 text-gray-900'
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

export default function SearchAndFilter({ 
  onSearchChange, 
  onFilterChange, 
  searchPlaceholder = "Search...",
  filters = [],
  className = ""
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});

  // Initialize filter values
  useEffect(() => {
    const initialFilters = {};
    filters.forEach(filter => {
      initialFilters[filter.name] = filter.defaultValue || '';
    });
    setFilterValues(initialFilters);
  }, [filters]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilterValues(prev => ({
      ...prev,
      [filterName]: value
    }));
    onFilterChange(filterName, value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    const clearedFilters = {};
    filters.forEach(filter => {
      clearedFilters[filter.name] = filter.defaultValue || '';
    });
    setFilterValues(clearedFilters);
    onSearchChange('');
    filters.forEach(filter => {
      onFilterChange(filter.name, filter.defaultValue || '');
    });
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Filter Dropdowns */}
        {filters.map((filter) => (
          <div key={filter.name} className="min-w-[150px]">
            <select
              value={filterValues[filter.name] || ''}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
            >
              <option value="">{filter.placeholder || `All ${filter.label}s`}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear Filters Button */}
        {(searchTerm || Object.values(filterValues).some(value => value !== '')) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

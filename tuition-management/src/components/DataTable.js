'use client';

import Link from 'next/link';

export default function DataTable({ 
  columns = [], 
  data = [], 
  loading = false,
  emptyMessage = "No data available",
  className = "",
  onRowClick = null
}) {
  if (loading) {
    return (
      <div className={`bg-white shadow rounded-lg ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white shadow rounded-lg ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap ${column.cellClassName || ''}`}
                  >
                    {column.render ? column.render(row, rowIndex) : row[column.key]}
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

// Helper function to create action column
export function createActionColumn(actions = []) {
  return {
    header: 'Actions',
    key: 'actions',
    className: 'text-right',
    cellClassName: 'text-right text-sm font-medium space-x-2',
    render: (row, index) => (
      <div className="flex justify-end space-x-2">
        {actions.map((action, actionIndex) => {
          if (action.type === 'link') {
            return (
              <Link
                key={actionIndex}
                href={action.href(row)}
                className={action.className || 'text-orange-600 hover:text-orange-900'}
              >
                {action.label}
              </Link>
            );
          } else if (action.type === 'button') {
            return (
              <button
                key={actionIndex}
                onClick={() => action.onClick(row, index)}
                className={action.className || 'text-orange-600 hover:text-orange-900'}
              >
                {action.label}
              </button>
            );
          } else if (action.type === 'component') {
            return action.component(row, index);
          }
          return null;
        })}
      </div>
    )
  };
}

// Helper function to create status column
export function createStatusColumn(key = 'status', options = {}) {
  const {
    label = 'Status',
    className = '',
    cellClassName = '',
    statusMap = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', className: 'bg-red-100 text-red-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800' }
    }
  } = options;

  return {
    header: label,
    key: key,
    className: className,
    cellClassName: cellClassName,
    render: (row) => {
      const status = row[key];
      const statusConfig = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
      
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.className}`}>
          {statusConfig.label}
        </span>
      );
    }
  };
}

'use client';

import { useState } from 'react';
import { useConfirmationDialog } from './CustomDialog';

export default function BulkOperations({ 
  selectedItems = [], 
  onBulkDelete = null,
  onBulkExport = null,
  onSelectAll = null,
  totalItems = 0,
  className = ""
}) {
  const { confirm, DialogComponent } = useConfirmationDialog();
  const [showExportOptions, setShowExportOptions] = useState(false);

  const selectedCount = selectedItems.length;
  const isAllSelected = selectedCount === totalItems && totalItems > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalItems;

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(!isAllSelected);
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;

    const confirmed = await confirm(
      'Delete Selected Items',
      `Are you sure you want to delete ${selectedCount} selected item(s)? This action cannot be undone.`,
      'warning'
    );

    if (confirmed) {
      onBulkDelete(selectedItems);
    }
  };

  const handleBulkExport = (format) => {
    if (onBulkExport) {
      onBulkExport(selectedItems, format);
    }
    setShowExportOptions(false);
  };

  if (selectedCount === 0) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={input => {
              if (input) input.indeterminate = isPartiallySelected;
            }}
            onChange={handleSelectAll}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            {isAllSelected ? 'Deselect All' : 'Select All'} ({totalItems})
          </label>
        </div>
        <div className="text-sm text-gray-500">
          Select items to perform bulk operations
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = isPartiallySelected;
                }}
                onChange={handleSelectAll}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-orange-800">
                {selectedCount} item(s) selected
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Export Options */}
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Export ({selectedCount})
              </button>
              
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleBulkExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleBulkExport('json')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleBulkExport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as PDF
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Delete */}
            {onBulkDelete && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete ({selectedCount})
              </button>
            )}

            {/* Clear Selection */}
            <button
              onClick={() => onSelectAll && onSelectAll(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <DialogComponent />
    </>
  );
}

// Hook for managing bulk operations
export function useBulkOperations(initialItems = []) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  const toggleItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const toggleSelectAll = (selectAll = null) => {
    if (selectAll === null) {
      selectAll = !isSelectAll;
    }
    
    setIsSelectAll(selectAll);
    
    if (selectAll) {
      setSelectedItems(initialItems.map(item => item._id || item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setIsSelectAll(false);
  };

  const isItemSelected = (itemId) => {
    return selectedItems.includes(itemId);
  };

  return {
    selectedItems,
    isSelectAll,
    toggleItem,
    toggleSelectAll,
    clearSelection,
    isItemSelected,
    selectedCount: selectedItems.length
  };
}

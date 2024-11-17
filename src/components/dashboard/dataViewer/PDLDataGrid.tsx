import React from 'react';
import { PDLRecord } from '../../../types/pdl';
import { useDataTable } from '../../../hooks/useDataTable';
import { DataTable } from './DataTable';
import { DataFilters } from './DataFilters';
import { DataPagination } from './DataPagination';
import { formatDistanceToNow } from 'date-fns';

interface PDLDataGridProps {
  data: PDLRecord[];
  isLoading: boolean;
}

export const PDLDataGrid: React.FC<PDLDataGridProps> = ({ data, isLoading }) => {
  const columns = [
    { key: 'full_name', label: 'Name', sortable: true },
    { key: 'job_title', label: 'Title', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'location_name', label: 'Location', sortable: true },
    { key: 'industry', label: 'Industry', sortable: true },
    {
      key: 'match_score',
      label: 'Match Score',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center">
          <div className="flex-1 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-indigo-600 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {value}%
          </span>
        </div>
      )
    }
  ];

  const {
    currentPage,
    totalPages,
    sortConfig,
    filters,
    data: paginatedData,
    handleSort,
    handleFilterChange,
    clearFilters,
    setCurrentPage
  } = useDataTable({
    data,
    pageSize: 10,
    initialSort: { key: 'match_score', direction: 'desc' }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <DataTable
        data={paginatedData}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
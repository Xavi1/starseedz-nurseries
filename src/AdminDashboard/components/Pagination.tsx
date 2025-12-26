import React from 'react';
import { ChevronRightIcon } from 'lucide-react';

interface Props {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ currentPage, totalItems, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);

  let pageNumbers: (number | string)[] = [];
  if (totalPages <= 5) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    if (currentPage <= 3) {
      pageNumbers = [1, 2, 3, 4, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pageNumbers = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 mr-4">
        Showing <span className="font-medium">{totalItems === 0 ? 0 : startIdx + 1}</span> to{' '}
        <span className="font-medium">{endIdx}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </span>
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="sr-only">Previous</span>
          <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
        </button>
        {pageNumbers.map((num, idx) => (
          typeof num === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(num)}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${num === currentPage ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
            >
              {num}
            </button>
          ) : (
            <span key={idx} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400 select-none">…</span>
          )
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="sr-only">Next</span>
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
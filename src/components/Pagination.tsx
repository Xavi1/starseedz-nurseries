import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    // Always show first page
    pages.push(1);
    // Current page and neighbors
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (pages[pages.length - 1] !== i - 1) {
        pages.push(-1); // Indicator for ellipsis
      }
      pages.push(i);
    }
    // Last page
    if (totalPages > 1) {
      if (pages[pages.length - 1] !== totalPages - 1) {
        pages.push(-1); // Indicator for ellipsis
      }
      pages.push(totalPages);
    }
    return pages;
  };
  return <nav className="flex items-center justify-center">
      <ul className="flex items-center space-x-1">
        {/* Previous button */}
        <li>
          <button onClick={() => currentPage > 1 && onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-md flex items-center justify-center ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`} aria-label="Previous page">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        </li>
        {/* Page numbers */}
        {getPageNumbers().map((page, index) => <li key={index}>
            {page === -1 ? <span className="px-3 py-2 text-gray-500">...</span> : <button onClick={() => onPageChange(page)} className={`w-10 h-10 rounded-md flex items-center justify-center ${currentPage === page ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                {page}
              </button>}
          </li>)}
        {/* Next button */}
        <li>
          <button onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-md flex items-center justify-center ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`} aria-label="Next page">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </li>
      </ul>
    </nav>;
};
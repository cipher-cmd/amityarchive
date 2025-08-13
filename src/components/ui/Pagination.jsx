import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems); // Corrected to use totalItems

  return (
    <div className="flex justify-between items-center mt-8 pt-5 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {startItem}-{endItem} of {totalItems} files
      </div>

      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors duration-200
            ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium min-w-[40px] transition-colors duration-200
              ${page === currentPage
                ? 'bg-primary-600 text-white border-primary-600'
                : page === '...'
                ? 'bg-white text-gray-400 cursor-default'
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              ${page === '...' || page === currentPage ? 'cursor-default' : 'cursor-pointer'}
            `}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages} // Corrected to use totalPages
          className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors duration-200
            ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

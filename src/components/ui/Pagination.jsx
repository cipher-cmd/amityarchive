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
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '30px',
        padding: '20px 0',
        borderTop: '1px solid #ecf0f1',
      }}
    >
      <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
        Showing {startItem}-{endItem} of {totalItems} files
      </div>

      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
            color: currentPage === 1 ? '#bdc3c7' : '#2c3e50',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              backgroundColor: page === currentPage ? '#3498db' : 'white',
              color:
                page === currentPage
                  ? 'white'
                  : page === '...'
                  ? '#bdc3c7'
                  : '#2c3e50',
              borderRadius: '4px',
              cursor:
                page === '...' || page === currentPage ? 'default' : 'pointer',
              fontSize: '14px',
              minWidth: '40px',
            }}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
            color: currentPage === totalPages ? '#bdc3c7' : '#2c3e50',
            borderRadius: '4px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

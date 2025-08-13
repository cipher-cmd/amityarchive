import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFilesByField, deleteFile } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const YearPage = () => {
  const { year } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const fetchYearFiles = async () => {
    setLoading(true);
    try {
      const fileData = await getFilesByField('year', year);
      setFiles(fileData);
    } catch (error) {
      console.error('Error fetching year files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYearFiles();
  }, [year]);

  const handleDelete = async (fileToDelete) => {
    if (
      window.confirm(`Are you sure you want to delete "${fileToDelete.title}"?`)
    ) {
      try {
        await deleteFile(fileToDelete.id, fileToDelete.fileName);
        setFiles(files.filter((file) => file.id !== fileToDelete.id));
        showToast('File deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting file:', error);
        showToast('Failed to delete file.', 'error');
      }
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-lg shadow-md animate-pulse"
        >
          <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
        Files from: <span className="text-cyan-600">{year}</span>
      </h2>

      {loading ? (
        renderSkeleton() // Render skeleton when loading
      ) : files.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">
            No files are available for this year yet.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Please check back later or upload a file if you are an admin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {files.map((file) => (
            <div
              key={file.id}
              className="group relative bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="p-6 flex-grow">
                {currentUser && (
                  <button
                    onClick={() => handleDelete(file)}
                    className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                  {file.title}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-800">Course:</span>{' '}
                    {file.subject || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-800">Domain:</span>{' '}
                    {file.domain || 'N/A'}
                  </p>
                </div>
              </div>
              <a
                href={file.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-cyan-500 text-white font-bold py-3 px-4 hover:bg-cyan-700 transition-colors duration-300 mt-auto"
              >
                Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YearPage;

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.config';
import { useToast } from '../../context/ToastContext';

// A helper function to format the date unambiguously
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) {
    return 'Date not available';
  }
  return timestamp.toDate().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const RecentlyAdded = () => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchRecentFiles = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'files'),
          orderBy('uploadedAt', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentFiles(files);
      } catch (error) {
        showToast('Error fetching recent files.', 'error');
        console.error('Error fetching recent files:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentFiles();
  }, []);

  // This function will handle the click event on a card
  const handleFileClick = (file) => {
    if (file.downloadUrl) {
      window.open(file.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <aside className="w-full lg:w-80 bg-white p-6 rounded-lg shadow-md h-fit">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recently Added
      </h3>
      {loading ? (
        renderSkeleton()
      ) : (
        <div className="flex flex-col gap-3">
          {recentFiles.length === 0 ? (
            <p className="text-sm text-gray-500">No files uploaded yet.</p>
          ) : (
            recentFiles.map((file) => (
              // Added an onClick handler to the main div of the card
              <div
                key={file.id}
                className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:border-blue-500/50 transition-colors cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                <div className="mb-2">
                  <h4 className="text-base font-semibold leading-none tracking-tight truncate">
                    {file.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {file.subject || 'General'} • {file.year || 'N/A'}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  Added on {formatDate(file.uploadedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
};

export default RecentlyAdded;

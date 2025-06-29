import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.config';

const RecentlyAdded = () => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const fetchRecentFiles = async () => {
    try {
      const q = query(
        collection(db, 'files'),
        orderBy('uploadedAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const files = [];
      querySnapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() });
      });

      setRecentFiles(files);
    } catch (error) {
      console.error('Error fetching recent files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <aside className="recently-added">
        <h3>Recently Added</h3>
        <div className="loading">Loading...</div>
      </aside>
    );
  }

  return (
    <aside className="recently-added">
      <h3>Recently Added</h3>
      <div className="recent-files-list">
        {recentFiles.length === 0 ? (
          <p>No files uploaded yet</p>
        ) : (
          recentFiles.map((file) => (
            <div key={file.id} className="recent-file-item">
              <div className="file-info">
                <h4>{file.title}</h4>
                <p>
                  {file.subject} - {file.year}
                </p>
                <small>
                  {new Date(file.uploadedAt?.toDate()).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default RecentlyAdded;

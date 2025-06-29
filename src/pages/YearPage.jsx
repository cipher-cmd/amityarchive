import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFilesByYear } from '../services/database';

const YearPage = () => {
  const { year } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYearFiles();
  }, [year]);

  const fetchYearFiles = async () => {
    try {
      const fileData = await getFilesByYear(year);
      setFiles(fileData);
    } catch (error) {
      console.error('Error fetching year files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading files...</div>;

  return (
    <div className="year-page">
      <h2>{year} Files</h2>
      {files.length === 0 ? (
        <p>No files available for {year} yet.</p>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <h3>{file.title}</h3>
              <p>Subject: {file.subject}</p>
              <p>Domain: {file.domain}</p>
              <a
                href={file.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
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

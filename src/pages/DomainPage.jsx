import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFilesByDomain } from '../services/database';

const DomainPage = () => {
  const { domainId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDomainFiles();
  }, [domainId]);

  const fetchDomainFiles = async () => {
    try {
      const fileData = await getFilesByDomain(domainId.toUpperCase());
      setFiles(fileData);
    } catch (error) {
      console.error('Error fetching domain files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading files...</div>;

  return (
    <div className="domain-page">
      <h2>{domainId.toUpperCase()} Domain Files</h2>
      {files.length === 0 ? (
        <p>No files available for this domain yet.</p>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <h3>{file.title}</h3>
              <p>Subject: {file.subject}</p>
              <p>Year: {file.year}</p>
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

export default DomainPage;

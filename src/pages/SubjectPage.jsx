import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFilesBySubject } from '../services/database';

const SubjectPage = () => {
  const { subjectId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectFiles();
  }, [subjectId]);

  const fetchSubjectFiles = async () => {
    try {
      const subjectName = subjectId.replace(/-/g, ' ');
      const fileData = await getFilesBySubject(subjectName);
      setFiles(fileData);
    } catch (error) {
      console.error('Error fetching subject files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading files...</div>;

  return (
    <div className="subject-page">
      <h2>{subjectId.replace(/-/g, ' ').toUpperCase()} Files</h2>
      {files.length === 0 ? (
        <p>No files available for this subject yet.</p>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <h3>{file.title}</h3>
              <p>Year: {file.year}</p>
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

export default SubjectPage;

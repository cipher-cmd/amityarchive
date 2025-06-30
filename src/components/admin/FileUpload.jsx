import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase.config';
import { addFile } from '../../services/database';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Applied Science',
    domain: 'ASET',
    year: '2024',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  const subjects = [
    'Applied Science',
    'Commerce',
    'Computer Science/IT',
    'Engineering',
    'English Literature',
    'Fashion',
    'Management',
    'Skill Development',
    'Social Science',
    'Finance',
    'Psychology & Behavioural Science',
    'Pharmacy',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.title.trim()) {
      alert('Please fill in all fields and select a file');
      return;
    }

    // File size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert('File size exceeds the 10MB limit');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `files/${fileName}`);

      // Create upload task with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          alert(`Upload failed: ${error.message}`);
          setUploading(false);
          setUploadProgress(0);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save file info to Firestore
            await addFile({
              ...formData,
              titleLowerCase: formData.title.toLowerCase(),
              downloadUrl: downloadURL,
              fileName: file.name,
              fileSize: file.size,
            });

            alert('File uploaded successfully!');

            // Reset form
            setFile(null);
            setFormData({
              title: '',
              subject: 'Applied Science',
              domain: 'ASET',
              year: '2024',
            });
            setUploadProgress(0);
            setShowUpload(false);

            if (onUploadSuccess) onUploadSuccess();
          } catch (error) {
            console.error('Database save error:', error);
            alert(`Failed to save file info: ${error.message}`);
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload initialization error:', error);
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!showUpload) {
    return (
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          + Upload New File
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '2px solid #e9ecef',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ color: '#2c3e50', margin: 0 }}>Upload New File</h3>
        <button
          onClick={() => {
            setShowUpload(false);
            setUploadProgress(0);
          }}
          style={{
            padding: '5px 10px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px',
            }}
          >
            <span style={{ fontSize: '14px', color: '#2c3e50' }}>
              Upload Progress
            </span>
            <span style={{ fontSize: '14px', color: '#2c3e50' }}>
              {uploadProgress}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#ecf0f1',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#3498db',
                transition: 'width 0.3s ease',
                borderRadius: '4px',
              }}
            ></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#2c3e50',
            }}
          >
            File Title *
          </label>
          <input
            type="text"
            placeholder="e.g., Data Structures Mid-Term Exam 2024"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            required
            disabled={uploading}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '15px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#2c3e50',
              }}
            >
              Subject *
            </label>
            <select
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              required
              disabled={uploading}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#2c3e50',
              }}
            >
              Domain *
            </label>
            <select
              value={formData.domain}
              onChange={(e) =>
                setFormData({ ...formData, domain: e.target.value })
              }
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              required
              disabled={uploading}
            >
              <option value="ALLIED">ALLIED</option>
              <option value="ASET">ASET</option>
              <option value="MGMT">MGMT</option>
              <option value="DIP">DIP</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#2c3e50',
              }}
            >
              Year *
            </label>
            <select
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              required
              disabled={uploading}
            >
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#2c3e50',
            }}
          >
            Select PDF File *
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            required
            disabled={uploading}
          />
          {file && (
            <p style={{ marginTop: '5px', fontSize: '12px', color: '#7f8c8d' }}>
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || !file || !formData.title.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: uploading ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {uploading ? `Uploading... ${uploadProgress}%` : 'Upload File'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;

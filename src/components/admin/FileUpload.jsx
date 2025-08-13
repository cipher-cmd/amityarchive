import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase.config';
import { addFile } from '../../services/database';
import { COURSES, DOMAINS, YEARS } from '../../constants';
import { useToast } from '../../context/ToastContext';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  // Default the dropdowns to empty strings
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    domain: '',
    year: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const labelClasses = 'block mb-2 text-sm font-semibold text-gray-700';
  const inputClasses =
    'w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.title.trim()) {
      showToast('Please fill in the title and select a file.', 'error');
      return;
    }
    // ... (rest of the validation logic) ...
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `files/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (uploadError) => {
          console.error('Upload error:', uploadError);
          showToast(`Upload failed: ${uploadError.message}`, 'error');
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await addFile({
              ...formData,
              titleLowerCase: formData.title.toLowerCase(),
              downloadUrl: downloadURL,
              fileName: file.name,
              fileSize: file.size,
            });

            showToast('File uploaded successfully!', 'success');
            setFile(null);
            setFormData({
              title: '',
              subject: '',
              domain: '',
              year: '',
            });
            setShowUpload(false);
            if (onUploadSuccess) onUploadSuccess();
          } catch (dbError) {
            console.error('Database save error:', dbError);
            showToast(`Failed to save file info: ${dbError.message}`, 'error');
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (initError) {
      console.error('Upload initialization error:', initError);
      showToast(`Upload failed: ${initError.message}`, 'error');
      setUploading(false);
    }
  };

  if (!showUpload) {
    return (
      <div className="text-center mb-8">
        <button
          onClick={() => setShowUpload(true)}
          className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          + Upload New File
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Upload New File</h3>
        <button
          onClick={() => setShowUpload(false)}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          &times;
        </button>
      </div>

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </p>
      )}

      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-semibold text-primary-700">
              Upload Progress
            </span>
            <span className="text-sm font-semibold text-primary-700">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className={labelClasses}>
            File Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Data Structures Mid-Term Exam"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className={inputClasses}
            required
            disabled={uploading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="course" className={labelClasses}>
              Course (Optional)
            </label>
            <select
              id="course"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className={inputClasses}
              disabled={uploading}
            >
              <option value="">Select a Course</option>
              {COURSES.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="domain" className={labelClasses}>
              Domain (Optional)
            </label>
            <select
              id="domain"
              value={formData.domain}
              onChange={(e) =>
                setFormData({ ...formData, domain: e.target.value })
              }
              className={inputClasses}
              disabled={uploading}
            >
              <option value="">Select a Domain</option>
              {DOMAINS.map((domain) => (
                <option key={domain.name} value={domain.name}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className={labelClasses}>
              Year (Optional)
            </label>
            <select
              id="year"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              className={inputClasses}
              disabled={uploading}
            >
              <option value="">Select a Year</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="file" className={labelClasses}>
            Select PDF File *
          </label>
          <input
            id="file"
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100`}
            required
            disabled={uploading}
          />
          {file && (
            <p className="mt-2 text-xs text-gray-500">Selected: {file.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || !file || !formData.title.trim()}
          className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? `Uploading... ${uploadProgress}%` : 'Upload File'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;

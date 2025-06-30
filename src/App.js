import React, { useState, useEffect } from 'react';
import {
  getFilesBySubject,
  getFilesByDomain,
  getFilesByYear,
  searchFiles,
  getRecentFiles,
  deleteFile,
  getTotalFileCount,
} from './services/database';
import FileUpload from './components/admin/FileUpload';
import Toast from './components/ui/Toast';
import SearchBar from './components/ui/SearchBar';
import Pagination from './components/ui/Pagination';
import ErrorBoundary from './components/ui/ErrorBoundary';

function App() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const ITEMS_PER_PAGE = 6;
  const ADMIN_PASSWORD = '@mity@rchive';

  // Check for admin session on component mount
  useEffect(() => {
    const adminSession = localStorage.getItem('amityAdminAuth');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // Load recent files and total count on component mount
  useEffect(() => {
    loadRecentFiles();
    loadTotalCount();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const loadTotalCount = async () => {
    try {
      const count = await getTotalFileCount();
      setTotalFiles(count);
    } catch (error) {
      console.error('Error loading total count:', error);
    }
  };

  const loadRecentFiles = async () => {
    try {
      const recent = await getRecentFiles(5);
      setRecentFiles(recent);
    } catch (error) {
      console.error('Error loading recent files:', error);
      showToast('Error loading recent files', 'error');
    }
  };

  // Admin authentication functions
  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('amityAdminAuth', 'true');
      setShowAdminLogin(false);
      setAdminPassword('');
      showToast('Admin access granted!', 'success');
    } else {
      showToast('Invalid admin password', 'error');
      setAdminPassword('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('amityAdminAuth');
    showToast('Admin logged out', 'info');
  };

  const handleUploadSuccess = () => {
    loadRecentFiles();
    loadTotalCount();
    showToast('File uploaded successfully!', 'success');

    // Refresh current view if any filter is active
    if (selectedSubject) handleSubjectClick(selectedSubject);
    if (selectedDomain) handleDomainClick(selectedDomain);
    if (selectedYear) handleYearClick(selectedYear);
  };

  const handleDeleteFile = async (fileId, downloadUrl, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await deleteFile(fileId, downloadUrl);
        showToast('File deleted successfully!', 'success');

        // Refresh the current view
        loadRecentFiles();
        loadTotalCount();
        if (selectedSubject) handleSubjectClick(selectedSubject);
        if (selectedDomain) handleDomainClick(selectedDomain);
        if (selectedYear) handleYearClick(selectedYear);
        if (isSearchMode)
          handleSearchResults(files.filter((f) => f.id !== fileId));
      } catch (error) {
        showToast('Error deleting file', 'error');
      }
    }
  };

  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    setIsSearchMode(false);
    setSelectedDomain('');
    setSelectedYear('');
    setCurrentPage(1);
    setLoading(true);

    try {
      const subjectFiles = await getFilesBySubject(subject);
      setFiles(subjectFiles);
      showToast(`Found ${subjectFiles.length} files for ${subject}`, 'info');
    } catch (error) {
      console.error('Error loading subject files:', error);
      setFiles([]);
      showToast('Error loading subject files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDomainClick = async (domain) => {
    setSelectedDomain(domain);
    setIsSearchMode(false);
    setSelectedSubject('');
    setSelectedYear('');
    setCurrentPage(1);
    setLoading(true);

    try {
      const domainFiles = await getFilesByDomain(domain);
      setFiles(domainFiles);
      showToast(
        `Found ${domainFiles.length} files for ${domain} domain`,
        'info'
      );
    } catch (error) {
      console.error('Error loading domain files:', error);
      setFiles([]);
      showToast('Error loading domain files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleYearClick = async (year) => {
    setSelectedYear(year);
    setIsSearchMode(false);
    setSelectedSubject('');
    setSelectedDomain('');
    setCurrentPage(1);
    setLoading(true);

    try {
      const yearFiles = await getFilesByYear(year);
      setFiles(yearFiles);
      showToast(`Found ${yearFiles.length} files for ${year}`, 'info');
    } catch (error) {
      console.error('Error loading year files:', error);
      setFiles([]);
      showToast('Error loading year files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResults = (results) => {
    setFiles(results);
    setIsSearchMode(true);
    setSelectedSubject('');
    setSelectedDomain('');
    setSelectedYear('');
    setCurrentPage(1);
    showToast(`Found ${results.length} search results`, 'info');
  };

  const clearSelection = () => {
    setSelectedSubject('');
    setSelectedDomain('');
    setSelectedYear('');
    setFiles([]);
    setIsSearchMode(false);
    setCurrentPage(1);
    setSearchTerm('');
    showToast('Selection cleared', 'info');
  };

  // Pagination logic
  const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFiles = files.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000,
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                width: '300px',
                textAlign: 'center',
              }}
            >
              <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                Admin Access Required
              </h3>
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleAdminLogin}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
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
            </div>
          </div>
        )}

        {/* Header */}
        <header
          style={{
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}></div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0 }}>AmityArchive</h1>
              <p
                style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8 }}
              >
                Total Files: {totalFiles} | Currently Showing: {files.length}
              </p>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              {isAdmin ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      backgroundColor: '#27ae60',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    Admin Mode
                  </span>
                  <button
                    onClick={handleAdminLogout}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#34495e',
                    color: 'white',
                    border: '1px solid #7f8c8d',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
          {/* Left Sidebar - Subjects */}
          <aside
            style={{
              width: '250px',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              height: 'fit-content',
            }}
          >
            <div>
              <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                Subjects
              </h3>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                {[
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
                ].map((subject) => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectClick(subject)}
                    style={{
                      padding: '10px',
                      backgroundColor:
                        selectedSubject === subject ? '#3498db' : '#ecf0f1',
                      color: selectedSubject === subject ? 'white' : '#2c3e50',
                      border: 'none',
                      borderRadius: '5px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSubject !== subject) {
                        e.target.style.backgroundColor = '#d5dbdb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSubject !== subject) {
                        e.target.style.backgroundColor = '#ecf0f1';
                      }
                    }}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main
            style={{
              flex: 1,
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <h2 style={{ color: '#2c3e50', margin: 0 }}>
                Welcome to AmityArchive
              </h2>
              {(selectedSubject ||
                selectedDomain ||
                selectedYear ||
                isSearchMode) && (
                <button
                  onClick={clearSelection}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Clear Selection
                </button>
              )}
            </div>
            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
              Your comprehensive resource for past exam papers and study
              materials
            </p>

            {/* File Upload Component - Only show for admins */}
            {isAdmin && <FileUpload onUploadSuccess={handleUploadSuccess} />}

            {/* Enhanced Search Bar */}
            <SearchBar
              onSearchResults={handleSearchResults}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            {/* Files Display Area */}
            <div style={{ flex: 1, marginBottom: '30px' }}>
              {loading ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#7f8c8d',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #ecf0f1',
                      borderTop: '4px solid #3498db',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 20px',
                    }}
                  ></div>
                  <p>Loading files...</p>
                </div>
              ) : files.length > 0 ? (
                <div>
                  <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
                    {selectedSubject &&
                      `${selectedSubject} Files (${files.length})`}
                    {selectedDomain &&
                      `${selectedDomain} Domain Files (${files.length})`}
                    {selectedYear && `${selectedYear} Files (${files.length})`}
                    {isSearchMode && `Search Results (${files.length})`}
                  </h3>

                  {/* File Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '20px',
                    }}
                  >
                    {currentFiles.map((file) => (
                      <div
                        key={file.id}
                        style={{
                          backgroundColor: '#f8f9fa',
                          padding: '20px',
                          borderRadius: '8px',
                          borderLeft: '4px solid #3498db',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s ease',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = 'translateY(-2px)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = 'translateY(0)')
                        }
                      >
                        {/* Delete Button - Only show for admins */}
                        {isAdmin && (
                          <button
                            onClick={() =>
                              handleDeleteFile(
                                file.id,
                                file.downloadUrl,
                                file.title
                              )
                            }
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '25px',
                              height: '25px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ×
                          </button>
                        )}

                        <h4
                          style={{
                            margin: '0 0 10px 0',
                            color: '#2c3e50',
                            paddingRight: isAdmin ? '30px' : '0',
                          }}
                        >
                          {file.title}
                        </h4>
                        <p
                          style={{
                            margin: '0 0 5px 0',
                            color: '#7f8c8d',
                            fontSize: '14px',
                          }}
                        >
                          Subject: {file.subject}
                        </p>
                        <p
                          style={{
                            margin: '0 0 5px 0',
                            color: '#7f8c8d',
                            fontSize: '14px',
                          }}
                        >
                          Domain: {file.domain}
                        </p>
                        <p
                          style={{
                            margin: '0 0 15px 0',
                            color: '#7f8c8d',
                            fontSize: '14px',
                          }}
                        >
                          Year: {file.year}
                        </p>
                        {file.downloadUrl && (
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              padding: '8px 16px',
                              backgroundColor: '#3498db',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '4px',
                              fontSize: '14px',
                              transition: 'background-color 0.3s ease',
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.backgroundColor = '#2980b9')
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.backgroundColor = '#3498db')
                            }
                          >
                            📄 Download PDF
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={files.length}
                  />
                </div>
              ) : selectedSubject ||
                selectedDomain ||
                selectedYear ||
                isSearchMode ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#7f8c8d',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                    📚
                  </div>
                  <p>No files found for the selected criteria.</p>
                  <p>
                    Files will appear here once they are uploaded to the
                    database.
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#7f8c8d' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                    🎓
                  </div>
                  <p>
                    Select a subject, domain, or year from the options to browse
                    files
                  </p>
                  <p>Or use the search bar to find specific materials</p>
                </div>
              )}
            </div>

            {/* Domain and Year sections */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: '30px',
                borderTop: '1px solid #ecf0f1',
                gap: '30px',
              }}
            >
              {/* Domain Section */}
              <div>
                <h3
                  style={{
                    color: '#2c3e50',
                    marginBottom: '15px',
                    textAlign: 'center',
                  }}
                >
                  Domain
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                  }}
                >
                  {['ALLIED', 'ASET', 'MGMT', 'DIP'].map((domain) => (
                    <button
                      key={domain}
                      onClick={() => handleDomainClick(domain)}
                      style={{
                        padding: '12px 20px',
                        backgroundColor:
                          selectedDomain === domain ? '#2980b9' : '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Section */}
              <div>
                <h3
                  style={{
                    color: '#2c3e50',
                    marginBottom: '15px',
                    textAlign: 'center',
                  }}
                >
                  Year
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                  }}
                >
                  {['2022', '2023', '2024', '2025'].map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearClick(year)}
                      style={{
                        padding: '12px 20px',
                        backgroundColor:
                          selectedYear === year ? '#2980b9' : '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar - Recently Added */}
          <aside
            style={{
              width: '300px',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              height: 'fit-content',
            }}
          >
            <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
              Recently Added
            </h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              {recentFiles.length > 0 ? (
                recentFiles.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      borderLeft: '4px solid #3498db',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = 'translateX(5px)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = 'translateX(0)')
                    }
                  >
                    <h4
                      style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#2c3e50',
                      }}
                    >
                      {file.title}
                    </h4>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '12px',
                        color: '#7f8c8d',
                      }}
                    >
                      {file.subject} - {file.year}
                    </p>
                    <small style={{ fontSize: '11px', color: '#95a5a6' }}>
                      {file.uploadedAt
                        ? new Date(
                            file.uploadedAt.toDate()
                          ).toLocaleDateString()
                        : 'Recently'}
                    </small>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#7f8c8d',
                    fontSize: '14px',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    📁
                  </div>
                  <p>No files uploaded yet</p>
                  <p style={{ fontSize: '12px' }}>
                    Upload your first file to get started!
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Add CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}

export default App;

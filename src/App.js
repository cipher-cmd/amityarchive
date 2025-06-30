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

  // Mobile responsive state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    setIsMobileMenuOpen(false); // Close mobile menu

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
      <div className="min-h-screen bg-gray-50 font-sans">
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
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl w-80 text-center shadow-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Admin Access Required
              </h3>
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ FIXED: Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* ✅ MODIFIED: Header with integrated mobile menu button */}
        <header className="bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-lg">
          <div className="flex justify-between items-center px-6 py-5">
            {/* ✅ NEW: Left side with mobile menu button */}
            <div className="flex-1 flex justify-start">
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {/* ✅ NEW: Animated hamburger icon */}
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span
                    className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                      isMobileMenuOpen
                        ? 'rotate-45 translate-y-1'
                        : '-translate-y-0.5'
                    }`}
                  ></span>
                  <span
                    className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                      isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  ></span>
                  <span
                    className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                      isMobileMenuOpen
                        ? '-rotate-45 -translate-y-1'
                        : 'translate-y-0.5'
                    }`}
                  ></span>
                </div>
              </button>
            </div>

            {/* Center title */}
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold mb-1">AmityArchive</h1>
              <p className="text-sm text-primary-100 opacity-90">
                Total Files: {totalFiles} | Currently Showing: {files.length}
              </p>
            </div>

            {/* Right side admin */}
            <div className="flex-1 flex justify-end">
              {isAdmin ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-success px-3 py-1 rounded-full font-medium">
                    Admin Mode
                  </span>
                  <button
                    onClick={handleAdminLogout}
                    className="bg-danger hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-2 py-1 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 border border-primary-500"
                >
                  <span className="hidden sm:inline">Admin Login</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex">
          {/* ✅ MODIFIED: Left Sidebar - Responsive */}
          <aside
            className={`
            fixed lg:relative
            top-0 left-0
            w-64 lg:w-64
            h-full lg:h-auto
            bg-white
            p-5 lg:p-5
            rounded-none lg:rounded-lg
            shadow-2xl lg:shadow-md
            z-50 lg:z-auto
            transform transition-transform duration-300 ease-in-out
            lg:m-5 lg:mt-5
            ${
              isMobileMenuOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0'
            }
          `}
          >
            {/* ✅ MODIFIED: Close button for mobile */}
            <div className="lg:hidden flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <span className="text-xl text-gray-600">×</span>
              </button>
            </div>

            <div>
              <h3 className="text-primary-700 font-semibold mb-4 text-lg">
                Subjects
              </h3>
              <div className="space-y-2">
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
                    className={`
                      w-full p-3 rounded-lg text-left font-medium transition-all duration-200
                      ${
                        selectedSubject === subject
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600 hover:translate-x-1'
                      }
                    `}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white m-5 p-6 lg:p-12 rounded-lg shadow-md flex flex-col">
            {/* ✅ REMOVED: Mobile padding - no longer needed */}

            {/* Header Section - Larger and center aligned */}
            <div className="text-left lg:text-center mb-12 max-w-4xl mx-auto w-full">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-800 lg:flex-1 leading-tight">
                  Welcome to AmityArchive
                </h2>
                {(selectedSubject ||
                  selectedDomain ||
                  selectedYear ||
                  isSearchMode) && (
                  <button
                    onClick={clearSelection}
                    className="bg-danger hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 lg:absolute lg:top-6 lg:right-12"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-lg lg:text-xl mb-12 leading-relaxed max-w-3xl mx-auto">
                Your comprehensive resource for past exam papers and study
                materials
              </p>

              {/* File Upload Component - Only show for admins - Center aligned */}
              <div className="flex justify-center mb-8">
                {isAdmin && (
                  <FileUpload onUploadSuccess={handleUploadSuccess} />
                )}
              </div>

              {/* Enhanced Search Bar - Larger and center aligned */}
              <div className="flex justify-center mb-12">
                <div className="w-full max-w-2xl">
                  <SearchBar
                    onSearchResults={handleSearchResults}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-sm text-blue-800">
                <p className="leading-relaxed">
                  <strong>Disclaimer:</strong> Amity Archive is an independent,
                  student-run website created for educational purposes. It is
                  not affiliated with or endorsed by Amity University or any of
                  its departments. The materials available on this site are for
                  the benefit of students and alumni and are intended for
                  non-commercial use.
                </p>
              </div>
            </div>

            {/* Files Display Area */}
            <div className="flex-1 mb-8">
              {loading ? (
                <div className="text-center py-24 text-gray-500">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-lg">Loading files...</p>
                </div>
              ) : files.length > 0 ? (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
                    {selectedSubject &&
                      `${selectedSubject} Files (${files.length})`}
                    {selectedDomain &&
                      `${selectedDomain} Domain Files (${files.length})`}
                    {selectedYear && `${selectedYear} Files (${files.length})`}
                    {isSearchMode && `Search Results (${files.length})`}
                  </h3>

                  {/* File Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {currentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 relative hover:-translate-y-2"
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
                            className="absolute -top-2 -right-2 w-8 h-8 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                          >
                            ×
                          </button>
                        )}

                        <h4 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                          {file.title}
                        </h4>

                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Subject:</span>{' '}
                            {file.subject}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Domain:</span>{' '}
                            {file.domain}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Year:</span>{' '}
                            {file.year}
                          </p>
                        </div>

                        {file.downloadUrl && (
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full text-center inline-block"
                          >
                            📄 Download PDF
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={files.length}
                    />
                  </div>
                </div>
              ) : selectedSubject ||
                selectedDomain ||
                selectedYear ||
                isSearchMode ? (
                <div className="text-center py-24 text-gray-500">
                  <div className="text-8xl mb-8">📚</div>
                  <p className="text-xl mb-4">
                    No files found for the selected criteria.
                  </p>
                  <p className="text-lg">
                    Files will appear here once they are uploaded to the
                    database.
                  </p>
                </div>
              ) : (
                <div className="text-center py-24 text-gray-500">
                  <div className="text-8xl mb-8">🎓</div>
                  <p className="text-xl mb-4">
                    Select a subject, domain, or year from the options to browse
                    files
                  </p>
                  <p className="text-lg">
                    Or use the search bar to find specific materials
                  </p>
                </div>
              )}
            </div>

            {/* Domain and Year sections - Larger */}
            <div className="flex flex-col items-center pt-12 border-t border-gray-200 space-y-12 max-w-4xl mx-auto w-full">
              {/* Domain Section */}
              <div className="w-full">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                  Domain
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {['ALLIED', 'ASET', 'MGMT', 'DIP'].map((domain) => (
                    <button
                      key={domain}
                      onClick={() => handleDomainClick(domain)}
                      className={`
                        py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200
                        ${
                          selectedDomain === domain
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-lg'
                        }
                      `}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Section */}
              <div className="w-full">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                  Year
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {['2022', '2023', '2024', '2025'].map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearClick(year)}
                      className={`
                        py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200
                        ${
                          selectedYear === year
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-lg'
                        }
                      `}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar - Hide on mobile, show on larger screens */}
          <aside className="hidden lg:block w-80 bg-white m-5 p-6 rounded-lg shadow-md h-fit">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Recently Added
            </h3>
            <div className="space-y-4">
              {recentFiles.length > 0 ? (
                recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500 cursor-pointer transition-transform duration-200 hover:translate-x-1"
                  >
                    <h4 className="font-medium text-gray-800 text-sm mb-2">
                      {file.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-1">
                      {file.subject} - {file.year}
                    </p>
                    <small className="text-xs text-gray-500">
                      {file.uploadedAt
                        ? new Date(
                            file.uploadedAt.toDate()
                          ).toLocaleDateString()
                        : 'Recently'}
                    </small>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-3">📁</div>
                  <p className="text-sm mb-1">No files uploaded yet</p>
                  <p className="text-xs">
                    Upload your first file to get started!
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
/ /   B u i l d   f i x  
 
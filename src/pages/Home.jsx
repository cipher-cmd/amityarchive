import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import FileUpload from '../components/admin/FileUpload';
import { DOMAINS, YEARS } from '../constants';

// The component accepts the 'setCurrentlyShowing' function as a prop from MainLayout
const Home = ({ setCurrentlyShowing }) => {
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // This effect runs whenever the search results change, updating the counter in the header
  useEffect(() => {
    if (setCurrentlyShowing) {
      setCurrentlyShowing(searchResults.length);
    }
  }, [searchResults, setCurrentlyShowing]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleDomainClick = (domain) => {
    navigate(domain.path);
  };

  const handleYearClick = (year) => {
    navigate(`/year/${year}`);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-200px)]">
      {/* Welcome Section */}
      <div className="text-center w-full max-w-4xl mx-auto mb-8">
        <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
          Find Your Exam Papers in Seconds
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Your comprehensive resource for past exam papers and study materials.
        </p>
      </div>

      {/* File Upload form, only visible to logged-in admins */}
      {currentUser && (
        <div className="w-full max-w-4xl mx-auto mb-12">
          <FileUpload
            onUploadSuccess={() => console.log('Upload successful!')}
          />
        </div>
      )}

      {/* Search Bar Section */}
      <div className="w-full max-w-2xl mb-12">
        <SearchBar onSearchResults={handleSearchResults} />
      </div>

      {/* Domain and Year Sections with vibrant button colors */}
      <div className="w-full max-w-4xl mx-auto space-y-10 mb-12">
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-500">
            Browse by Domain
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DOMAINS.map((domain) => (
              <Button
                key={domain.name}
                title={domain.name}
                onClick={() => handleDomainClick(domain)}
                className="bg-blue-500 text-white text-center hover:bg-blue-600 py-4 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-center text-sm font-medium text-gray-500">
            Browse by Year
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {YEARS.map((year) => (
              <Button
                key={year}
                title={year}
                onClick={() => handleYearClick(year)}
                className="bg-cyan-500 text-white text-center hover:bg-cyan-600 py-4 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      {searchResults.length > 0 && (
        <div className="w-full max-w-6xl">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Search Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((file) => (
              <div
                key={file.id}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {file.title}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {file.subject} - {file.year}
                </p>
                <a
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 font-semibold hover:underline"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

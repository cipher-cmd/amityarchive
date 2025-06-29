import React, { useState } from 'react';
import SearchBar from '../components/ui/SearchBar';
import FirebaseTest from '../components/test/FirebaseTest';

const Home = () => {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h2>Welcome to AmityArchive</h2>
        <p>
          Your comprehensive resource for past exam papers and study materials
        </p>
      </div>
      <FirebaseTest /> {/* Add this line temporarily */}
      <SearchBar onSearchResults={handleSearchResults} />
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <div className="results-grid">
            {searchResults.map((file) => (
              <div key={file.id} className="result-card">
                <h4>{file.title}</h4>
                <p>
                  {file.subject} - {file.year}
                </p>
                <a
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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

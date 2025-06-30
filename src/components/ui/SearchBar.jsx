import React, { useState, useEffect, useRef } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.config';

const SearchBar = ({ onSearchResults, searchTerm, setSearchTerm }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const searchRef = useRef(null);

  // Load all files for autocomplete suggestions (optimize later)
  useEffect(() => {
    const loadAllFiles = async () => {
      try {
        const q = query(collection(db, 'files'), limit(50)); // You might want to fetch files as the user types instead
        const querySnapshot = await getDocs(q);
        const files = [];
        querySnapshot.forEach((doc) => {
          files.push({ id: doc.id, ...doc.data() });
        });
        setAllFiles(files);
        console.log('Loaded files for autocomplete:', files.length);
      } catch (error) {
        console.error('Error loading files for autocomplete:', error);
      }
    };

    loadAllFiles();
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    if (searchTerm && searchTerm.length > 1) {
      const searchLower = searchTerm.toLowerCase();

      // Get title suggestions
      const titleSuggestions = allFiles
        .filter(
          (file) => file.title && file.title.toLowerCase().includes(searchLower)
        )
        .slice(0, 3)
        .map((file) => ({
          text: file.title,
          type: 'title',
          file: file,
        }));

      // Get unique subject suggestions
      const subjectSuggestions = [
        ...new Set(
          allFiles
            .filter(
              (file) =>
                file.subject && file.subject.toLowerCase().includes(searchLower)
            )
            .map((file) => file.subject)
        ),
      ]
        .slice(0, 2)
        .map((subject) => ({
          text: subject,
          type: 'subject',
        }));

      const combinedSuggestions = [...titleSuggestions, ...subjectSuggestions];
      setSuggestions(combinedSuggestions);
      setShowSuggestions(combinedSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, allFiles]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside); // Changed to 'click' instead of 'mousedown' for more reliability
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = async (term = searchTerm) => {
    if (!term || !term.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const searchLower = term.toLowerCase();

      // Filter files based on search term
      const results = allFiles.filter(
        (file) =>
          (file.title && file.title.toLowerCase().includes(searchLower)) ||
          (file.subject && file.subject.toLowerCase().includes(searchLower)) ||
          (file.domain && file.domain.toLowerCase().includes(searchLower)) ||
          (file.titleLowerCase && file.titleLowerCase.includes(searchLower))
      );

      onSearchResults(results);

      // Close suggestions after the search
      setShowSuggestions(false);
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.text);
    handleSearch(suggestion.text); // Trigger search immediately after selecting a suggestion
    setShowSuggestions(false); // Close suggestions on selection
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Show suggestions when typing
    if (value.length > 1) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', marginBottom: '30px' }}>
      <div style={{ display: 'flex', gap: '10px', maxWidth: '600px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search for files, subjects, or domains..."
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() =>
              searchTerm && searchTerm.length > 1 && setShowSuggestions(true)
            }
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ecf0f1',
              borderRadius: '6px',
              fontSize: '16px',
              outline: 'none',
            }}
          />

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderBottom:
                      index < suggestions.length - 1
                        ? '1px solid #f0f0f0'
                        : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'white',
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = '#f8f9fa')
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = 'white')
                  }
                >
                  <span
                    style={{
                      fontSize: '12px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor:
                        suggestion.type === 'title' ? '#3498db' : '#27ae60',
                      color: 'white',
                    }}
                  >
                    {suggestion.type === 'title' ? 'File' : 'Subject'}
                  </span>
                  <span style={{ fontSize: '14px' }}>{suggestion.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => handleSearch()}
          disabled={!searchTerm || !searchTerm.trim() || isSearching}
          style={{
            padding: '12px 24px',
            backgroundColor:
              searchTerm && searchTerm.trim() && !isSearching
                ? '#3498db'
                : '#bdc3c7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor:
              searchTerm && searchTerm.trim() && !isSearching
                ? 'pointer'
                : 'not-allowed',
            fontSize: '16px',
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;

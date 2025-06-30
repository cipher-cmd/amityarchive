import React, { useState, useEffect, useRef } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.config';

const SearchBar = ({ onSearchResults, searchTerm, setSearchTerm }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const searchRef = useRef(null);

  // Load all files for autocomplete suggestions
  useEffect(() => {
    const loadAllFiles = async () => {
      try {
        const q = query(collection(db, 'files'), limit(100));
        const querySnapshot = await getDocs(q);
        const files = [];
        querySnapshot.forEach((doc) => {
          files.push({ id: doc.id, ...doc.data() });
        });
        setAllFiles(files);
      } catch (error) {
        console.error('Error loading files for autocomplete:', error);
      }
    };

    loadAllFiles();
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    if (searchTerm.length > 1) {
      const filteredSuggestions = allFiles
        .filter(
          (file) =>
            file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.subject.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
        .map((file) => ({
          text: file.title,
          type: 'title',
        }));

      // Add unique subjects that match
      const subjectSuggestions = [
        ...new Set(
          allFiles
            .filter((file) =>
              file.subject.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((file) => file.subject)
        ),
      ]
        .slice(0, 3)
        .map((subject) => ({
          text: subject,
          type: 'subject',
        }));

      setSuggestions([...filteredSuggestions, ...subjectSuggestions]);
      setShowSuggestions(true);
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (term = searchTerm) => {
    if (!term.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      // Filter files based on search term
      const results = allFiles.filter(
        (file) =>
          file.title.toLowerCase().includes(term.toLowerCase()) ||
          file.subject.toLowerCase().includes(term.toLowerCase()) ||
          file.domain.toLowerCase().includes(term.toLowerCase())
      );

      onSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
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
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
          disabled={!searchTerm.trim() || isSearching}
          style={{
            padding: '12px 24px',
            backgroundColor:
              searchTerm.trim() && !isSearching ? '#3498db' : '#bdc3c7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor:
              searchTerm.trim() && !isSearching ? 'pointer' : 'not-allowed',
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

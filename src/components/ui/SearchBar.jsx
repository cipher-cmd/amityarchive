import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../services/firebase.config';

const SearchBar = ({ onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('amityarchive_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
        setRecentSearches([]);
      }
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions based on input
  const fetchSuggestions = async (term) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const suggestions = [];

      // Search in titles (case-insensitive)
      const titleQuery = query(
        collection(db, 'files'),
        where('titleLowerCase', '>=', term.toLowerCase()),
        where('titleLowerCase', '<=', term.toLowerCase() + '\uf8ff'),
        limit(5)
      );

      const titleSnapshot = await getDocs(titleQuery);
      titleSnapshot.forEach((doc) => {
        const data = doc.data();
        suggestions.push({
          id: doc.id,
          type: 'title',
          text: data.title,
          subject: data.subject,
          year: data.year,
          domain: data.domain,
          ...data,
        });
      });

      // Search in subjects (if no title matches)
      if (suggestions.length < 3) {
        const subjectQuery = query(
          collection(db, 'files'),
          where('subject', '>=', term),
          where('subject', '<=', term + '\uf8ff'),
          limit(3)
        );

        const subjectSnapshot = await getDocs(subjectQuery);
        subjectSnapshot.forEach((doc) => {
          const data = doc.data();
          if (!suggestions.find((s) => s.id === doc.id)) {
            suggestions.push({
              id: doc.id,
              type: 'subject',
              text: data.subject,
              title: data.title,
              year: data.year,
              domain: data.domain,
              ...data,
            });
          }
        });
      }

      setSuggestions(suggestions.slice(0, 6)); // Limit to 6 suggestions
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchSuggestions(searchTerm.trim());
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Save search term to recent searches
  const saveRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem(
      'amityarchive_recent_searches',
      JSON.stringify(updated)
    );
  };

  // Perform actual search
  const performSearch = async (term) => {
    if (!term.trim()) return;

    try {
      setLoading(true);
      saveRecentSearch(term.trim());

      // Search in multiple fields
      const searchResults = [];
      const searchTermLower = term.toLowerCase();

      // Search by title
      const titleQuery = query(
        collection(db, 'files'),
        where('titleLowerCase', '>=', searchTermLower),
        where('titleLowerCase', '<=', searchTermLower + '\uf8ff')
      );

      const titleSnapshot = await getDocs(titleQuery);
      titleSnapshot.forEach((doc) => {
        searchResults.push({ id: doc.id, ...doc.data() });
      });

      // Search by subject (if not enough results)
      if (searchResults.length < 10) {
        const subjectQuery = query(
          collection(db, 'files'),
          where('subject', '==', term)
        );

        const subjectSnapshot = await getDocs(subjectQuery);
        subjectSnapshot.forEach((doc) => {
          if (!searchResults.find((r) => r.id === doc.id)) {
            searchResults.push({ id: doc.id, ...doc.data() });
          }
        });
      }

      onSearchResults(searchResults);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.text);
    performSearch(suggestion.text);
  };

  // Handle recent search click
  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    performSearch(term);
  };

  return (
    <div
      className="search-container"
      style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}
    >
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper" style={{ position: 'relative' }}>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search for files, subjects, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0 || recentSearches.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="search-input"
            style={{
              width: '100%',
              padding: '12px 50px 12px 16px',
              border: '2px solid #e1e5e9',
              borderRadius: '25px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#3498db',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
            }}
          >
            {loading ? '⏳' : '🔍'}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e1e5e9',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
            marginTop: '8px',
          }}
        >
          {/* Recent Searches */}
          {searchTerm.length === 0 && recentSearches.length > 0 && (
            <div>
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: 'bold',
                }}
              >
                RECENT SEARCHES
              </div>
              {recentSearches.map((term, index) => (
                <div
                  key={index}
                  onClick={() => handleRecentSearchClick(term)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = '#f8f9fa')
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                >
                  <span style={{ color: '#999' }}>🕒</span>
                  <span>{term}</span>
                </div>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div>
              {searchTerm.length > 0 && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: 'bold',
                  }}
                >
                  SUGGESTIONS
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom:
                      index < suggestions.length - 1
                        ? '1px solid #f8f9fa'
                        : 'none',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = '#f8f9fa')
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                >
                  <div
                    style={{
                      fontWeight: '500',
                      color: '#2c3e50',
                      marginBottom: '4px',
                    }}
                  >
                    {suggestion.type === 'title'
                      ? suggestion.text
                      : suggestion.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    {suggestion.subject} • {suggestion.year} •{' '}
                    {suggestion.domain}
                    {suggestion.type === 'subject' && (
                      <span> • Subject Match</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchTerm.length > 0 && suggestions.length === 0 && !loading && (
            <div
              style={{
                padding: '20px 16px',
                textAlign: 'center',
                color: '#7f8c8d',
              }}
            >
              No suggestions found for "{searchTerm}"
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div
              style={{
                padding: '20px 16px',
                textAlign: 'center',
                color: '#7f8c8d',
              }}
            >
              Searching...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

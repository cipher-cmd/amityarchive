import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../services/firebase.config';
import { useToast } from '../../context/ToastContext';

const SearchBar = ({ onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const { showToast } = useToast();

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
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions with debouncing
  useEffect(() => {
    const fetchSuggestions = async (term) => {
      if (term.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const titleQuery = query(
          collection(db, 'files'),
          where('titleLowerCase', '>=', term.toLowerCase()),
          where('titleLowerCase', '<=', term.toLowerCase() + '\uf8ff'),
          limit(6)
        );
        const snapshot = await getDocs(titleQuery);
        const fetchedSuggestions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuggestions(fetchedSuggestions);
      } catch (error) {
        showToast('Error fetching search suggestions.', 'error');
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

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

  // Perform the actual search
  const performSearch = async (term) => {
    if (!term.trim()) return;
    setLoading(true);
    saveRecentSearch(term.trim());
    try {
      const q = query(
        collection(db, 'files'),
        where('titleLowerCase', '>=', term.toLowerCase()),
        where('titleLowerCase', '<=', term.toLowerCase() + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onSearchResults(results);
    } catch (error) {
      showToast('Error performing search.', 'error');
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.title);
    performSearch(suggestion.title);
  };

  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    performSearch(term);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for files, subjects, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="w-full py-4 pl-12 pr-4 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-inner"
          />
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-xl z-10 overflow-hidden border border-gray-100">
          {loading && (
            <div className="p-4 text-sm text-gray-500">Searching...</div>
          )}
          {!loading && searchTerm.length > 0 && suggestions.length === 0 && (
            <div className="p-4 text-sm text-gray-500">
              No suggestions found.
            </div>
          )}
          {!loading && suggestions.length > 0 && (
            <ul>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-4 hover:bg-primary-50 cursor-pointer border-b border-gray-100"
                >
                  <p className="font-semibold text-gray-800">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {suggestion.subject} - {suggestion.year}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {!loading && searchTerm.length === 0 && recentSearches.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase p-3 border-b border-gray-100">
                Recent Searches
              </h4>
              <ul>
                {recentSearches.map((term, index) => (
                  <li
                    key={index}
                    onClick={() => handleRecentSearchClick(term)}
                    className="p-3 hover:bg-primary-50 cursor-pointer text-sm text-gray-700"
                  >
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

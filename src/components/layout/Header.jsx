import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../ui/LoginModal';

const Header = ({ totalFiles, currentlyShowing }) => {
  const { currentUser, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900 text-white">
        <div className="container mx-auto px-6 flex h-20 items-center justify-between">
          {/* Left side: Logo and Metadata */}
          <div>
            <Link to="/" className="text-2xl font-extrabold">
              <h1 className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                AmityArchive
              </h1>
            </Link>
            <p className="text-xs text-slate-400">
              Total Files: {totalFiles} | Currently Showing: {currentlyShowing}
            </p>
          </div>

          {/* Right side: Login/Logout Button */}
          <div>
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Admin Login
              </button>
            )}
          </div>
        </div>
      </header>
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;

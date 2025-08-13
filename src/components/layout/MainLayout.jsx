import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import RecentlyAdded from '../ui/RecentlyAdded';
import { db } from '../../services/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import { useToast } from '../../context/ToastContext';

const MainLayout = ({ children }) => {
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentlyShowing, setCurrentlyShowing] = useState(0);
  // The hook is now correctly called at the top level.
  const { showToast } = useToast();

  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'files'));
        setTotalFiles(querySnapshot.size);
      } catch (error) {
        // It's now safe to use the function here.
        showToast('Error fetching total file count.', 'error');
        console.error('Error fetching total file count:', error);
      }
    };
    fetchTotalCount();
  }, [showToast]); // Added showToast to the dependency array for correctness.

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { setCurrentlyShowing });
    }
    return child;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header totalFiles={totalFiles} currentlyShowing={currentlyShowing} />
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        <Sidebar />
        <main className="flex-1 bg-white p-6 rounded-lg shadow-md">
          {childrenWithProps}
        </main>
        <div className="hidden xl:block">
          <RecentlyAdded />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

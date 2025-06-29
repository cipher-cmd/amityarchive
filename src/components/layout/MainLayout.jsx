import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import RecentlyAdded from '../ui/RecentlyAdded';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">{children}</main>
        <RecentlyAdded />
      </div>
    </div>
  );
};

export default MainLayout;

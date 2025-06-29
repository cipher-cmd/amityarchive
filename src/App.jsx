import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import SubjectPage from './pages/SubjectPage';
import DomainPage from './pages/DomainPage';
import YearPage from './pages/YearPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/subject/:subjectId" element={<SubjectPage />} />
            <Route path="/domain/:domainId" element={<DomainPage />} />
            <Route path="/year/:year" element={<YearPage />} />
          </Routes>
        </MainLayout>
      </div>
    </Router>
  );
}

export default App;

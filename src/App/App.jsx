import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import Home from '../pages/Home';
import SubjectPage from '../pages/SubjectPage';
import DomainPage from '../pages/DomainPage';
import YearPage from '../pages/YearPage';
import ToastContainer from '../components/ui/ToastContainer';
// We no longer need to import ToastProvider here

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
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;

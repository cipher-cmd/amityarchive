import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const Sidebar = () => {
  const navigate = useNavigate();

  const subjects = [
    'Applied Science',
    'Commerce',
    'Computer Science/IT',
    'Engineering',
    'English Literature',
    'Fashion',
    'Management',
    'Skill Development',
    'Social Science',
    'Finance',
    'Psychology & Behavioural Science',
    'Pharmacy',
  ];

  const domains = [
    { name: 'ALLIED', path: '/domain/allied' },
    { name: 'ASET', path: '/domain/aset' },
    { name: 'MGMT', path: '/domain/mgmt' },
    { name: 'DIP', path: '/domain/dip' },
  ];

  const years = ['2022', '2023', '2024', '2025'];

  const handleSubjectClick = (subject) => {
    navigate(`/subject/${subject.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
  };

  const handleDomainClick = (domain) => {
    navigate(domain.path);
  };

  const handleYearClick = (year) => {
    navigate(`/year/${year}`);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Subjects</h3>
        <div className="button-list">
          {subjects.map((subject) => (
            <Button
              key={subject}
              title={subject}
              onClick={() => handleSubjectClick(subject)}
              variant="sidebar"
            />
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Domain</h3>
        <div className="domain-buttons">
          {domains.map((domain) => (
            <Button
              key={domain.name}
              title={domain.name}
              onClick={() => handleDomainClick(domain)}
              variant="domain"
            />
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Year</h3>
        <div className="year-buttons">
          {years.map((year) => (
            <Button
              key={year}
              title={year}
              onClick={() => handleYearClick(year)}
              variant="year"
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

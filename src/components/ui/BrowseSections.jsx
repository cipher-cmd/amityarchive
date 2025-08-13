import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { DOMAINS, YEARS } from '../../constants';

const BrowseSections = () => {
  const navigate = useNavigate();

  const handleDomainClick = (domain) => {
    // The domain object from constants already has the correct path
    navigate(domain.path);
  };

  const handleYearClick = (year) => {
    navigate(`/year/${year}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 mt-12 pt-8 border-t">
      {/* Domain Section */}
      <div>
        <h3 className="mb-4 text-center text-sm font-medium text-gray-500">
          Browse by Domain
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DOMAINS.map((domain) => (
            <Button
              key={domain.name}
              title={domain.name}
              onClick={() => handleDomainClick(domain)}
              variant="secondary"
              size="lg"
            />
          ))}
        </div>
      </div>
      {/* Year Section */}
      <div>
        <h3 className="mb-4 text-center text-sm font-medium text-gray-500">
          Browse by Year
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {YEARS.map((year) => (
            <Button
              key={year}
              title={year}
              onClick={() => handleYearClick(year)}
              variant="outline"
              size="lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseSections;

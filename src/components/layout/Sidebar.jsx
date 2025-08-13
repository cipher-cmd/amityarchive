import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
// We only need COURSES now
import { COURSES } from '../../constants';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleCourseClick = (course) => {
    navigate(
      `/subject/${course.toLowerCase().replace(/ /g, '-').replace(/\./g, '')}`
    );
  };

  const sidebarButtonStyles =
    'text-gray-700 hover:bg-gray-100 hover:text-gray-900';

  return (
    // The sidebar now only contains the courses section
    <aside className="w-full lg:w-64 bg-white p-6 rounded-lg shadow-md h-fit">
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Courses</h3>
        <div className="space-y-2">
          {COURSES.map((course) => (
            <Button
              key={course}
              title={course}
              onClick={() => handleCourseClick(course)}
              variant="ghost" // Use a more subtle variant for navigation
              className={sidebarButtonStyles}
            />
          ))}
        </div>
      </div>
      {/* The Domain and Year sections have been removed */}
    </aside>
  );
};

export default Sidebar;

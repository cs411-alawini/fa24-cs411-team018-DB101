import React from 'react';
import UniversityComponent from '../components/universityComponent';

const UniversityPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Universities</h1>
        <UniversityComponent />
      </div>
    </div>
  );
};

export default UniversityPage;
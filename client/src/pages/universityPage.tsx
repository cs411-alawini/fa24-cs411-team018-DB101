import React from 'react';
import { Link } from 'react-router-dom';
import UniversityComponent from '../components/universityComponent';
import { Home } from 'lucide-react';
const UniversityPage: React.FC = () => {
  const backHome = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault();
    window.location.href = '/home';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
      <button
          onClick={backHome}
            className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all rounded-md shadow-sm"
          >
            <Home className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
            <span className="font-medium text-gray-700 hover:text-gray-900">Back to Home</span>
      </button>
      
        
        <UniversityComponent />
      </div>
    </div>
  );
};

export default UniversityPage;
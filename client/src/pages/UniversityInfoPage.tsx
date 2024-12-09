import React from "react";
import UniversityInfo from "../components/universityInfo";

const UniversityInfoPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Universitiy Info</h1>
            <UniversityInfo />
          </div>
        </div>
      );
};

export default UniversityInfoPage;

import React, { useState } from "react";

interface UniversitySearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

const UniversitySearchBar: React.FC<UniversitySearchBarProps> = ({ 
  onSearch,
  placeholder = "Search universities..." 
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    console.log("Search button clicked with term:", searchTerm);
    onSearch(searchTerm);
  };

  return (
    <div className="flex items-center justify-start space-x-4">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-96 py-2 pl-10 pr-4 text-base border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 stroke-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Search
      </button>
    </div>
  );
};

export default UniversitySearchBar;

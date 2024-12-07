import React from "react";
import { University } from "../types/university.d";

interface UniversityListProps {
  universities: University[];
  onEdit: (university: University) => void;
  onDelete: (universityName: string) => void;
}

const UniversityList: React.FC<UniversityListProps> = ({
  universities,
  onEdit,
  onDelete,
}) => {
  return (
    <ul className="divide-y divide-gray-200">
      {universities.map((university) => (
        <li key={university.universityName} className="flex py-4 px-4 items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {university.universityName}
            </h3>
            <p className="text-sm text-gray-500">
              {university.location}, {university.country}
            </p>
            <p className="text-sm text-gray-500">
              Popularity: {university.popularity}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(university)}
              className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(university.universityName)}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-900 border border-red-600 rounded-md hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default UniversityList; 
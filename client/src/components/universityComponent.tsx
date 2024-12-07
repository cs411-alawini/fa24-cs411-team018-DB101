import React, { useState, useEffect } from 'react';
import { getUniversityByName } from '../services/universityServices';
import UniversitySearchBar from './searchBar/universitySearchBar';
import UniversityList from './universityList';
import { University } from '../types/university.d';

interface UniversityComponentProps {
  searchName?: string;
}

const UniversityComponent: React.FC<UniversityComponentProps> = ({ searchName = '' }) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getUniversityByName(searchTerm);
      
      if (response && response.success) {
        setUniversities(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setError('No universities found');
        setUniversities([]);
      }
    } catch (err) {
      console.error('Error searching universities:', err);
      setError('Failed to search universities');
      setUniversities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (university: University) => {
    // Implement edit functionality
    console.log('Editing university:', university);
  };

  const handleDelete = async (universityName: string) => {
    try {
      const response = await fetch(`/api/universities/${universityName}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUniversities(universities.filter(u => u.universityName !== universityName));
      } else {
        setError('Failed to delete university');
      }
    } catch (err) {
      console.error('Error deleting university:', err);
      setError('Failed to delete university');
    }
  };

  return (
    <div className="space-y-6">
      <UniversitySearchBar onSearch={handleSearch} placeholder="Search by university name..." />
      
      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {!isLoading && !error && universities.length > 0 && (
        <UniversityList
          universities={universities}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default UniversityComponent;

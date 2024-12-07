import React, { useState } from 'react';
import { getUniversityByName } from '../services/universityServices';

interface University {
    universityName: string;
    description: string;
    location: string;
    country: string;
    popularity: number;
}

const University: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [university, setUniversity] = useState<University | null>(null);

    const handleSearch = async () => {
        try {
            const result = await getUniversityByName(searchTerm);
            setUniversity(result);
        } catch (error) {
            console.error("Error fetching university:", error);
        }
    };

    return (
        <div>
            <h1>University Information</h1>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a university"
            />
            <button onClick={handleSearch}>Search</button>
            {university && (
                <div>
                    <h2>{university.universityName}</h2>
                    <p>{university.description}</p>
                    <p>Location: {university.location}</p>
                    <p>Country: {university.country}</p>
                    <p>Popularity: {university.popularity}</p>
                </div>
            )}
        </div>
    );
};

export default University;

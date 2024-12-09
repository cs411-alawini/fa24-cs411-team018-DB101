import React, { useState, useEffect } from 'react';
import { getPopularUniversity } from '../services/universityServices';
import type { University } from '../services/universityServices';

const PopularUniversity = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        setLoading(true);
        try {
            const response = await getPopularUniversity();
            console.log(response);
            setUniversities(response.data.data);
        } catch (error) {
            console.error('Error fetching universities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentPageData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return universities.slice(start, end);
    };

    const totalPages = Math.ceil(universities.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatDate = (dateStr: string) => {
        dateStr = dateStr.split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        const timestamp = Date.UTC(year, month - 1, day, 12, 0, 0);
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'America/Chicago'
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">University Name</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Established</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Country</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Popularity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                                </tr>
                            ) : getCurrentPageData().map((university) => (
                                <tr key={university.universityName} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="truncate" title={university.universityName}>
                                            {university.universityName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="truncate" title={university.description}>
                                            {university.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{formatDate(university.establishmentDate)}</td>
                                    <td className="px-6 py-4">{university.location}</td>
                                    <td className="px-6 py-4">{university.country}</td>
                                    <td className="px-6 py-4">{university.popularity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 flex justify-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-md ${
                                currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded-md ${
                                    page === currentPage
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-md ${
                                currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopularUniversity;
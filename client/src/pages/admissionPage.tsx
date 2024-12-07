import React, { useState, useEffect } from 'react';
import { Search, Plus, Home } from 'lucide-react';
import { keywordSearch } from '../services/admissionServices';
import { AdmissionData, getDataByUser } from '../services/admissionServices';
import { useNavigate } from 'react-router-dom';
import AdmissionForm from '../components/admissionForm';
import AdmissionDetail from '../components/admissionDetail';
import AnalyzeForm from '../components/admissionAnalyzeForm';

const AdmissionDataPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<AdmissionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [displayContent, setDisplayContent] = useState('');
    const [selectedAdID, setSelectedAdID] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
    const itemsPerPage = 7;

    const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
    const getCurrentPageData = () => {
        if (!Array.isArray(data)) {
            console.error('Data is not an array:', data);
            return [];
        }
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return data.slice(start, end);
    };

    const getPageNumbers = (currentPage: number, totalPages: number) => {
        const delta = 2; //show number
        const range: (number | string)[] = [];

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || //first
                i === totalPages || //last
                i === currentPage || //current
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                range.push(i);
            } else if (
                (i === currentPage - delta - 1 && i > 1) ||
                (i === currentPage + delta + 1 && i < totalPages)
            ) {
                range.push('...');
            }
        }
        return range.filter((item, index, self) =>
            item === '...' ? self.indexOf(item) === index : true
        );
    };

    const fetchData = async (term: string = "%") => {
        setLoading(true);
        try {
            const response = await keywordSearch(term);
            console.log(response)
            setData(response);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOwnData = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let userID = localStorage.getItem("userID");
            const response = await getDataByUser(userID!);
            console.log(response)
            setData(response);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(searchTerm);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatLanguageScore = (type: string, score: number) => {
        return `${type}: ${score}`;
    };
    const formatDate = (dateStr: string) => {
        // const date = new Date(dateString);
        // return date.toLocaleDateString('en-US', {
        //     year: 'numeric',
        //     month: '2-digit',
        //     day: '2-digit'
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

    const useBackHome = () => {
        const navigate = useNavigate();
        return () => navigate(`/home`);
    };
    const backHome = useBackHome();

    const onSuccess = (content: string) => {
        fetchData('%');
        setShowSuccess(true);
        setDisplayContent(content);
        setTimeout(() => {
            setShowSuccess(false);
            setDisplayContent('');
        }, 2000);
    }
    const handleViewClick = (adID: string) => {
        setSelectedAdID(adID);
        setIsDetailOpen(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {isOpen && <AdmissionForm isOpen={isOpen} onClose={() => { setIsOpen(false) }} onSuccess={() => { onSuccess("Succefully uploaded") }} />}
            {showSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity">
                    {displayContent}
                </div>
            )}
            {isAnalyzeOpen && (
                <AnalyzeForm
                    onClose={() => setIsAnalyzeOpen(false)}
                />
            )}
            {selectedAdID && (
                <AdmissionDetail
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    adID={selectedAdID}
                    onSuccess={() => {
                        fetchData(searchTerm);
                        onSuccess("Your operation has been succefully executed");
                    }}
                />
            )}
            <div className="absolute left-6 top-0">
                <button
                    onClick={backHome}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <Home className="h-4 w-4" />
                    Home
                </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <form className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter keywords to search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </button>
                    <button
                        onClick={getOwnData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        <Search className="h-4 w-4" />
                        Get data posted by yourself
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => { setIsOpen(true) }}
                    >
                        <Plus className="h-4 w-4" />
                        Post your admission data
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        onClick={() => setIsAnalyzeOpen(true)}
                    >
                        <Search className="h-4 w-4" />
                        Program recommendation
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">University</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Program</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Season</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">GPA</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Language</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">GRE</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center">Loading...</td>
                                </tr>
                            ) : getCurrentPageData().length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center">No data found</td>
                                </tr>
                            ) : (
                                getCurrentPageData().map((item) => (
                                    <tr key={item.adID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 max-w-xs group relative">
                                            <div className="truncate" title={item.universityName}>
                                                {item.universityName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{item.program}</td>
                                        <td className="px-6 py-4">{item.admissionSeason}</td>
                                        <td className="px-6 py-4">{formatDate(item.notificationTime)}</td>
                                        <td className="px-6 py-4">{item.GPA.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            {formatLanguageScore(item.languageProficiencyType, item.languageScore)}
                                        </td>
                                        <td className="px-6 py-4">{item.GRE}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                className="text-blue-500 hover:text-blue-600"
                                                onClick={() => handleViewClick(item.adID.toString())}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 flex justify-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-md ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Previous
                        </button>
                        {getPageNumbers(currentPage, totalPages).map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                                className={`px-3 py-1 rounded-md ${page === currentPage
                                    ? 'bg-blue-500 text-white'
                                    : page === '...'
                                        ? 'bg-white border border-gray-300 cursor-default'
                                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-md ${currentPage === totalPages
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

export default AdmissionDataPage;
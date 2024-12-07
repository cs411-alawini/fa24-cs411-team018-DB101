import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getCountries, getPrograms, analyze, AnalysisResult } from '../services/admissionServices';

interface AnalyzeFormProps {
    onClose?: () => void;
}

interface CountryData {
    country: string | null;
}

interface ProgramData {
    program: string;
}

const AnalyzeForm: React.FC<AnalyzeFormProps> = ({ onClose }) => {
    const [countries, setCountries] = useState<string[]>([]);
    const [programs, setPrograms] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        gpa: '',
        country: '',
        program: '',
        analyzeType: 'target'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const countriesResponse = await getCountries();
            const programsResponse = await getPrograms();
            const countriesData = countriesResponse as CountryData[];
            const programsData = programsResponse as ProgramData[];
            const processedCountries = countriesData
                .filter((item): item is { country: string } => item.country !== null)
                .map(item => item.country);
            const processedPrograms = programsData.map(item => item.program);

            setCountries(processedCountries);
            setPrograms(processedPrograms);
        } catch (err) {
            setError('Failed to fetch initial data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const gpaValue = parseFloat(formData.gpa);

        if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4.0) {
            setError('Please enter a valid GPA between 0 and 4.0');
            return;
        }

        if (!formData.country || !formData.program) {
            setError('Please select both country and program');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let analyzeTypeNum: number;
            switch (formData.analyzeType) {
                case 'safe':
                    analyzeTypeNum = 1;
                    break;
                case 'target':
                    analyzeTypeNum = 2;
                    break;
                case 'reach':
                    analyzeTypeNum = 3;
                    break;
                default:
                    analyzeTypeNum = 2;
            }
            const response = await analyze(parseFloat(formData.gpa), formData.country, formData.program, analyzeTypeNum);
            setResults(response);
            setShowResults(true);
        } catch (err) {
            setError('Failed to analyze admission chances');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">
                            {showResults ? 'Analysis Results' : 'Analyze Admission Chances'}
                        </h2>
                        {onClose && (
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    {showResults ? (
                        <div className="space-y-4">
                            {results.length > 0 ? (
                                <>
                                    <div className="grid gap-4">
                                        {results.map((result, index) => (
                                            <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="font-medium">University:</label>
                                                        <p>{result.universityName}</p>
                                                    </div>
                                                    <div>
                                                        <label className="font-medium">Program:</label>
                                                        <p>{result.program}</p>
                                                    </div>
                                                    <div>
                                                        <label className="font-medium">Average GPA:</label>
                                                        <p>{result.avgGPA.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="font-medium">Total Admissions:</label>
                                                        <p>{result.totalAdmissions}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => setShowResults(false)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            New Analysis
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4 text-gray-600">
                                    No matching programs found
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    GPA
                                </label>
                                <input
                                    type="number"
                                    name="gpa"
                                    value={formData.gpa}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    max="4.0"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your GPA (0-4.0)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                </label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a country</option>
                                    {countries.map((country, index) => (
                                        <option key={`country-${index}-${country}`} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Program
                                </label>
                                <select
                                    name="program"
                                    value={formData.program}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a program</option>
                                    {programs.map((program, index) => (
                                        <option key={`program-${index}-${program}`} value={program}>
                                            {program}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Analysis Type
                                </label>
                                <select
                                    name="analyzeType"
                                    value={formData.analyzeType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="safe">Safety Schools</option>
                                    <option value="target">Target Schools</option>
                                    <option value="reach">Reach Schools</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                <Search className="h-4 w-4" />
                                Analyze
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyzeForm;
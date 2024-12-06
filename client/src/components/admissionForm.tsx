import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AdmissionData } from '../services/admissionServices';
import { postNewData } from '../services/admissionServices';

interface FormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (content:string) => void;
}

const AdmissionForm: React.FC<FormProps> = ({ isOpen, onClose, onSuccess }) => {
    const [displayContent,setDisplayContent] = useState('');
    const [formData, setFormData] = useState({
        universityName: '',
        program: '',
        admissionSeason: '',
        notificationTime: '',
        GPA: '',
        languageProficiencyType: 'TOFEL',
        languageScore: '',
        GRE: '',
        Notes: ''
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'notificationTime') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const submissionData = {
                ...formData,
                GPA: parseFloat(formData.GPA),
                languageScore: parseFloat(formData.languageScore),
                GRE: parseInt(formData.GRE),
                userID: parseInt(localStorage.getItem('userID')!)
            };

            await postNewData(submissionData);
            onSuccess(displayContent);
            onClose();
        } catch (err) {
            setError('Failed to submit data. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;// closed

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" lang='en'>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Add New Admission Data</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate lang="en">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    University Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="universityName"
                                    value={formData.universityName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Program
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="program"
                                    value={formData.program}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admission Season
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="admissionSeason"
                                    value={formData.admissionSeason}
                                    placeholder="e.g., Fall 2024"
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notification Date
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="notificationTime"
                                    lang="en"
                                    value={formData.notificationTime}
                                    onChange={handleChange}
                                    placeholder="YYYY-MM-DD"
                                    pattern="\d{4}-\d{2}-\d{2}"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    GPA
                                </label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="4"
                                    name="GPA"
                                    value={formData.GPA}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Language Test Type
                                </label>
                                <select
                                    name="languageProficiencyType"
                                    value={formData.languageProficiencyType}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="TOEFL">TOEFL</option>
                                    <option value="IELTS">IELTS</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Language Score
                                </label>
                                <input
                                    required
                                    type="number"
                                    step="0.5"
                                    name="languageScore"
                                    value={formData.languageScore}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    GRE Score
                                </label>
                                <input
                                    required
                                    type="number"
                                    name="GRE"
                                    value={formData.GRE}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                name="Notes"
                                value={formData.Notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdmissionForm;
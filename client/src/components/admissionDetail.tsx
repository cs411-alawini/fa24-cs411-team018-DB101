import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';
import { AdmissionData, getAdmissionData, deleteAdmissionData, updateAdmissionData } from '../services/admissionServices';

interface DetailProps {
    isOpen: boolean;
    onClose: () => void;
    adID: string;
    onSuccess: () => void;
}

const AdmissionDetail: React.FC<DetailProps> = ({ isOpen, onClose, adID, onSuccess }) => {
    const [data, setData] = useState<AdmissionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<AdmissionData | null>(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        if (isOpen && adID) {
            fetchData();
        }
    }, [isOpen, adID]);

    useEffect(() => {
        const currentUserID = localStorage.getItem('userID');
        if (data && currentUserID) {
            setIsOwner(data.userID === parseInt(currentUserID));
        }
    }, [data]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getAdmissionData(adID);
            setData(response);
            setEditedData(response);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this record?')) {
            return;
        }

        try {
            await deleteAdmissionData(adID);
            onSuccess();
            onClose();
        } catch (err) {
            setError('Failed to delete record');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const formatDate = (dateStr: string) => {
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

    const handleSave = async () => {
        if (!editedData) return;

        try {
            await updateAdmissionData(editedData);
            setData(editedData);
            setIsEditing(false);
            onSuccess();
        } catch (err) {
            setError('Failed to update record');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (!editedData) return;

        setEditedData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [name]: name === 'GPA' || name === 'languageScore' ? parseFloat(value) :
                    name === 'GRE' ? parseInt(value) : value
            };
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Admission Details</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4">{error}</div>
                    ) : data && (
                        <div className="space-y-4">
                            {isEditing ? (
                                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                University Name
                                            </label>
                                            <input
                                                type="text"
                                                name="universityName"
                                                value={editedData?.universityName || ''}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Program
                                            </label>
                                            <input
                                                type="text"
                                                name="program"
                                                value={editedData?.program || ''}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Season
                                            </label>
                                            <input
                                                type="text"
                                                name="admissionSeason"
                                                value={editedData?.admissionSeason || ''}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notification Date
                                            </label>
                                            <input
                                                type="text"
                                                name="notificationTime"
                                                value={editedData?.notificationTime || ''}
                                                onChange={handleChange}
                                                placeholder="YYYY-MM-DD"

                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                GPA
                                            </label>
                                            <input
                                                type="number"
                                                name="GPA"
                                                value={editedData?.GPA || ''}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Language Test Type
                                            </label>
                                            <select
                                                name="languageProficiencyType"
                                                value={editedData?.languageProficiencyType || ''}
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
                                                type="number"
                                                name="languageScore"
                                                value={editedData?.languageScore || ''}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                GRE
                                            </label>
                                            <input
                                                type="number"
                                                name="GRE"
                                                value={editedData?.GRE || ''}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notes
                                            </label>
                                            <input
                                                type="text"
                                                name="Notes"
                                                value={editedData?.Notes || ''}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="font-medium">University:</label>
                                            <p>{data.universityName}</p>
                                        </div>
                                        <div>
                                            <label className="font-medium">Program:</label>
                                            <p>{data.program}</p>
                                        </div>
                                        <div>
                                            <label className="font-medium">Season:</label>
                                            <p>{data.admissionSeason}</p>
                                        </div>
                                        <div>
                                            <label className="font-medium">Notification Date:</label>
                                            <p>{formatDate(data.notificationTime)}</p>
                                        </div>
                                        <div>
                                            <label className="font-medium">GPA:</label>
                                            <p>{data.GPA.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <label className="font-medium">Language Score:</label>
                                            <p>{`${data.languageProficiencyType}: ${data.languageScore}`}</p>
                                        </div>
                                        <div>
                                            <label className="font-medium">GRE:</label>
                                            <p>{data.GRE}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="font-medium">Notes:</label>
                                        <p className="whitespace-pre-wrap">{data.Notes}</p>
                                    </div>

                                    {isOwner && (
                                        <div className="flex justify-end gap-2 mt-4">
                                            <button
                                                onClick={handleEdit}
                                                className="flex items-center gap-2 px-4 py-2 text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="flex items-center gap-2 px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdmissionDetail;
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUserInfo, changeName, deleteUser, getUserFavourites } from '../services/userServices'; // 假设这是您API所在的路径

export interface User {
    userID: number;
    userName: string;
    email: string;
    password: string;
}

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [favourites, setFavourites] = useState<string[]>([]);


    useEffect(() => {
        const userID = localStorage.getItem('userID');
        if (!userID) {
            navigate('/login');
            return;
        }
        fetchUserData(userID);
        fetchUserFavourites(userID); // 加载收藏数据
    }, []);

    const fetchUserFavourites = async (userID: string) => {
        try {
            const response = await getUserFavourites(userID);
            if (response.success) {
                setFavourites(response.data.map((item) => item.universityName));
            }
        } catch (error) {
            console.error("Error fetching favourites:", error);
        }
    };

    const fetchUserData = async (userID: string) => {
        try {
            const response = await getUserInfo(userID);
            if (response.success) {
                setUser(response.data!);
                setNewUsername(response.data!.userName);
            } else {
                setAlert({
                    type: 'error',
                    message: response.message || 'Failed to load user data'
                });
            }
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load user data'
            });
        }
    };

    const handleUsernameUpdate = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const updateData = {
                userName: newUsername,
                email: user.email,
                password: user.password
            };
            
            const response = await changeName(user.userID.toString(), updateData);
            
            if (response.success) {
                setUser({ ...user, userName: newUsername });
                setAlert({
                    type: 'success',
                    message: 'Username updated successfully!'
                });
                setIsEditing(false);
            } else {
                setAlert({
                    type: 'error',
                    message: response.message || 'Failed to update username'
                });
            }
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to update username'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user || !window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await deleteUser(user.userID.toString());
            if (response.success) {
                localStorage.removeItem('userID');
                navigate('/');
            } else {
                setAlert({
                    type: 'error',
                    message: response.message || 'Failed to delete account'
                });
            }
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to delete account'
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userID');
        navigate('/');
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 h-full w-full">
            {/* 返回按钮 */}
            <button
                onClick={() => navigate('/home')}
                className="absolute top-4 left-4 text-blue-500 hover:text-blue-600 font-bold flex items-center"
            >
                ← Back to Home
            </button>

            {/* Alert Messages */}
            {alert && (
                <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${
                    alert.type === 'success' 
                        ? 'bg-green-100 text-green-700 border border-green-400' 
                        : 'bg-red-100 text-red-700 border border-red-400'
                    }`}
                >
                    {alert.message}
                </div>
            )}
    
            <div className="flex flex-col md:flex-row gap-6 w-full h-full">
                {/* Left Column - User Info Section */}
                <div className="md:w-1/3 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-md p-6 h-full">
                        <h2 className="text-2xl font-bold mb-6">User Profile</h2>
                        
                        <div className="space-y-6">
                            {/* Username Section */}
                            <div>
                                <div className="font-medium mb-2">Username:</div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleUsernameUpdate}
                                                disabled={isLoading}
                                                className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setNewUsername(user?.userName || "");
                                                }}
                                                className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span>{user?.userName}</span>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-blue-500 hover:text-blue-600"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
    
                            {/* Email Section */}
                            <div>
                                <div className="font-medium mb-2">Email:</div>
                                <div>{user?.email}</div>
                            </div>
    
                            {/* Account Actions */}
                            <div className="pt-6 space-y-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    Logout
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
    
                {/* Right Column - Favorites Section */}
                <div className="md:w-2/3 flex-grow">
                    <div className="bg-white rounded-lg shadow-md p-6 h-full">
                        <h2 className="text-2xl font-bold mb-6">My Favorites</h2>
                        {favourites.length > 0 ? (
                            <ul className="space-y-2">
                                {favourites.map((university, index) => (
                                    <li key={index} className="border-b border-gray-300 pb-2">
                                        <Link
                                            to={`/university/${encodeURIComponent(university)}`}
                                            state={{ from: '/user/userId' }}
                                            className="text-blue-500 hover:text-blue-600"
                                        >
                                            {university}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 h-[calc(100%-4rem)] flex items-center justify-center">
                                <span className="text-gray-500">
                                    No favorite universities found.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
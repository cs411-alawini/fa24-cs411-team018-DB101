import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userRegist } from "../services/userServices";

const RegisterForm: React.FC = () => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setAlert(null);
        setIsLoading(true);

        try {
            const response = await userRegist({ userName,email, password });

            if (response.success) {
                setAlert({
                    type: 'success',
                    message: 'Registration successful! Redirecting to login...'
                });
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setAlert({
                    type: 'error',
                    message: response.message || 'Registration failed. Please try again.'
                });
            }
        } catch (err) {
            setAlert({
                type: 'error',
                message: 'Server error. Please try again later.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-6">
            {alert && (
                <div 
                    className={`absolute top-0 left-0 right-0 p-4 mb-4 rounded-md ${
                        alert.type === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-400' 
                            : 'bg-red-100 text-red-700 border border-red-400'
                    }`}
                >
                    {alert.message}
                </div>
            )}
            <div className="flex flex-col space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email:
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div className="flex flex-col space-y-2">
                <label htmlFor="userName" className="text-sm font-medium text-gray-700">
                    User Name:
                </label>
                <input
                    type="userName"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your userName"
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div className="flex flex-col space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password:
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? 'Registering...' : 'Register'}
            </button>
            <div className="text-center text-sm">
                <span>
                    Already have an account? {" "}
                    <a href="/" className="text-blue-500 hover:text-blue-600">
                        Login here
                    </a>
                </span>
            </div>
        </form>
    );
}

export default RegisterForm;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginVerify } from "../services/userServices";

const LoginForm: React.FC = () => {
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
            const response = await loginVerify({email,password})

            if (response.success) {
                console.log('Login successfully');
                localStorage.setItem('userID', response.userID!.toString()); //user Number() to get userID when needed
                setAlert({ 
                    type: 'success', 
                    message: 'Login successful! Redirecting...' 
                });
                setTimeout(() => {
                    // navigate(`/user/${response.userID!.toString()}`);
                    navigate(`/home`);
                }, 1500);
               // navigate('/dashboard');
            } else {
                console.log('Login Failed');
                console.log(response.message);
                setError(response.message);
                setAlert({ 
                    type: 'error', 
                    message: response.message || 'Login failed. Please check your credentials.' 
                });
            }
        } catch (err) {
            setError('Server Error');
            console.error('Login Failed:', err);
            setAlert({ 
                type: 'error', 
                message: 'Server error. Please try again later.' 
            });
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
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter username"
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
            >
                Sign In
            </button>
            <div className="flex flex-col items-center space-y-2 text-sm">
                <span>
                    Don't have an account? {" "}
                    <a href="/register" className="text-blue-500 hover:text-blue-600">
                        Register
                    </a>
                </span>
            </div>
        </form>
    );
}

export default LoginForm;
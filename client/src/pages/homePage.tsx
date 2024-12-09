import React, { useState } from 'react';
import { User, ArrowRight, Book, Trophy, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PopularUniversity from '../components/popularUniversity';

const Homepage = () => {
    const navigate = useNavigate();
    const handleUserClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const userId = localStorage.getItem('userID');
        if (userId) {
          navigate(`/user/userId`);
        } else {
          navigate('/');
        }
      };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="w-full bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <a className="text-2xl font-bold text-blue-600">
                                EDU Rank Insights
                            </a>
                        </div>
                        <div className="flex items-center">
                            <a href="#" onClick={handleUserClick} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-4 py-2">
                                <User size={20} />
                                <span className="hidden md:block text-base font-medium">User</span>
                            </a>
                        </div>
                    </nav>

                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                            <Book className="text-blue-600" size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">University</h3>
                        <p className="text-gray-600 mb-4">
                            Get to know more about prestigious universities.
                        </p>
                        <a href="/university" className="text-blue-600 font-medium flex items-center hover:text-blue-700">
                            Enter <ArrowRight size={16} className="ml-1" />
                        </a>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                            <Trophy className="text-blue-600" size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Ranking</h3>
                        <p className="text-gray-600 mb-4">
                            You can get to know the ranking from your own perspective.
                        </p>
                        <a href="/ranking" className="text-blue-600 font-medium flex items-center hover:text-blue-700">
                            Enter <ArrowRight size={16} className="ml-1" />
                        </a>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                            <BarChart className="text-blue-600" size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Admission Data</h3>
                        <p className="text-gray-600 mb-4">
                            Get to know previous admission data. You can also offer datapoints to help others here.
                        </p>
                        <a href="/admission" className="text-blue-600 font-medium flex items-center hover:text-blue-700">
                            Enter <ArrowRight size={16} className="ml-1" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center" >Popular Universities</h2>
                <PopularUniversity/>
            </div>
        </div>
    );
};

export default Homepage;
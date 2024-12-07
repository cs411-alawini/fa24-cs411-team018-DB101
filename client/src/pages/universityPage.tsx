import React from "react";
import University from "../components/university";

const UniversityPage: React.FC = () => {
    return (
        <div className="max-w-md mx-auto mt-24 p-6">
            <h1 className="text-3xl font-bold text-center mb-8">University</h1>
            <University />
        </div>
    );
}

export default UniversityPage;
import React from "react";
import { Link, useLocation } from "react-router-dom";
import UniversityInfo from "../components/universityInfo";

const UniversityInfoPage: React.FC = () => {
    const location = useLocation();

    const from = location.state?.from || "/university";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <Link
                    to={from}
                    style={{
                        display: "block",
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#007BFF",
                        textDecoration: "none",
                        marginBottom: "20px",
                    }}
                >
                    Back
                </Link>
                <UniversityInfo />
            </div>
        </div>
    );
};

export default UniversityInfoPage;

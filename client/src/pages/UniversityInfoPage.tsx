import React from "react";
import UniversityInfo from "../components/universityInfo";
import { Link } from "react-router-dom";

const UniversityInfoPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            
            <Link
                to={`/university`}
                style={{
                display: "block",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#007BFF",
                textDecoration: "none",
                marginBottom: "20px",
                }}
              >
                Back to University List
              </Link>
            <UniversityInfo />
          </div>
        </div>
      );
};

export default UniversityInfoPage;

import React from "react";
import UserProfile from "../components/userProfile";

const UserPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <UserProfile/>
        </div>
    );
}

export default UserPage;
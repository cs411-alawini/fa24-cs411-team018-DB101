import React from "react";
import Ranking from "../components/ranking";

const LoginPage: React.FC = () => {
    return (
        <div className="max-w-md mx-auto mt-24 p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Ranking</h1>
            <Ranking/>
        </div>
    );
}

export default LoginPage;
import React from "react";
import LoginForm from "../components/loginForm";

const LoginPage: React.FC = () => {
    return (
        <div className="max-w-md mx-auto mt-24 p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
            <LoginForm/>
        </div>
    );
}

export default LoginPage;
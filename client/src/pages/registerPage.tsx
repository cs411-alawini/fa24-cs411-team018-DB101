import React from "react";
import RegisterForm from "../components/registerForm";

const RegisterPage: React.FC = () => {
    return (
        <div className="max-w-md mx-auto mt-24 p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Register</h1>
            <RegisterForm/>
        </div>
    );
}

export default RegisterPage;
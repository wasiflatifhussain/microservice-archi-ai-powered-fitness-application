import React from "react";
import { useNavigate } from "react-router-dom";
import { loginToHome, logout } from "../features/auth/keycloak";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = (): void => {
    navigate("/register");
  };

  const handleLogin = (): void => {
    loginToHome();
  };

  const handleForceLogout = (): void => {
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Fitness App
          </h1>
          <p className="mt-2 text-gray-600">Please choose an option</p>
        </header>

        <section className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Login with Keycloak
          </button>

          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 font-medium transition-colors"
          >
            Register New Account
          </button>

          <button
            onClick={handleForceLogout}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 font-medium transition-colors"
          >
            Force Logout
          </button>
        </section>
      </div>
    </div>
  );
};

export default Landing;

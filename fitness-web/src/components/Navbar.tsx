import React from "react";
import { useAppDispatch } from "../app/hooks";
import { clearAuth } from "../features/auth/authSlice";
import { logout } from "../features/auth/keycloak";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(clearAuth());
    logout();
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">Fitness App</span>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

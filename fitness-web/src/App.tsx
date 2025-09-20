import React from "react";
import { Outlet } from "react-router-dom";
import Protected from "./routes/Protected";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  return (
    <Protected>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </Protected>
  );
};

export default App;

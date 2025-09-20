import React from "react";
import ActivityForm from "../components/ActivityForm";
import TokenMonitor from "../components/TokenMonitor";

const Home: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fitness Tracker</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Ready to log your workout?
        </p>
      </header>

      {/* Token Monitor for Testing */}
      <TokenMonitor />

      <main>
        <ActivityForm />
      </main>
    </div>
  );
};

export default Home;

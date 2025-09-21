import React from "react";
import ActivityForm from "../components/ActivityForm";
import TokenMonitor from "../components/TokenMonitor";
import ActivityList from "../components/ActivityList";
import { useActivities } from "../hooks/useActivities";

const Home: React.FC = () => {
  const activitiesData = useActivities();
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fitness Tracker</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Ready to log your workout?
        </p>
      </header>

      {/* Token Monitor for Testing */}
      <TokenMonitor />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <main>
          <ActivityForm onActivityAdded={activitiesData.refreshActivities} />
        </main>

        <aside>
          <ActivityList activitiesData={activitiesData} />
        </aside>
      </div>
    </div>
  );
};

export default Home;

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useActivityPolling } from "../features/activities/useActivityPolling";
import { useAppSelector } from "../app/hooks";
import type { ActivityResponse } from "../types/activity";

// Component definition with explicit typing
const ActivityDetails: React.FC = () => {
  const { id = "" } = useParams<string>();
  const token = useAppSelector((state) => state.auth.token);

  // Use the activity polling hook
  useActivityPolling(id, token ?? undefined);

  // Get activity from Redux store
  const activity: ActivityResponse | undefined = useAppSelector(
    (state) => state.activities.byId[id]
  );

  // Set document title when component mounts or id changes
  useEffect(() => {
    if (id) {
      document.title = `Activity #${id} - Fitness App`;
    }

    // Cleanup function to reset title
    return () => {
      document.title = "Fitness App";
    };
  }, [id]);

  // Loading state
  if (!activity) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Fetching activity...</span>
        </div>
      </div>
    );
  }

  // Render activity details
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Activity #{activity.id}
        </h1>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Status: {activity.status}
          </span>
        </div>
      </header>

      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Activity Details
        </h2>
        <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm overflow-auto">
          {JSON.stringify(activity, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default ActivityDetails;

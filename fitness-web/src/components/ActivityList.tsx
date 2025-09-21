import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { ActivityWithRecommendation } from "../types/activity";

interface ActivityListProps {
  activitiesData: {
    activities: ActivityWithRecommendation[];
    loading: boolean;
    error: string | null;
    refreshActivities: () => void;
  };
}

const LOADING_SKELETON_COUNT = 3;

const ActivityList: React.FC<ActivityListProps> = ({ activitiesData }) => {
  const { activities, loading, error, refreshActivities } = activitiesData;
  const navigate = useNavigate();

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getRecommendationBadge = useCallback((status: string) => {
    switch (status) {
      case "available":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            ✨ AI Ready
          </span>
        );
      case "loading":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            🤖 AI Processing...
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
            No AI
          </span>
        );
    }
  }, []);

  const formatActivityType = useCallback((type: string): string => {
    return type.replace("_", " ");
  }, []);

  const handleActivityClick = useCallback(
    (activityId: string) => {
      navigate(`/activity/${activityId}`);
    },
    [navigate]
  );

  const renderLoadingSkeleton = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Your Activities</h2>
      <div className="animate-pulse space-y-4">
        {Array.from({ length: LOADING_SKELETON_COUNT }, (_, index) => (
          <div key={`skeleton-${index}`} className="h-20 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );

  const renderError = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={refreshActivities}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  const renderEmptyState = () => (
    <p className="text-gray-500 text-center py-8">
      No activities yet. Start by tracking your first workout!
    </p>
  );

  const renderActivityItem = (activity: ActivityWithRecommendation) => (
    <div
      key={activity.id}
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => handleActivityClick(activity.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivityClick(activity.id);
        }
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-medium text-gray-900">
              {formatActivityType(activity.type)}
            </h3>
            {getRecommendationBadge(activity.recommendationStatus)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
            <div>
              <span className="font-medium">Duration:</span> {activity.duration}{" "}
              mins
            </div>
            <div>
              <span className="font-medium">Calories:</span>{" "}
              {activity.caloriesBurned}
            </div>
            <div>
              <span className="font-medium">Date:</span>{" "}
              {formatDate(activity.startTime)}
            </div>
          </div>

          {activity.recommendation && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800 line-clamp-3">
                <span className="font-semibold">AI Insight:</span>{" "}
                {activity.recommendation.recommendation}
              </p>
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderLoadingSkeleton();
  }

  if (error) {
    return renderError();
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Activities</h2>
        <button
          onClick={refreshActivities}
          className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
          type="button"
        >
          Refresh
        </button>
      </header>

      {activities.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-4" role="list">
          {activities.map(renderActivityItem)}
        </div>
      )}
    </div>
  );
};

export default ActivityList;

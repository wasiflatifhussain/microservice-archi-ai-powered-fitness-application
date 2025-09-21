import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useActivities } from "../hooks/useActivities";

const ActivityDetails: React.FC = () => {
  const { id = "" } = useParams<string>();
  const navigate = useNavigate();
  const { activities, loading, error } = useActivities();

  // Find the specific activity from the list
  const activity = activities.find((act) => act.id === id);
  const recommendation = activity?.recommendation;

  useEffect(() => {
    if (id) {
      document.title = `Activity #${id} - Fitness App`;
    }

    return () => {
      document.title = "Fitness App";
    };
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatActivityType = (type: string) => {
    return type.replace("_", " ");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading activities...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Activity Not Found
          </h2>
          <p className="text-yellow-600">
            The activity with ID "{id}" was not found.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center space-x-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back to Activities</span>
        </button>

        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {formatActivityType(activity.type)} Activity
          </h1>
          <p className="text-gray-600 mt-1">{formatDate(activity.startTime)}</p>
        </header>
      </div>

      <div className="space-y-6">
        {/* Activity Basic Info */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Activity Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activity.duration}
              </div>
              <div className="text-sm text-gray-500">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {activity.caloriesBurned}
              </div>
              <div className="text-sm text-gray-500">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatActivityType(activity.type)}
              </div>
              <div className="text-sm text-gray-500">Activity Type</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(activity.additionalMetrics || {}).length}
              </div>
              <div className="text-sm text-gray-500">Extra Metrics</div>
            </div>
          </div>

          {Object.keys(activity.additionalMetrics || {}).length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">
                Additional Metrics
              </h3>
              <div className="bg-gray-50 rounded-md p-4">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(activity.additionalMetrics, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>

        {/* AI Recommendations */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            🤖 AI Recommendations
          </h2>

          {recommendation ? (
            <div className="space-y-6">
              {/* Main Recommendation */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Analysis</h3>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-md">
                  {recommendation.recommendation}
                </p>
              </div>

              {/* Improvements */}
              {recommendation.improvements &&
                recommendation.improvements.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      💡 Improvements
                    </h3>
                    <ul className="space-y-2">
                      {recommendation.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span className="text-gray-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Suggestions */}
              {recommendation.suggestions &&
                recommendation.suggestions.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      🎯 Workout Suggestions
                    </h3>
                    <div className="space-y-3">
                      {recommendation.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-md">
                          <p className="text-green-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Safety */}
              {recommendation.safety && recommendation.safety.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    ⚠️ Safety Tips
                  </h3>
                  <ul className="space-y-2">
                    {recommendation.safety.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4">
                Generated: {formatDate(recommendation.createdAt)}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="text-yellow-600 mb-2">
                  🤖 AI is analyzing your activity...
                </div>
                <p className="text-gray-500 text-sm">
                  This usually takes a few moments. The page will update
                  automatically.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Raw Data (for debugging) */}
        <details className="bg-white shadow rounded-lg p-6">
          <summary className="cursor-pointer font-medium text-gray-900 mb-2">
            🔍 Debug Information
          </summary>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Activity Data</h4>
              <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm overflow-auto">
                {JSON.stringify(activity, null, 2)}
              </pre>
            </div>
            {recommendation && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Recommendation Data
                </h4>
                <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm overflow-auto">
                  {JSON.stringify(recommendation, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
};

export default ActivityDetails;

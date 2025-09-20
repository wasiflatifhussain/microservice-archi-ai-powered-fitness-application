import React, { useState, useCallback } from "react";
import { useAuthenticatedApi } from "../hooks/useApi";
import { getCurrentKeycloakId } from "../features/auth/keycloak";
import type {
  ActivityType,
  ActivityTrackRequest,
  ActivityResponse,
} from "../types/activity";

interface ActivityFormData {
  activityType: ActivityType;
  duration: number;
  caloriesBurned: number;
  startTime: string;
  additionalMetrics: string;
}

const ACTIVITY_TYPES: ActivityType[] = [
  "RUNNING",
  "CYCLING",
  "SWIMMING",
  "WEIGHT_TRAINING",
  "YOGA",
  "CARDIO",
  "STRETCHING",
  "OTHER",
];

const INITIAL_FORM_DATA: ActivityFormData = {
  activityType: "RUNNING",
  duration: 0,
  caloriesBurned: 0,
  startTime: "",
  additionalMetrics: "{}",
};

const ActivityForm: React.FC = () => {
  const authenticatedApi = useAuthenticatedApi();

  const [formData, setFormData] = useState<ActivityFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetMessages = useCallback((): void => {
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  const resetForm = useCallback((): void => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const parseMetrics = (metricsString: string) => {
    const trimmed = metricsString.trim() || "{}";
    if (!trimmed) return {};

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      throw new Error("Invalid JSON format in Additional Metrics: " + error);
    }
  };

  const buildRequestData = (parsedMetrics: object): ActivityTrackRequest => {
    const keycloakId = getCurrentKeycloakId();
    if (!keycloakId) {
      throw new Error("Unable to get Keycloak ID from token");
    }

    return {
      keycloakId,
      activityType: formData.activityType,
      duration: formData.duration,
      caloriesBurned: formData.caloriesBurned,
      startTime: formData.startTime,
      additionalMetrics: parsedMetrics,
    };
  };

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ): void => {
      const { name, value } = e.target;

      setFormData((prev) => {
        if (
          name === "activityType" ||
          name === "additionalMetrics" ||
          name === "startTime"
        ) {
          return { ...prev, [name]: value };
        }

        if (name === "duration" || name === "caloriesBurned") {
          return { ...prev, [name]: Number(value) || 0 };
        }

        return { ...prev, [name]: value };
      });
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setIsSubmitting(true);
      resetMessages();

      try {
        const parsedMetrics = parseMetrics(formData.additionalMetrics);
        const requestData = buildRequestData(parsedMetrics);

        console.log("Request payload:", requestData);

        const response = await authenticatedApi<ActivityResponse>(
          "/api/activities/track",
          {
            method: "POST",
            body: requestData,
          }
        );

        if (response) {
          setSuccessMessage(
            `Activity tracked successfully! ID: ${response.id}`
          );
          resetForm();
        } else {
          setErrorMessage("Activity tracking failed. Please try again.");
        }
      } catch (error) {
        console.error("API Error:", error);
        const message =
          error instanceof Error ? error.message : "An error occurred";
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, authenticatedApi, resetForm, resetMessages]
  );

  const formatActivityType = (type: ActivityType): string => {
    return type.replace("_", " ");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Track New Activity
        </h2>
        <p className="text-gray-600">Log your workout details</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="activityType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Activity Type
          </label>
          <select
            id="activityType"
            name="activityType"
            value={formData.activityType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatActivityType(type)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration || ""}
            onChange={handleInputChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="caloriesBurned"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Calories Burned
          </label>
          <input
            type="number"
            id="caloriesBurned"
            name="caloriesBurned"
            value={formData.caloriesBurned || ""}
            onChange={handleInputChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Time
          </label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="additionalMetrics"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Additional Metrics (JSON format)
          </label>
          <textarea
            id="additionalMetrics"
            name="additionalMetrics"
            value={formData.additionalMetrics}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='{"laps": 20, "poolLength": 25, "avgStrokeRate": 32}'
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter JSON format: {"{"}"key": "value", "key2": "value2"{"}"}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSubmitting ? "Tracking Activity..." : "Track Activity"}
        </button>
      </form>
    </div>
  );
};

export default ActivityForm;

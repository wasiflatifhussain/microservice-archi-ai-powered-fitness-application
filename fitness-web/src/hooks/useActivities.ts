import { useState, useEffect, useCallback, useRef } from "react";
import { authenticatedApiWithKeycloakId, authenticatedApi } from "../utils/api";
import {
  ensureTokenValid,
  keycloak,
  getCurrentKeycloakId,
} from "../features/auth/keycloak";
import type {
  ActivityResponse,
  Recommendation,
  ActivityWithRecommendation,
} from "../types/activity";

export const useActivities = () => {
  const [activities, setActivities] = useState<ActivityWithRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track polling state without causing re-renders
  const pollingIntervalRef = useRef<number | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFirstLoadRef = useRef(true);

  const fetchActivitiesAndRecommendations = useCallback(
    async (skipLoading = false) => {
      const now = Date.now();
      if (now - lastFetchTimeRef.current < 5000 && !isFirstLoadRef.current) {
        return;
      }
      lastFetchTimeRef.current = now;

      if (!skipLoading) setLoading(true);

      try {
        const isTokenValid = await ensureTokenValid();
        if (!isTokenValid) throw new Error("Authentication required");

        const token = keycloak.token!;
        const keycloakId = getCurrentKeycloakId()!;

        const activitiesData = await authenticatedApiWithKeycloakId<
          ActivityResponse[]
        >("/api/activities/getUserActivities", token, keycloakId);

        const recommendationsData = await authenticatedApi<Recommendation[]>(
          `/api/recommendations/getUserRecommendations/${keycloakId}`,
          token
        );

        const recommendationsMap = new Map<string, Recommendation>();
        recommendationsData.forEach((rec) => {
          recommendationsMap.set(rec.activityId, rec);
        });

        const activitiesWithRecommendations: ActivityWithRecommendation[] =
          activitiesData.map((activity) => {
            const recommendation = recommendationsMap.get(activity.id);
            return {
              ...activity,
              recommendation,
              recommendationStatus: recommendation ? "available" : "loading",
            };
          });

        setActivities(activitiesWithRecommendations);
        setError(null);
        isFirstLoadRef.current = false;
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load activities"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshActivities = useCallback(() => {
    console.log("Manual refresh triggered");
    fetchActivitiesAndRecommendations();
  }, [fetchActivitiesAndRecommendations]);

  const setupPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const hasLoadingRecommendations = activities.some(
      (activity) => activity.recommendationStatus === "loading"
    );

    if (hasLoadingRecommendations && activities.length > 0) {
      pollingIntervalRef.current = setInterval(() => {
        fetchActivitiesAndRecommendations(true);
      }, 10000); // 10 seconds
    }
  }, [activities, fetchActivitiesAndRecommendations]);

  // Initial fetch
  useEffect(() => {
    fetchActivitiesAndRecommendations();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Setup polling when activities change
  useEffect(() => {
    if (!isFirstLoadRef.current) {
      setupPolling();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [setupPolling]);

  return {
    activities,
    loading,
    error,
    refreshActivities,
  };
};

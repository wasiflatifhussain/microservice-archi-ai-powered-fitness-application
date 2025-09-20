import { useEffect, useRef } from "react";
import { api } from "../../services/api";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { upsert } from "./activitiesSlice";
import type { ActivityResponse } from "../../types/activity";

const schedule = [1000, 2000, 4000, 8000, 8000, 8000];

export function useActivityPolling(activityId: string, token?: string) {
  const dispatch = useAppDispatch();
  const visibleRef = useRef(document.visibilityState === "visible");
  const activity = useAppSelector((s) => s.activities.byId[activityId]);

  useEffect(() => {
    const onVis = () =>
      (visibleRef.current = document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const jitter = (ms: number) => {
      const j = ms * 0.2;
      return ms + (Math.random() * 2 - 1) * j; // ±20%
    };

    const shouldStop = (a?: ActivityResponse) =>
      !a || a.status === "READY" || a.status === "FAILED";

    async function poll() {
      for (let i = 0; i < schedule.length; i++) {
        if (cancelled) return;
        try {
          const data = await api<ActivityResponse>(
            `/api/activities/${activityId}`,
            { token }
          );
          dispatch(upsert(data));
          if (shouldStop(data)) return; // stop when READY or FAILED
        } catch (e) {
          // surface error state via a FAILED placeholder if needed
          // but keep trying until attempts exhausted
        }

        const delay = jitter(schedule[i]);
        const end = Date.now() + delay;
        while (Date.now() < end) {
          if (cancelled) return;
          if (!visibleRef.current) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          await new Promise((r) => setTimeout(r, 50));
        }
      }
    }

    // start polling only if we don't already have READY in cache
    if (!shouldStop(activity)) poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);
}

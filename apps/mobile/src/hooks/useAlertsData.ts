import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { fetchAlerts } from "../api/client";
import type { Alert } from "../types/api";

const DEFAULT_POLL_MS = 15_000;

export function useAlertsData(
  token: string | undefined,
  options?: { pollMs?: number; pollingEnabled?: boolean },
) {
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;
  const pollingEnabled = options?.pollingEnabled ?? true;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badgeAnimationKeys, setBadgeAnimationKeys] = useState<Record<string, number>>(
    {},
  );

  const previousStatusRef = useRef<Map<string, Alert["status"]>>(new Map());

  const applyAlerts = useCallback((nextAlerts: Alert[]) => {
    setAlerts(nextAlerts);

    setBadgeAnimationKeys((current) => {
      const nextKeys = { ...current };
      let animationKeysChanged = false;

      for (const alert of nextAlerts) {
        const previousStatus = previousStatusRef.current.get(alert.id);

        if (previousStatus === "ACTIVE" && alert.status === "TRIGGERED") {
          nextKeys[alert.id] = (current[alert.id] ?? 0) + 1;
          animationKeysChanged = true;
        }

        previousStatusRef.current.set(alert.id, alert.status);
      }

      return animationKeysChanged ? nextKeys : current;
    });
  }, []);

  const loadAlerts = useCallback(
    async (silent = false) => {
      if (!token) {
        return;
      }

      if (!silent) {
        setRefreshing(true);
      }

      try {
        const nextAlerts = await fetchAlerts(token);
        applyAlerts(nextAlerts);
        setError(null);
      } catch {
        setError("Unable to load alerts.");
      } finally {
        if (!silent) {
          setRefreshing(false);
        }
      }
    },
    [applyAlerts, token],
  );

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (!pollingEnabled || !token) {
      return;
    }

    const intervalId = setInterval(() => {
      void loadAlerts(true);
    }, pollMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadAlerts, pollMs, pollingEnabled, token]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void loadAlerts(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadAlerts]);

  useEffect(() => {
    let receivedSubscription: { remove: () => void } | undefined;
    let responseSubscription: { remove: () => void } | undefined;

    async function subscribeToNotifications() {
      const Notifications = await import("expo-notifications");

      receivedSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          const payload = notification.request.content.data;

          if (payload?.type === "price-alert") {
            void loadAlerts(true);
          }
        },
      );

      responseSubscription =
        Notifications.addNotificationResponseReceivedListener(() => {
          void loadAlerts(true);
        });
    }

    void subscribeToNotifications();

    return () => {
      receivedSubscription?.remove();
      responseSubscription?.remove();
    };
  }, [loadAlerts]);

  return {
    alerts,
    badgeAnimationKeys,
    error,
    loadAlerts,
    refreshing,
  };
}

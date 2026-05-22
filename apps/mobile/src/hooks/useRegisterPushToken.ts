import Constants from "expo-constants";
import * as Device from "expo-device";
import { useEffect } from "react";
import { Platform } from "react-native";

import { registerDeviceToken } from "../api/client";

function canAttemptPushRegistration() {
  if (Platform.OS === "web") {
    return false;
  }

  if (Device.isDevice) {
    return true;
  }

  // Android emulators with Google Play can obtain FCM tokens in dev builds.
  return Platform.OS === "android";
}

export function useRegisterPushToken(sessionToken: string | undefined) {
  useEffect(() => {
    if (!sessionToken) {
      return;
    }

    const authToken = sessionToken;

    async function registerForPushNotifications() {
      console.log("[push] registerForPushNotifications started", {
        isDevice: Device.isDevice,
        platform: Platform.OS,
        executionEnvironment: Constants.executionEnvironment,
        deviceType: Device.deviceType,
        modelName: Device.modelName,
      });

      if (!canAttemptPushRegistration()) {
        console.warn(
          "[push] Skipping: push registration is not supported in this environment",
          { platform: Platform.OS, isDevice: Device.isDevice },
        );
        return;
      }

      if (!Device.isDevice && Platform.OS === "android") {
        console.log(
          "[push] Android emulator: attempting FCM registration (requires Google Play image + dev build)",
        );
      }

      const isExpoGoOnAndroid =
        Platform.OS === "android" &&
        Constants.executionEnvironment === "storeClient";

      if (isExpoGoOnAndroid) {
        console.warn(
          "[push] Skipping: Expo Go on Android. Use a development build to test Firebase push notifications.",
        );
        return;
      }

      const Notifications = await import("expo-notifications");

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("price-alerts", {
          name: "Price alerts",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#22c55e",
        });
      }

      const permission = await Notifications.requestPermissionsAsync();

      console.log("[push] notification permission", {
        status: permission.status,
        granted: permission.granted,
      });

      if (permission.status !== "granted") {
        console.warn("[push] Skipping: notification permission not granted");
        return;
      }

      try {
        const token = await Notifications.getDevicePushTokenAsync();

        console.log("[push] getDevicePushTokenAsync", {
          hasToken: Boolean(token.data),
          tokenPreview: token.data
            ? `${token.data.slice(0, 12)}...`
            : null,
        });

        if (!token.data) {
          console.warn("[push] Skipping: push token data is empty");
          return;
        }

        await registerDeviceToken(authToken, {
          deviceToken: token.data,
          platform: Platform.OS,
        });

        console.log("[push] Device token registered with API");
      } catch (error) {
        console.warn("[push] Unable to register device token", error);
      }
    }

    void registerForPushNotifications();
  }, [sessionToken]);
}

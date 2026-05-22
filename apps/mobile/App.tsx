import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useRegisterPushToken } from "./src/hooks/useRegisterPushToken";
import type { RootStackParamList } from "./src/navigation/types";
import { AuthProvider, useAuth } from "./src/providers/AuthProvider";
import { AlertsScreen } from "./src/screens/AlertsScreen";
import { CreateAlertScreen } from "./src/screens/CreateAlertScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { StockDetailScreen } from "./src/screens/StockDetailScreen";
import { StocksScreen } from "./src/screens/StocksScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { session, isBootstrapping } = useAuth();

  useRegisterPushToken(session?.token);

  if (isBootstrapping) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#22c55e" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#020617",
          },
          headerTintColor: "#f8fafc",
          contentStyle: {
            backgroundColor: "#020617",
          },
        }}
      >
        {session ? (
          <>
            <Stack.Screen
              component={StocksScreen}
              name="Stocks"
              options={{ title: "Stocks", headerShown: false }}
            />
            <Stack.Screen
              component={StockDetailScreen}
              name="StockDetail"
              options={({ route }) => ({ title: route.params.symbol })}
            />
            <Stack.Screen
              component={AlertsScreen}
              name="Alerts"
              options={{ title: "Price Alerts" }}
            />
            <Stack.Screen
              component={CreateAlertScreen}
              name="CreateAlert"
              options={{ title: "Create Alert" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
            >
              {({ navigation }) => (
                <LoginScreen
                  onRegisterPress={() => navigation.navigate("Register")}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Register"
              options={{ headerShown: false }}
            >
              {({ navigation }) => (
                <RegisterScreen onLoginPress={() => navigation.navigate("Login")} />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#020617",
    card: "#020617",
    primary: "#22c55e",
    text: "#f8fafc",
    border: "#111827",
  },
};

export default function App() {
  useEffect(() => {
    const isExpoGoOnAndroid =
      Constants.platform?.android &&
      Constants.executionEnvironment === "storeClient";

    if (isExpoGoOnAndroid) {
      return;
    }

    async function configureNotifications() {
      const Notifications = await import("expo-notifications");
      const { Platform } = await import("react-native");

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("price-alerts", {
          name: "Price alerts",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#22c55e",
        });
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }

    void configureNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
});

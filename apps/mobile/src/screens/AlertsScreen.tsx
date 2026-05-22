import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlertListItem } from "../components/AlertListItem";
import { useAlertsData } from "../hooks/useAlertsData";
import type { ScreenProps } from "../navigation/types";
import { useAuth } from "../providers/AuthProvider";

export function AlertsScreen({ navigation }: ScreenProps<"Alerts">) {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { alerts, badgeAnimationKeys, error, loadAlerts, refreshing } = useAlertsData(
    session?.token,
    { pollingEnabled: isFocused },
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      void loadAlerts(true);
    });

    return unsubscribe;
  }, [loadAlerts, navigation]);

  const handleRefresh = useCallback(() => {
    void loadAlerts(false);
  }, [loadAlerts]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.contentColumn}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Price alerts</Text>
            <Text style={styles.subtitle}>
              Track your active thresholds and triggered notifications.
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("CreateAlert", {})}
            style={styles.actionButton}
          >
            <Text style={styles.actionLabel}>New alert</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={alerts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#f8fafc"
            onRefresh={handleRefresh}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <AlertListItem
              alert={item}
              badgeAnimationKey={badgeAnimationKeys[item.id] ?? 0}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <Text style={styles.empty}>
              No alerts yet. Create one from a stock detail screen or here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  contentColumn: {
    width: "100%",
    maxWidth: 460,
  },
  header: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 16,
    marginBottom: 16,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 4,
    maxWidth: 250,
  },
  actionButton: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "flex-start",
    minWidth: 124,
    alignItems: "center",
  },
  actionLabel: {
    color: "#0f172a",
    fontWeight: "700",
  },
  error: {
    color: "#fca5a5",
    marginBottom: 12,
  },
  list: {
    width: "100%",
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
    alignItems: "center",
  },
  itemWrapper: {
    width: "100%",
    maxWidth: 460,
  },
  empty: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyWrapper: {
    width: "100%",
    maxWidth: 460,
    marginTop: 32,
    alignItems: "center",
  },
});

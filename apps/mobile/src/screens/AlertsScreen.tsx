import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fetchAlerts } from "../api/client";
import { SectionCard } from "../components/Ui";
import type { ScreenProps } from "../navigation/types";
import { useAuth } from "../providers/AuthProvider";
import type { Alert } from "../types/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AlertsScreen({ navigation }: ScreenProps<"Alerts">) {
  const { session } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const loadAlerts = useCallback(async () => {
    if (!session?.token) {
      return;
    }

    try {
      setRefreshing(true);
      const nextAlerts = await fetchAlerts(session.token);
      setAlerts(nextAlerts);
      setError(null);
    } catch {
      setError("Unable to load alerts.");
    } finally {
      setRefreshing(false);
    }
  }, [session?.token]);

  useEffect(() => {
    void loadAlerts();

    const unsubscribe = navigation.addListener("focus", () => {
      void loadAlerts();
    });

    return unsubscribe;
  }, [loadAlerts, navigation]);

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
            onRefresh={() => void loadAlerts()}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <SectionCard>
              <View style={styles.row}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <View
                  style={[
                    styles.badge,
                    item.status === "ACTIVE" ? styles.badgeActive : styles.badgeDone,
                  ]}
                >
                  <Text style={styles.badgeLabel}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.detail}>
                Target ${item.targetPrice.toFixed(2)} · Latest{" "}
                {item.currentPrice ? `$${item.currentPrice.toFixed(2)}` : "N/A"}
              </Text>
              <Text style={styles.meta}>
                Created {new Date(item.createdAt).toLocaleString()}
              </Text>
            </SectionCard>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  symbol: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeActive: {
    backgroundColor: "rgba(56, 189, 248, 0.2)",
  },
  badgeDone: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  badgeLabel: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "700",
  },
  detail: {
    color: "#e2e8f0",
    fontSize: 15,
  },
  meta: {
    color: "#94a3b8",
    fontSize: 13,
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

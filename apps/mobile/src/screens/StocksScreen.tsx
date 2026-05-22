import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fetchStocks } from "../api/client";
import { SectionCard } from "../components/Ui";
import type { ScreenProps } from "../navigation/types";
import { useAuth } from "../providers/AuthProvider";
import type { StockQuote } from "../types/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const REFRESH_INTERVAL_SECONDS = 10;
const marketBannerUri =
  "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200";

export function StocksScreen({ navigation }: ScreenProps<"Stocks">) {
  const { session, logout } = useAuth();
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(
    REFRESH_INTERVAL_SECONDS,
  );
  const insets = useSafeAreaInsets();

  const marketSummary = useMemo(() => {
    const advancing = stocks.filter((stock) => stock.change >= 0).length;

    return {
      total: stocks.length,
      advancing,
      declining: stocks.length - advancing,
    };
  }, [stocks]);

  const refreshProgress = useMemo(
    () => (secondsUntilRefresh / REFRESH_INTERVAL_SECONDS) * 100,
    [secondsUntilRefresh],
  );

  const loadStocks = useCallback(async (options?: { refreshing?: boolean }) => {
    try {
      if (options?.refreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetchStocks();
      setStocks(response.stocks);
      setError(null);
    } catch {
      setError("Unable to load market data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStocks();
  }, [loadStocks]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsUntilRefresh((current) => {
        if (current <= 1) {
          void loadStocks({ refreshing: true });
          return REFRESH_INTERVAL_SECONDS;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [loadStocks]);

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        data={stocks}
        keyExtractor={(item) => item.symbol}
        ListHeaderComponent={
          <View style={styles.headerColumn}>
            <View style={styles.heroCard}>
              <ImageBackground
                imageStyle={styles.heroImage}
                source={{ uri: marketBannerUri }}
                style={styles.heroBanner}
              >
                <View style={styles.heroImageTint} />
              </ImageBackground>

              <View style={styles.heroBody}>
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>Live market overview</Text>
                </View>

                <Text style={styles.title}>Stocks</Text>
                <Text style={styles.subtitle}>
                  Hello {session?.user.name}. Watch market movers and create
                  alerts with a layout designed for mobile.
                </Text>

                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => navigation.navigate("Alerts")}
                    style={[styles.headerButton, styles.primaryHeaderButton]}
                  >
                    <Text style={styles.primaryHeaderButtonLabel}>Alerts</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void logout()}
                    style={[styles.headerButton, styles.secondaryHeaderButton]}
                  >
                    <Text style={styles.secondaryHeaderButtonLabel}>Log out</Text>
                  </Pressable>
                </View>

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Tracked</Text>
                    <Text style={styles.summaryValue}>{marketSummary.total}</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Advancing</Text>
                    <Text style={[styles.summaryValue, styles.positive]}>
                      {marketSummary.advancing}
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Declining</Text>
                    <Text style={[styles.summaryValue, styles.negative]}>
                      {marketSummary.declining}
                    </Text>
                  </View>
                  <View style={[styles.summaryCard, styles.refreshCard]}>
                    <View style={styles.refreshHeader}>
                      <View>
                        <Text style={styles.summaryLabel}>Auto refresh</Text>
                        <Text style={styles.refreshCountdown}>
                          {refreshing
                            ? "Refreshing now"
                            : `Refreshing in ${secondsUntilRefresh}s`}
                        </Text>
                      </View>
                      <ActivityIndicator
                        color="#38bdf8"
                        animating={refreshing}
                        hidesWhenStopped={false}
                        size="small"
                      />
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${refreshProgress}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#22c55e" size="large" />
            </View>
          ) : (
            <Text style={styles.empty}>No stocks available.</Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#f8fafc"
            onRefresh={() => void loadStocks({ refreshing: true })}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("StockDetail", { symbol: item.symbol })
            }
            style={styles.stockCardWrapper}
          >
            <SectionCard>
              <View style={styles.stockCardHeader}>
                <View style={styles.symbolPill}>
                  <Text style={styles.symbolPillLabel}>{item.symbol}</Text>
                </View>
                <View
                  style={[
                    styles.trendPill,
                    item.change >= 0 ? styles.trendPillUp : styles.trendPillDown,
                  ]}
                >
                  <Text
                    style={[
                      styles.trendPillLabel,
                      item.change >= 0 ? styles.positive : styles.negative,
                    ]}
                  >
                    {item.percentChange >= 0 ? "Bullish" : "Bearish"}
                  </Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.priceColumn}>
                  <Text style={styles.price}>${item.currentPrice.toFixed(2)}</Text>
                  <Text style={styles.meta}>Current market price</Text>
                </View>

                <View style={styles.changeColumn}>
                  <Text
                    style={[
                      styles.change,
                      item.change >= 0 ? styles.positive : styles.negative,
                    ]}
                  >
                    {item.change >= 0 ? "+" : ""}
                    {item.change.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.percent,
                      item.percentChange >= 0 ? styles.positive : styles.negative,
                    ]}
                  >
                    {item.percentChange >= 0 ? "+" : ""}
                    {item.percentChange.toFixed(2)}%
                  </Text>
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Open</Text>
                  <Text style={styles.metricValue}>${item.open.toFixed(2)}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>High</Text>
                  <Text style={styles.metricValue}>${item.high.toFixed(2)}</Text>
                </View>
                <View style={styles.metricItemFull}>
                  <Text style={styles.metricLabel}>Low</Text>
                  <Text style={styles.metricValue}>${item.low.toFixed(2)}</Text>
                </View>
              </View>

              <Text style={styles.cardFooter}>Tap to open the detailed quote view</Text>
            </SectionCard>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  listContent: {
    width: "100%",
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 12,
  },
  headerColumn: {
    width: "100%",
    maxWidth: 392,
    marginBottom: 12,
  },
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    backgroundColor: "#08101f",
  },
  heroBanner: {
    height: 132,
    justifyContent: "flex-end",
  },
  heroImage: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  heroImageTint: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.48)",
  },
  heroBody: {
    padding: 16,
    gap: 14,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeLabel: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  title: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: "column",
    gap: 10,
  },
  headerButton: {
    width: "100%",
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryHeaderButton: {
    backgroundColor: "#22c55e",
  },
  primaryHeaderButtonLabel: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryHeaderButton: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "#334155",
  },
  secondaryHeaderButtonLabel: {
    color: "#cbd5e1",
    fontWeight: "700",
    fontSize: 15,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    width: "48.5%",
    minWidth: 0,
    backgroundColor: "rgba(15, 23, 42, 0.74)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.08)",
  },
  refreshCard: {
    width: "100%",
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8,
  },
  refreshHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  refreshCountdown: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    overflow: "hidden",
    marginTop: 14,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#38bdf8",
  },
  error: {
    color: "#fca5a5",
    fontSize: 14,
  },
  stockCardWrapper: {
    width: "100%",
    maxWidth: 392,
    marginBottom: 12,
  },
  stockCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  symbolPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(59, 130, 246, 0.16)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  symbolPillLabel: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  trendPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trendPillUp: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
  },
  trendPillDown: {
    backgroundColor: "rgba(248, 113, 113, 0.12)",
  },
  trendPillLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  priceColumn: {
    flex: 1,
    minWidth: 160,
  },
  changeColumn: {
    alignItems: "flex-start",
    minWidth: 92,
  },
  price: {
    color: "#e2e8f0",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 4,
  },
  meta: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 6,
  },
  change: {
    fontSize: 18,
    fontWeight: "700",
  },
  percent: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  positive: {
    color: "#4ade80",
  },
  negative: {
    color: "#f87171",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricItem: {
    width: "48.5%",
    minWidth: 0,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.08)",
  },
  metricItemFull: {
    width: "100%",
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.08)",
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metricValue: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  cardFooter: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
  },
  loadingState: {
    paddingTop: 60,
    alignItems: "center",
  },
  empty: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 32,
  },
});

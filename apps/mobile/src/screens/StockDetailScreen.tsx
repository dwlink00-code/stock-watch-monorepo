import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

import { fetchStockDetails } from "../api/client";
import { PrimaryButton, SectionCard } from "../components/Ui";
import type { ScreenProps } from "../navigation/types";
import type { StockDetailsResponse } from "../types/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function StockDetailScreen({
  navigation,
  route,
}: ScreenProps<"StockDetail">) {
  const [data, setData] = useState<StockDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width - 32, 460);

  const loadDetails = useCallback(async () => {
    try {
      const response = await fetchStockDetails(route.params.symbol);
      setData(response);
      setError(null);
    } catch {
      setError("Unable to load stock details.");
    }
  }, [route.params.symbol]);

  useEffect(() => {
    void loadDetails();

    const intervalId = setInterval(() => {
      void loadDetails();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [loadDetails]);

  const chartData = useMemo(() => {
    const candles = data?.candles.slice(-7) ?? [];

    return {
      labels: candles.map((candle) =>
        new Date(candle.timestamp * 1000).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      ),
      datasets: [
        {
          data: candles.map((candle) => candle.close),
        },
      ],
    };
  }, [data?.candles]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.contentColumn}>
        <Text style={styles.symbol}>{route.params.symbol}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {data ? (
          <>
            <SectionCard title="Live quote">
              <Text style={styles.price}>${data.quote.currentPrice.toFixed(2)}</Text>
              <Text
                style={[
                  styles.change,
                  data.quote.change >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {data.quote.change >= 0 ? "+" : ""}
                {data.quote.change.toFixed(2)} ({data.quote.percentChange.toFixed(2)}
                %)
              </Text>
              <Text style={styles.meta}>
                Open ${data.quote.open.toFixed(2)} · High ${data.quote.high.toFixed(2)}
                {" · "}Low ${data.quote.low.toFixed(2)}
              </Text>
            </SectionCard>

            <SectionCard title="Last 7 market points">
              {chartData.datasets[0].data.length > 0 ? (
                <LineChart
                  bezier
                  chartConfig={{
                    backgroundColor: "#111827",
                    backgroundGradientFrom: "#111827",
                    backgroundGradientTo: "#111827",
                    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                    decimalPlaces: 2,
                    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#22c55e",
                    },
                  }}
                  data={chartData}
                  fromZero={false}
                  height={240}
                  segments={4}
                  width={contentWidth - 40}
                  yLabelsOffset={8}
                />
              ) : (
                <Text style={styles.meta}>No recent candle data available.</Text>
              )}
            </SectionCard>

            <PrimaryButton
              label="Create price alert"
              onPress={() =>
                navigation.navigate("CreateAlert", { symbol: route.params.symbol })
              }
            />
          </>
        ) : (
          <Text style={styles.meta}>Loading stock details...</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    gap: 16,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  contentColumn: {
    width: "100%",
    maxWidth: 460,
    gap: 16,
  },
  symbol: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
  },
  price: {
    color: "#f8fafc",
    fontSize: 34,
    fontWeight: "800",
  },
  change: {
    fontSize: 16,
    fontWeight: "700",
  },
  positive: {
    color: "#4ade80",
  },
  negative: {
    color: "#f87171",
  },
  meta: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
  },
  error: {
    color: "#fca5a5",
  },
});

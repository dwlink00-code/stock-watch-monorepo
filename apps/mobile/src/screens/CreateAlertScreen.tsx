import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { createAlert } from "../api/client";
import { FormInput, PrimaryButton, SectionCard } from "../components/Ui";
import type { ScreenProps } from "../navigation/types";
import { useAuth } from "../providers/AuthProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const symbolOptions = [
  "AAPL",
  "AMZN",
  "GOOGL",
  "MSFT",
  "META",
  "NVDA",
  "NFLX",
  "TSLA",
] as const;

export function CreateAlertScreen({
  navigation,
  route,
}: ScreenProps<"CreateAlert">) {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [symbol, setSymbol] = useState(route.params.symbol ?? "AAPL");
  const [targetPrice, setTargetPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateAlert() {
    if (!session?.token) {
      return;
    }

    const parsedTargetPrice = Number(targetPrice);

    if (!Number.isFinite(parsedTargetPrice) || parsedTargetPrice <= 0) {
      setError("Enter a valid target price.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createAlert(session.token, {
        symbol: symbol.trim().toUpperCase(),
        targetPrice: parsedTargetPrice,
      });
      navigation.goBack();
    } catch {
      setError("Unable to create the alert.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.contentColumn}>
        <Text style={styles.title}>Create stock alert</Text>
        <Text style={styles.subtitle}>
          We will notify this device when the market price moves above the value you
          set.
        </Text>

        <SectionCard>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Select stock</Text>
            <View style={styles.symbolGrid}>
              {symbolOptions.map((option) => {
                const selected = symbol === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => setSymbol(option)}
                    style={[
                      styles.symbolChip,
                      selected && styles.symbolChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.symbolChipLabel,
                        selected && styles.symbolChipLabelSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <FormInput
            keyboardType="decimal-pad"
            placeholder="Target price"
            value={targetPrice}
            onChangeText={setTargetPrice}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            label="Save alert"
            loading={loading}
            onPress={handleCreateAlert}
          />
        </SectionCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  contentColumn: {
    width: "100%",
    maxWidth: 460,
    gap: 16,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
  },
  fieldGroup: {
    gap: 12,
  },
  fieldLabel: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
  },
  symbolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symbolChip: {
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#243244",
    backgroundColor: "#0b1220",
  },
  symbolChipSelected: {
    backgroundColor: "rgba(34, 197, 94, 0.14)",
    borderColor: "rgba(34, 197, 94, 0.45)",
  },
  symbolChipLabel: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  symbolChipLabelSelected: {
    color: "#4ade80",
  },
  error: {
    color: "#fca5a5",
    fontSize: 14,
  },
});

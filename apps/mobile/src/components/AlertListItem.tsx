import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import type { Alert } from "../types/api";
import { AlertStatusBadge } from "./AlertStatusBadge";
import { SectionCard } from "./Ui";

type AlertListItemProps = {
  alert: Alert;
  badgeAnimationKey: number;
};

export function AlertListItem({ alert, badgeAnimationKey }: AlertListItemProps) {
  const cardPulse = useRef(new Animated.Value(0)).current;
  const isTriggered = alert.status === "TRIGGERED";

  useEffect(() => {
    if (!isTriggered || badgeAnimationKey === 0) {
      return;
    }

    cardPulse.setValue(0);
    Animated.sequence([
      Animated.timing(cardPulse, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(cardPulse, {
        toValue: 0,
        duration: 700,
        useNativeDriver: false,
      }),
    ]).start();
  }, [badgeAnimationKey, cardPulse, isTriggered]);

  const borderColor = cardPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(15, 23, 42, 0)", "rgba(74, 222, 128, 0.85)"],
  });

  const backgroundColor = cardPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(15, 23, 42, 0.72)", "rgba(21, 128, 61, 0.22)"],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        isTriggered ? { borderColor, backgroundColor } : null,
      ]}
    >
      <SectionCard>
        <View style={styles.row}>
          <Text style={styles.symbol}>{alert.symbol}</Text>
          <AlertStatusBadge
            animationKey={badgeAnimationKey}
            status={alert.status}
          />
        </View>
        <Text style={styles.detail}>
          Target ${alert.targetPrice.toFixed(2)} · Latest{" "}
          {alert.currentPrice ? `$${alert.currentPrice.toFixed(2)}` : "N/A"}
        </Text>
        <Text style={styles.meta}>
          Created {new Date(alert.createdAt).toLocaleString()}
        </Text>
      </SectionCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden",
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
  detail: {
    color: "#e2e8f0",
    fontSize: 15,
  },
  meta: {
    color: "#94a3b8",
    fontSize: 13,
  },
});

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

import type { Alert } from "../types/api";

type AlertStatusBadgeProps = {
  status: Alert["status"];
  animationKey: number;
};

export function AlertStatusBadge({ status, animationKey }: AlertStatusBadgeProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const isTriggered = status === "TRIGGERED";

  useEffect(() => {
    if (!isTriggered || animationKey === 0) {
      return;
    }

    scale.setValue(0.88);
    glow.setValue(0);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [animationKey, glow, isTriggered, scale]);

  return (
    <Animated.View
      style={[
        styles.badge,
        isTriggered ? styles.badgeTriggered : styles.badgeActive,
        {
          transform: [{ scale }],
          shadowOpacity: glow.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.45],
          }),
        },
      ]}
    >
      <Text style={[styles.label, isTriggered ? styles.labelTriggered : null]}>
        {status}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#22c55e",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  badgeActive: {
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
  },
  badgeTriggered: {
    backgroundColor: "rgba(34, 197, 94, 0.24)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.55)",
  },
  label: {
    color: "#bae6fd",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  labelTriggered: {
    color: "#bbf7d0",
  },
});

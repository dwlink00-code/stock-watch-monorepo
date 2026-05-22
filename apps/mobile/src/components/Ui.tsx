import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

export function FormInput(props: TextInputProps) {
  return <TextInput placeholderTextColor="#94a3b8" style={styles.input} {...props} />;
}

export function PrimaryButton(props: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      disabled={props.disabled || props.loading}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.button,
        (props.disabled || props.loading) && styles.buttonDisabled,
        pressed && !props.disabled && styles.buttonPressed,
      ]}
    >
      {props.loading ? (
        <ActivityIndicator color="#0f172a" />
      ) : (
        <Text style={styles.buttonLabel}>{props.label}</Text>
      )}
    </Pressable>
  );
}

export function SectionCard(props: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      {props.title ? <Text style={styles.cardTitle}>{props.title}</Text> : null}
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#243244",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#e2e8f0",
    backgroundColor: "#0b1220",
  },
  button: {
    backgroundColor: "#22c55e",
    borderRadius: 16,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22c55e",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    shadowColor: "#020617",
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
});

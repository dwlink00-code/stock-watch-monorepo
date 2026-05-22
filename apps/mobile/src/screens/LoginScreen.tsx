import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FormInput, PrimaryButton, SectionCard } from "../components/Ui";
import { useAuth } from "../providers/AuthProvider";

export function LoginScreen(props: { onRegisterPress: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@stockwatch.dev");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
    } catch (loginError) {
      setError("Unable to sign in. Check your credentials and API URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.eyebrow}>Finnhub-powered stock alerts</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to view live market data, charts, and your saved price
            alerts.
          </Text>
        </View>

        <SectionCard>
          <FormInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <FormInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="Log in" loading={loading} onPress={handleLogin} />
        </SectionCard>

        <Pressable onPress={props.onRegisterPress}>
          <Text style={styles.link}>Need an account? Create one</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    width: "100%",
    maxWidth: 460,
    gap: 16,
  },
  hero: {
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.25)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eyebrow: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: "#f8fafc",
    fontSize: 36,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    color: "#f87171",
    fontSize: 14,
  },
  link: {
    color: "#38bdf8",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
});

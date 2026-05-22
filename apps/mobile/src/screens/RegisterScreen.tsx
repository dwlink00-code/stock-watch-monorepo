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

export function RegisterScreen(props: { onLoginPress: () => void }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      setLoading(true);
      setError(null);
      await register(name.trim(), email.trim(), password);
    } catch {
      setError("Unable to register. Make sure the backend is running.");
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
            <Text style={styles.eyebrow}>Create your profile</Text>
          </View>
          <Text style={styles.title}>Join Stock Watch</Text>
          <Text style={styles.subtitle}>
            Set up a profile to save alerts and receive price notifications.
          </Text>
        </View>

        <SectionCard>
          <FormInput placeholder="Full name" value={name} onChangeText={setName} />
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
          <PrimaryButton
            label="Create account"
            loading={loading}
            onPress={handleRegister}
          />
        </SectionCard>

        <Pressable onPress={props.onLoginPress}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
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
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eyebrow: {
    color: "#38bdf8",
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

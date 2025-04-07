import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ColorSchemeName,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../hooks/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme, COLORS, FONTS } from "@/hooks/useColorScheme";

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState("tevans3@icloud.com");
  const [password, setPassword] = useState("R@m1500!");
  const [error, setError] = useState("");

  const colorScheme = useColorScheme();

  const styles = createStyles(colorScheme);

  const handleLogin = async () => {
    if (!email) {
      setError("E-Mail is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setError("");
      await signIn(email, password);
    } catch (err) {
      setError("That email and password didn't work.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      style={styles.container}
    >
      <Image
        source={
          colorScheme === "dark"
            ? require("../assets/images/RoadCase-Dark.png")
            : require("../assets/images/RoadCase-Light.png")
        }
        style={styles.logo}
        resizeMode="contain"
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking with your TM...</Text>
          <ActivityIndicator size="large" color={COLORS(colorScheme).PRIMARY} />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Log In</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-Mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tom@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholderTextColor={COLORS(colorScheme).TEXT_SECONDARY}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="tell no one"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              placeholderTextColor={COLORS(colorScheme).TEXT_SECONDARY}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[
                COLORS(colorScheme).PRIMARY,
                COLORS(colorScheme).SECONDARY,
              ]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Log In</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const createStyles = (colorScheme: ColorSchemeName) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS(colorScheme).BACKGROUND,
      padding: 20,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    logo: {
      width: "100%",
      height: 100,
      marginBottom: 0,
      marginTop: 60,
    },
    formContainer: {
      flex: 1,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      marginBottom: 20,
      fontFamily: FONTS.BOLD,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      marginBottom: 5,
      color: COLORS(colorScheme).TEXT_SECONDARY,
    },
    input: {
      borderWidth: 1,
      borderColor: COLORS(colorScheme).BORDER,
      borderRadius: 6,
      padding: 13,
      fontSize: 16,
      color: COLORS(colorScheme).TEXT,
    },
    button: {
      marginTop: 20,
      borderRadius: 8,
      overflow: "hidden",
    },
    gradient: {
      padding: 17,
      alignItems: "center",
    },
    buttonText: {
      color: COLORS(colorScheme).BACKGROUND,
      fontSize: 18,
      fontWeight: "bold",
      fontFamily: FONTS.BOLD,
    },
    linkText: {
      color: COLORS(colorScheme).SECONDARY,
      textAlign: "center",
      marginTop: 20,
    },
    errorText: {
      color: COLORS(colorScheme).ERROR,
      marginBottom: 10,
      fontSize: 14,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
    },
  });

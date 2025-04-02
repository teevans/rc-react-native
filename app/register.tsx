import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ColorSchemeName,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../hooks/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme, COLORS, FONTS } from "@/hooks/useColorScheme";

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const handleRegister = async () => {
    try {
      setError("");

      if (!name) {
        setError("Name is required.");
        return;
      }

      if (!email) {
        setError("E-Mail is required");
        return;
      }

      if (!password || !confirmPassword || password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      await signUp(name, email, password);
    } catch (err) {
      setError(
        "Looks like something went wrong on our end. Give it a few minutes and try again."
      );
    }
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.loadingText}>Setting up your call sheet...</Text>
          <ActivityIndicator size="large" color={COLORS(colorScheme).PRIMARY} />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign Up</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Jeff Shoals"
              autoCapitalize="none"
              autoComplete="name"
            />
          </View>

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
              autoComplete="new-password"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="tell no one"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
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
              <Text style={styles.buttonText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const createStyles = (colorScheme: ColorSchemeName) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS(colorScheme).BACKGROUND,
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

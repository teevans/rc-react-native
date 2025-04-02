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
import { useAuth } from "../hooks/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme, COLORS, FONTS } from "@/hooks/useColorScheme";

export default function OnboardingScreen() {
  const { createTeam, isLoading, signOut } = useAuth();
  const [bandName, setBandName] = useState("");
  const [error, setError] = useState("");
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const handleCreateTeam = async () => {
    try {
      setError("");
      if (!bandName) {
        setError("Band name is required");
        return;
      }
      await createTeam(bandName);
    } catch (err) {
      setError("Failed to create team. Please try again.");
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

      <Text style={styles.title}>Let's get started.</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Setting up your call sheet...</Text>
          <ActivityIndicator size="large" color={COLORS(colorScheme).PRIMARY} />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>What's your band's name?</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Band Name</Text>
            <TextInput
              style={styles.input}
              value={bandName}
              onChangeText={setBandName}
              placeholder="The Bottom Flame Syrups"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateTeam}
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
              <Text style={styles.buttonText}>
                {isLoading ? "Creating..." : "Create Band"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutText}>Log Out</Text>
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
      marginBottom: 40,
    },
    title: {
      fontSize: 30,
      fontWeight: "bold",
      marginBottom: 30,
      fontFamily: FONTS.BOLD,
    },
    subtitle: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 20,
      fontFamily: FONTS.REGULAR,
    },
    formContainer: {
      flex: 1,
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
    logoutButton: {
      marginTop: "auto",
      padding: 20,
    },
    logoutText: {
      color: COLORS(colorScheme).ERROR,
      textAlign: "center",
      fontSize: 16,
    },
  });

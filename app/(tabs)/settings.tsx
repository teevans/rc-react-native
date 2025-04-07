import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  Platform,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import { useAuth } from "@/hooks/AuthContext";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, useColorScheme } from "@/hooks/useColorScheme";

export default function SettingsScreen() {
  const { session, signOut, deactivateUser, isLoading } = useAuth();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ||
    Constants.expoConfig?.android?.versionCode?.toString() ||
    "1";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000" : "#F5F5F8",
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    screenTitle: {
      fontSize: 34,
      lineHeight: 41,
      fontWeight: "bold",
      marginBottom: 32,
      marginTop: Platform.OS === "android" ? 16 : 0,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      marginBottom: 8,
      marginLeft: 16,
      color: colorScheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "#6B6B6B",
      letterSpacing: 0.5,
      fontWeight: "500",
    },
    card: {
      ...Platform.select({
        ios: {
          backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
          borderRadius: 10,
        },
        android: {
          backgroundColor: "transparent",
        },
      }),
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      ...Platform.select({
        ios: {
          borderBottomWidth: 0.5,
          borderBottomColor:
            colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
        android: {
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255, 255, 255, 0.1)",
        },
      }),
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    label: {
      fontSize: 17,
    },
    value: {
      fontSize: 17,
      color: colorScheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "#8E8E93",
    },
    signOutButton: {
      marginVertical: 16,
      padding: 16,
      ...Platform.select({
        ios: {
          backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
          borderRadius: 10,
        },
        android: {
          backgroundColor: "transparent",
          borderRadius: 4,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
        },
      }),
    },
    signOutText: {
      color: "#007AFF",
      fontSize: 17,
      textAlign: "center",
      ...Platform.select({
        android: {
          color: "#BB86FC",
        },
      }),
    },
    deactivateButton: {
      padding: 16,
      ...Platform.select({
        ios: {
          backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
          borderRadius: 10,
        },
        android: {
          backgroundColor: "transparent",
          borderRadius: 4,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
        },
      }),
    },
    deactivateText: {
      color: "#FF453A",
      fontSize: 17,
      textAlign: "center",
      ...Platform.select({
        android: {
          color: "#CF6679",
        },
      }),
    },
  });

  const handleSignOut = () => {
    signOut();
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      "Deactivate Account",
      "Are you sure? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Deactivate Account",
          style: "destructive",
          onPress: () => {
            confirmDeactivation();
          },
        },
      ]
    );
  };

  const confirmDeactivation = () => {
    Alert.alert(
      "Deactivate Account",
      "Your account will be deleted in 30 days. Logging back in will prevent this from happening.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Deactivate Account",
          style: "destructive",
          onPress: async () => {
            setIsDeactivating(true);
            try {
              await deactivateUser();
            } catch (error) {
              console.error("Error deactivating account:", error);
              Alert.alert(
                "Error",
                "Failed to deactivate account. Please try again."
              );
            } finally {
              setIsDeactivating(false);
            }
          },
        },
      ]
    );
  };

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS(colorScheme).PRIMARY} />
      </ThemedView>
    );
  }

  // Show empty state if no user (not logged in)
  if (!session?.user) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ThemedText>Not logged in</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={[styles.scrollView, { paddingTop: insets.top }]}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedText type="title" style={styles.screenTitle}>
          Settings
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ABOUT ME
          </ThemedText>
          <View style={styles.card}>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <ThemedText style={styles.value}>{session.user.name}</ThemedText>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <ThemedText style={styles.label}>E-Mail</ThemedText>
              <ThemedText style={styles.value}>{session.user.email}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            APP INFORMATION
          </ThemedText>
          <View style={styles.card}>
            <View style={styles.row}>
              <ThemedText style={styles.label}>App Version</ThemedText>
              <ThemedText style={styles.value}>{appVersion}</ThemedText>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <ThemedText style={styles.label}>Build</ThemedText>
              <ThemedText style={styles.value}>{buildNumber}</ThemedText>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            DANGER ZONE
          </ThemedText>
          <TouchableOpacity
            style={styles.deactivateButton}
            onPress={handleDeactivateAccount}
            activeOpacity={0.7}
            disabled={isDeactivating}
          >
            {isDeactivating ? (
              <ActivityIndicator
                color={Platform.select({
                  ios: "#FF453A",
                  android: "#CF6679",
                })}
              />
            ) : (
              <ThemedText style={styles.deactivateText}>
                Deactivate Account
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

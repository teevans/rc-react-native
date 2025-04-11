import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, useColorScheme } from "@/hooks/useColorScheme";

export default function NewEventScreen() {
  const params = useLocalSearchParams();
  const { teamId } = params;
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Add Event",
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.formSection}>
          <ThemedText style={styles.headerText}>New Event Form</ThemedText>
          <ThemedText>
            This is a placeholder for the event creation form. In a complete
            implementation, this would include fields for event date, type,
            venue details, schedule, etc.
          </ThemedText>

          <ThemedText style={styles.teamText}>
            Creating event for team ID: {teamId}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formSection: {
    backgroundColor: "rgba(0,0,0,0.03)",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  teamText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
});

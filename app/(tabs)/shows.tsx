import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { COLORS, useColorScheme } from "@/hooks/useColorScheme";
import { useEvents } from "@/hooks/useEvents";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import type { Event } from "@/constants/models";

export default function ShowsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const {
    events,
    teams,
    selectedTeam,
    setSelectedTeam,
    loading,
    error,
    fetchEvents,
    fetchTeams,
  } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);

  // Required roles for event editing
  const requiredEditRoles = ["owner", "admin", "editor"];

  // Check if user can edit events for the selected team
  const canEditEvents = () => {
    if (!selectedTeam) return true; // Allow if all bands selected
    if (!selectedTeam.role) return false;
    return requiredEditRoles.includes(selectedTeam.role);
  };

  // Handle refresh - refreshes both events and teams
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch both events and teams data
      const eventsPromise = fetchEvents();
      const teamsPromise = fetchTeams();

      await Promise.all([eventsPromise, teamsPromise]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchEvents, fetchTeams]);

  useEffect(() => {
    // Initial data load
    fetchEvents();
    fetchTeams();
  }, []); // Empty dependency array to run only once on mount

  const renderEventItem = ({ item }: { item: Event }) => {
    // Format date to get month and day
    const [m, d, y] = item.date.split("/");
    const date = new Date(+y, +m - 1, +d);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();

    return (
      <TouchableOpacity
        style={styles.eventItem}
        onPress={() =>
          router.push({
            pathname: "/event/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.dateContainer}>
          <View style={styles.monthBox}>
            <Text style={styles.monthText}>{month}</Text>
          </View>
          <View style={styles.dayBox}>
            <Text style={styles.dayText}>{day}</Text>
          </View>
        </View>

        <View style={styles.eventDetails}>
          <ThemedText style={styles.venueName}>{item.venue.name}</ThemedText>
          {item.venue && (
            <ThemedText style={styles.venueLocation}>
              {item.venue.city}
              {item.venue.state ? `, ${item.venue.state}` : ""}
            </ThemedText>
          )}
        </View>

        <View style={styles.actionContainer}>
          <View style={styles.bandTypeButton}>
            <Text style={styles.bandTypeText}>{item.event_type.name}</Text>
          </View>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={COLORS(colorScheme).TEXT_SECONDARY}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTeamSelector = () => {
    if (!showTeamSelector) return null;

    return (
      <View
        style={[
          styles.teamSelector,
          { backgroundColor: COLORS(colorScheme).BACKGROUND_SECONDARY },
        ]}
      >
        <TouchableOpacity
          style={styles.teamOption}
          onPress={() => {
            setSelectedTeam(null);
            setShowTeamSelector(false);
          }}
        >
          <ThemedText style={styles.teamOptionText}>All Bands</ThemedText>
        </TouchableOpacity>

        {teams.map((team) => (
          <TouchableOpacity
            key={team.id}
            style={styles.teamOption}
            onPress={() => {
              setSelectedTeam(team);
              setShowTeamSelector(false);
            }}
          >
            <ThemedText style={styles.teamOptionText}>{team.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack.Screen
        options={{
          headerTitle: "Upcoming Shows",
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (selectedTeam === null && teams.length > 1) {
                  // Show team selection dialog first
                  Alert.alert(
                    "Select a band",
                    "Please select a band to add a show for.",
                    teams
                      .filter(
                        (team) =>
                          team.role && requiredEditRoles.includes(team.role)
                      )
                      .map((team) => ({
                        text: team.name,
                        onPress: () =>
                          router.push({
                            pathname: "/event/new",
                            params: { teamId: team.id },
                          }),
                      }))
                  );
                } else if (selectedTeam || teams.length === 1) {
                  // Go directly to add event if a team is already selected or there's only one team
                  const teamId = selectedTeam ? selectedTeam.id : teams[0]?.id;
                  router.push({
                    pathname: "/event/new",
                    params: { teamId },
                  });
                }
              }}
              disabled={!canEditEvents()}
            >
              <IconSymbol
                name="plus"
                size={20}
                color={
                  canEditEvents()
                    ? COLORS(colorScheme).PRIMARY
                    : COLORS(colorScheme).TEXT_TERTIARY
                }
              />
            </TouchableOpacity>
          ),
          headerLeft: () =>
            teams.length > 0 ? (
              <TouchableOpacity
                style={styles.teamButton}
                onPress={() => setShowTeamSelector(!showTeamSelector)}
              >
                <ThemedText style={styles.teamButtonText}>
                  {selectedTeam ? selectedTeam.name : "All Bands"}
                </ThemedText>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {renderTeamSelector()}

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Error loading shows: {error}
          </ThemedText>
        </View>
      )}

      {events.length === 0 && !loading && !error ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No shows yet! Get started by adding one above by tapping the plus
            button.
          </ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <ThemedText style={styles.refreshButtonText}>Refresh</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS(colorScheme).PRIMARY}
            />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  eventItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  dateContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  monthBox: {
    backgroundColor: "#ff3b30",
    paddingVertical: 4,
    alignItems: "center",
  },
  monthText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  dayBox: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
  },
  eventDetails: {
    flex: 1,
    justifyContent: "center",
  },
  venueName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  venueLocation: {
    fontSize: 12,
    color: "#8e8e93",
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bandTypeButton: {
    backgroundColor: "#12b981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 8,
  },
  bandTypeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  eventTypeIndicator: {
    marginRight: 12,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  eventTypeCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  eventDate: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 2,
  },
  eventType: {
    fontSize: 14,
    marginBottom: 2,
  },
  bandName: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  venueText: {
    fontSize: 14,
    opacity: 0.8,
  },
  chevron: {
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: "#6B46C1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#ffdddd",
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
  },
  addButton: {
    padding: 8,
    marginRight: 8,
  },
  teamButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginLeft: 8,
  },
  teamButtonText: {
    fontSize: 14,
  },
  teamSelector: {
    position: "absolute",
    top: -5,
    left: 10,
    zIndex: 10,
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  teamOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  teamOptionText: {
    fontSize: 16,
  },
});

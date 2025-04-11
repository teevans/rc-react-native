import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, useColorScheme } from "@/hooks/useColorScheme";
import type { Event } from "@/constants/models";
import { API_ENDPOINTS } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@/hooks/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { session } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Required roles for event editing
  const requiredEditRoles = ["owner", "admin", "editor"];

  // Check if user can edit this event
  const canEditEvent = () => {
    if (!event || !event.team || !event.team.role) return false;
    return requiredEditRoles.includes(event.team.role);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Extract month from date
  const getMonth = (dateString: string) => {
    const [month] = dateString.split("/");
    const date = new Date(2000, parseInt(month) - 1, 1);
    return date.toLocaleString("en-US", { month: "short" });
  };

  // Extract day from date
  const getDay = (dateString: string) => {
    const [, day] = dateString.split("/");
    return day;
  };

  // Load event details
  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token =
        session?.token || (await AsyncStorage.getItem("@roadcase_auth_token"));

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_ENDPOINTS.UPCOMING_EVENTS}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }

      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching event details:", err);
    } finally {
      setLoading(false);
    }
  }, [id, session]);

  // Handle event deletion
  const handleDeleteEvent = async () => {
    try {
      setLoading(true);

      const token =
        session?.token || (await AsyncStorage.getItem("@roadcase_auth_token"));

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.DELETE_EVENT(id as string), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Go back to shows list
      router.replace("/(tabs)/shows");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error deleting event:", err);
      Alert.alert("Error", "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  // Confirm deletion with alert
  const confirmDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDeleteEvent },
      ]
    );
  };

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: event?.venue?.name || "Event Details",
          headerRight: () =>
            canEditEvent() ? (
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => router.push(`/event/edit?id=${id}`)}
                >
                  <IconSymbol
                    name="square.and.pencil"
                    size={20}
                    color={COLORS(colorScheme).PRIMARY}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={confirmDelete}
                >
                  <IconSymbol
                    name="trash"
                    size={20}
                    color={COLORS(colorScheme).ERROR}
                  />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS(colorScheme).PRIMARY} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchEventDetails}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : event ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <View style={styles.eventDetailsContainer}>
                {/* Calendar date display */}
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <Text style={styles.calendarMonth}>
                      {getMonth(event.date)}
                    </Text>
                  </View>
                  <View style={styles.calendarBody}>
                    <Text style={styles.calendarDay}>{getDay(event.date)}</Text>
                  </View>
                </View>

                <View style={styles.venueInfoContainer}>
                  <ThemedText style={styles.venueName}>
                    {event.billings && event.billings.length > 0
                      ? event.billings[0].name
                      : ""}
                  </ThemedText>
                  <ThemedText style={styles.venueLocation}>
                    {event.venue?.city || ""}
                    {event.venue?.state ? `, ${event.venue.state}` : ""}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Files Section */}
            <TouchableOpacity style={styles.filesButton}>
              <ThemedText style={styles.filesButtonText}>Files</ThemedText>
            </TouchableOpacity>

            {/* Notes Section */}
            {event.notes && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
                <ThemedText style={styles.notesText}>
                  {event.notes.split("\n").map((line, i) => (
                    <React.Fragment key={`note-line-${i}`}>
                      {i > 0 && <Text>{"\n"}</Text>}
                      {line}
                    </React.Fragment>
                  ))}
                </ThemedText>
              </View>
            )}

            {/* Billing Section */}
            {event.billings && event.billings.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Billing</ThemedText>
                {event.billings
                  .sort((a, b) => a.position - b.position)
                  .map((billing, index) => (
                    <View key={billing.id} style={styles.billingItem}>
                      <View style={styles.billingInitials}>
                        <Text style={styles.billingInitialsText}>
                          {billing.name
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </Text>
                      </View>
                      <View style={styles.billingDetails}>
                        <ThemedText style={styles.billingName}>
                          {billing.name}
                        </ThemedText>
                        <ThemedText style={styles.billingPosition}>
                          {index === 0 ? "Headliner" : "Direct Support"}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Venue Section */}
            {event.venue && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Venue</ThemedText>
                <ThemedText style={styles.venueName}>
                  {event.venue.name || ""}
                </ThemedText>
                <ThemedText style={styles.venueAddress}>
                  {event.venue.address1 || ""}
                </ThemedText>
                <ThemedText style={styles.venueLocation}>
                  {event.venue.city || ""}
                  {event.venue?.state ? `, ${event.venue.state}` : ""}{" "}
                  {event.venue.zip || ""}
                </ThemedText>
              </View>
            )}

            {/* Venue Contacts Section */}
            {event.venue?.venue_contacts &&
              event.venue.venue_contacts.length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>
                    Venue Contacts
                  </ThemedText>
                  {event.venue.venue_contacts.map((contact) => (
                    <View key={contact.id} style={styles.contactItem}>
                      <View style={styles.contactInitials}>
                        <Text style={styles.contactInitialsText}>
                          {contact.name
                            ? contact.name
                                .split(" ")
                                .map((name) => name[0])
                                .join("")
                                .toUpperCase()
                                .substring(0, 2)
                            : ""}
                        </Text>
                      </View>
                      <View style={styles.contactDetails}>
                        <ThemedText style={styles.contactName}>
                          {contact.name || ""}
                        </ThemedText>
                        <ThemedText style={styles.contactRole}>
                          {contact.role || ""}
                        </ThemedText>
                      </View>
                      <View style={styles.contactActions}>
                        <TouchableOpacity style={styles.contactActionButton}>
                          <IconSymbol
                            name="mail"
                            size={20}
                            color={COLORS(colorScheme).TEXT_SECONDARY}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactActionButton}>
                          <IconSymbol
                            name="call"
                            size={20}
                            color={COLORS(colorScheme).TEXT_SECONDARY}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

            {/* Schedule Section */}
            {event.schedule_items && event.schedule_items.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Schedule</ThemedText>
                {event.schedule_items
                  .sort((a, b) => {
                    // Sort by start_day_offset first
                    if (a.start_day_offset !== b.start_day_offset) {
                      return (
                        (a.start_day_offset || 0) - (b.start_day_offset || 0)
                      );
                    }
                    // Then sort by start_time
                    const timeA = new Date(`2000-01-01T${a.start_time}`);
                    const timeB = new Date(`2000-01-01T${b.start_time}`);
                    return timeA.getTime() - timeB.getTime();
                  })
                  .map((item) => (
                    <View key={item.id} style={styles.scheduleItem}>
                      <View style={styles.scheduleMarker} />
                      <View style={styles.scheduleContent}>
                        <ThemedText style={styles.scheduleTitle}>
                          {item.title}
                        </ThemedText>
                        <ThemedText style={styles.scheduleTime}>
                          {item.start_day_offset === 1
                            ? `${new Date(
                                `2000-01-01T${item.start_time}`
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })} Day after`
                            : item.start_day_offset === -1
                            ? `${new Date(
                                `2000-01-01T${item.start_time}`
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })} Day before`
                            : item.end_time
                            ? `${new Date(
                                `2000-01-01T${item.start_time}`
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })} - ${new Date(
                                `2000-01-01T${item.end_time}`
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })} (${getDuration(
                                item.start_time,
                                item.end_time
                              )})`
                            : new Date(
                                `2000-01-01T${item.start_time}`
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Delete Show Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDelete}
            >
              <ThemedText style={styles.deleteButtonText}>
                Delete Show
              </ThemedText>
            </TouchableOpacity>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </GestureHandlerRootView>
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Event not found</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

// Helper function to calculate duration between two times
function getDuration(startTime: string, endTime: string): string {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let hourDiff = endHour - startHour;
  let minDiff = endMin - startMin;

  if (minDiff < 0) {
    hourDiff--;
    minDiff += 60;
  }

  if (hourDiff < 0) {
    hourDiff += 24; // Assuming the event doesn't span multiple days
  }

  const hours = hourDiff > 0 ? `${hourDiff} hr` : "";
  const mins = minDiff > 0 ? `${minDiff} mins` : "";

  if (hours && mins) {
    return `${hours} ${mins}`;
  }
  return hours || mins || "0 mins";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  headerButtons: {
    flexDirection: "row",
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#6B46C1",
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  eventTitleContainer: {
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  eventDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBDBDB",
    overflow: "hidden",
    marginRight: 15,
  },
  calendarHeader: {
    backgroundColor: "#FF3B30",
    padding: 3,
    alignItems: "center",
  },
  calendarMonth: {
    color: "white",
    fontWeight: "bold",
  },
  calendarBody: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarDay: {
    fontSize: 30,
    fontWeight: "bold",
  },
  venueInfoContainer: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 16,
    marginBottom: 2,
  },
  venueLocation: {
    fontSize: 16,
    color: "#666",
  },
  filesButton: {
    backgroundColor: "white",
    padding: 15,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  filesButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
    color: "#777",
  },
  notesText: {
    fontSize: 16,
    lineHeight: 22,
  },
  billingItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  billingInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  billingInitialsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  billingDetails: {
    flex: 1,
  },
  billingName: {
    fontSize: 16,
    fontWeight: "500",
  },
  billingPosition: {
    fontSize: 14,
    color: "#666",
  },
  contactItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  contactInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInitialsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
  },
  contactRole: {
    fontSize: 14,
    color: "#666",
  },
  contactActions: {
    flexDirection: "row",
  },
  contactActionButton: {
    marginLeft: 12,
  },
  contactActionIcon: {
    fontSize: 20,
  },
  scheduleItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  scheduleMarker: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#6366F1",
    marginRight: 12,
    marginTop: 5,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 40,
  },
});

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "@/constants/api";
import { Event, Team } from "@/constants/models";
import { useAuth } from "./AuthContext";

const TOKEN_KEY = "auth_token";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session } = useAuth();

  // Get filtered events based on selected team
  const filteredEvents = selectedTeam
    ? events.filter((event) => event.team_id === selectedTeam.id)
    : events;

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = session?.token || (await AsyncStorage.getItem(TOKEN_KEY));

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.UPCOMING_EVENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams from API
  const fetchTeams = async () => {
    try {
      const token = session?.token || (await AsyncStorage.getItem(TOKEN_KEY));

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.ALL_TEAMS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const data = await response.json();
      setTeams(data);

      // If there's only one team, select it automatically
      if (data.length === 1) {
        setSelectedTeam(data[0]);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  // Create a new event
  const createEvent = async (eventData: any) => {
    try {
      setLoading(true);

      const token = session?.token || (await AsyncStorage.getItem(TOKEN_KEY));

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.CREATE_EVENT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      // Refresh events list
      await fetchEvents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating event:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string) => {
    try {
      setLoading(true);

      const token = session?.token || (await AsyncStorage.getItem(TOKEN_KEY));

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.DELETE_EVENT(eventId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Update local state
      setEvents(events.filter((event) => event.id !== eventId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error deleting event:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load events and teams on init
  useEffect(() => {
    if (session?.token) {
      fetchEvents();
      fetchTeams();
    }
  }, [session]);

  return {
    events: filteredEvents,
    allEvents: events,
    teams,
    selectedTeam,
    setSelectedTeam,
    loading,
    error,
    fetchEvents,
    fetchTeams,
    createEvent,
    deleteEvent,
  };
}

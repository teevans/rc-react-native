import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";
import { API_ENDPOINTS } from "../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createTeam: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "@roadcase_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        // Verify token by fetching user profile
        const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setSession({
            token: storedToken,
            user: userData,
          });
        } else {
          // Token is invalid, clear it
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          device_name: "RoadCase-ReactNative",
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      // Store token
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      setSession(data);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      // Store token
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      setSession(data);
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear stored token
      await AsyncStorage.removeItem(TOKEN_KEY);
      setSession(null);
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const createTeam = async (name: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.CREATE_TEAM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        createTeam,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

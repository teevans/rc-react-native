import React, { createContext, useContext, useReducer, useEffect } from "react";
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

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: "SET_SESSION"; payload: AuthSession | null }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  session: null,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_SESSION":
      return { ...state, session: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  deactivateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "@roadcase_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

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
          dispatch({
            type: "SET_SESSION",
            payload: { token: storedToken, user: userData },
          });
        } else {
          // Token is invalid, clear it
          await AsyncStorage.removeItem(TOKEN_KEY);
          dispatch({ type: "SET_SESSION", payload: null });
        }
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
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
      console.log("AuthContext - Login Response:", data);

      // Store token
      await AsyncStorage.setItem(TOKEN_KEY, data.token);

      // Fetch user profile after login
      const userResponse = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await userResponse.json();
      console.log("AuthContext - User Profile:", userData);

      // Update session state with both token and user data
      const sessionData = {
        token: data.token,
        user: userData,
      };
      dispatch({ type: "SET_SESSION", payload: sessionData });
      console.log("AuthContext - Session Updated:", sessionData);

      router.replace("/(tabs)/shows");
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
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
      dispatch({ type: "SET_SESSION", payload: data });
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const signOut = async () => {
    try {
      // Clear stored token
      await AsyncStorage.removeItem(TOKEN_KEY);
      dispatch({ type: "SET_SESSION", payload: null });
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const deactivateUser = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch(API_ENDPOINTS.DEACTIVATE_USER, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.session?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate account");
      }

      // Sign out after deactivation
      await signOut();
    } catch (error) {
      console.error("Error deactivating account:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createTeam = async (name: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch(API_ENDPOINTS.CREATE_TEAM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.session?.token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      router.replace("/(tabs)/shows");
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session: state.session,
        isLoading: state.isLoading,
        signIn,
        signUp,
        signOut,
        createTeam,
        deactivateUser,
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

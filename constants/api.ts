import { API_BASE_URL } from './config';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  USER_PROFILE: `${API_BASE_URL}/user`,
  
  // Shows/Events endpoints
  UPCOMING_EVENTS: `${API_BASE_URL}/events`,
  CREATE_EVENT: `${API_BASE_URL}/events/create`,
  DELETE_EVENT: (eventId: string) => `${API_BASE_URL}/events/${eventId}`,
  UPDATE_EVENT: (eventId: string) => `${API_BASE_URL}/events/${eventId}/edit`,
  
  // Teams endpoints
  ALL_TEAMS: `${API_BASE_URL}/v2/teams`,
  TEAM_DETAILS: (teamId: string) => `${API_BASE_URL}/team/${teamId}`,
  CREATE_TEAM: `${API_BASE_URL}/teams/create`,
  TEAM_INVITATIONS: `${API_BASE_URL}/teams/invitations`,
  TEAM_INVITATION: (invitationId: string) => `${API_BASE_URL}/teams/invitations/${invitationId}`,
  DELETE_TEAM_INVITATION: (invitationId: string) => `${API_BASE_URL}/teams/invitations/${invitationId}/delete`,
  INVITE_USER: (teamId: string) => `${API_BASE_URL}/teams/${teamId}/invitations`,
  LEAVE_TEAM: (teamId: string) => `${API_BASE_URL}/team/${teamId}/leave`,
}; 
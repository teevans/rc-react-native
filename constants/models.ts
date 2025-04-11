// Event Models
export interface Event {
  id: string;
  event_type_id: string;
  date: string;
  team_id: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
  event_type: EventType;
  venue?: Venue;
  team?: Team;
  billings?: EventBilling[];
  schedule_items?: ScheduleItem[];
}

export interface EventType {
  id: string;
  name: string;
  color?: string;
}

export interface Venue {
  id: string;
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  capacity?: string;
  event_id: string;
  created_at: string;
  updated_at: string;
  latitude?: string;
  longitude?: string;
  venue_contacts: VenueContact[];
}

export interface VenueContact {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface EventBilling {
  id: string;
  name: string;
  position: number;
  event_id: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes?: string;
  start_day_offset: number;
  event_id: string;
  created_at: string;
  updated_at: string;
}

// Team Models
export interface Team {
  id: string;
  name: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  team?: Team;
}

// API Request/Response Models
export interface CreateEventRequest {
  date: string;
  notes: string;
  team_id: string;
  event_type: string;
  status: string;
  venue_name: string;
  venue_address1: string;
  venue_city: string;
  venue_state: string;
  venue_zip: string;
  venue_latitude: string;
  venue_longitude: string;
  billings: {
    name: string;
    position: number;
  }[];
  contacts: {
    name: string;
    role: string;
    phone: string;
    email: string;
  }[];
  schedule_items: {
    title: string;
    start_time: string;
    end_time: string;
    notes: string;
    start_day_offset: number;
  }[];
} 
import { api } from "./client";

export interface EventCreate {
  title: string;
  description: string;
  action_id: string;
  start_date: string;
  end_date: string;
  location_name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  max_participants: number;
  points: number;
  photo_url?: string | null;
  status?: string;
}

export type EventUpdate = Partial<EventCreate>;

export interface EventListResponse {
  id: string;
  title: string;
  description: string;
  promoter_name?: string | null;
  action_name?: string | null;
  start_date: string;
  end_date: string;
  location_name: string;
  max_participants: number;
  points: number;
  status: string;
  photo_url?: string | null;
  participant_count?: number;
}

export interface EventResponse extends EventListResponse {
  promoter_id: string;
  promoter_photo?: string | null;
  action_id: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
}

export type EventParticipant = {
  id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  registration?: string | null;
  course?: string | null;
  phone?: string | null;
  motivation?: string | null;
  created_at?: string;
  registered_at?: string;
  [key: string]: unknown;
};

export async function listEvents(): Promise<EventListResponse[]> {
  const response = await api.get<EventListResponse[]>("/events/");
  return response.data;
}

export async function getEvent(eventId: string): Promise<EventResponse> {
  const response = await api.get<EventResponse>(`/events/${eventId}`);
  return response.data;
}

export async function createEvent(
  userId: string,
  payload: EventCreate,
): Promise<Record<string, unknown>> {
  const response = await api.post<Record<string, unknown>>("/events/", payload, {
    headers: { "x-user-id": userId },
  });
  return response.data;
}

export async function updateEvent(
  eventId: string,
  userId: string,
  payload: EventUpdate,
): Promise<Record<string, unknown>> {
  const response = await api.put<Record<string, unknown>>(
    `/events/${eventId}`,
    payload,
    {
      headers: { "x-user-id": userId },
    },
  );
  return response.data;
}

export async function getMyEvents(userId: string): Promise<EventResponse[]> {
  const response = await api.get<EventResponse[]>("/events/my/events", {
    headers: { "x-user-id": userId },
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function subscribeEvent(
  eventId: string,
  userId: string,
): Promise<Record<string, unknown>> {
  const response = await api.post<Record<string, unknown>>(
    `/events/${eventId}/register`,
    null,
    {
      headers: { "x-user-id": userId },
    },
  );
  return response.data;
}

export async function unsubscribeEvent(
  eventId: string,
  userId: string,
): Promise<Record<string, unknown>> {
  const response = await api.delete<Record<string, unknown>>(
    `/events/${eventId}/register`,
    {
      headers: { "x-user-id": userId },
    },
  );
  return response.data;
}

export async function getEventParticipants(
  eventId: string,
): Promise<EventParticipant[]> {
  const response = await api.get<unknown>(`/events/${eventId}/participants`);
  const data = response.data;

  if (Array.isArray(data)) {
    return data.filter(isParticipant);
  }

  if (isRecord(data)) {
    const candidates = [data.participants, data.data, data.items];
    const list = candidates.find(Array.isArray);
    return Array.isArray(list) ? list.filter(isParticipant) : [];
  }

  return [];
}

function isParticipant(value: unknown): value is EventParticipant {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

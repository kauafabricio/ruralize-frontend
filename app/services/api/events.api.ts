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
  payload: EventCreate,
): Promise<Record<string, unknown>> {
  const response = await api.post<Record<string, unknown>>("/events/", payload);
  return response.data;
}

export async function updateEvent(
  eventId: string,
  payload: EventUpdate,
): Promise<Record<string, unknown>> {
  const response = await api.put<Record<string, unknown>>(
    `/events/${eventId}`,
    payload,
  );
  return response.data;
}

export async function getMyEvents(): Promise<EventResponse[]> {
  const response = await api.get<unknown>("/events/my/events");
  const data = response.data;
  // Handle direct array response
  if (Array.isArray(data)) {
    return data;
  }

  // Handle nested structures
  if (isRecord(data)) {
    const candidates = [data.events, data.data, data.items];
    const list = candidates.find(Array.isArray);
    if (Array.isArray(list)) return list;
  }

  return [];
}

export async function subscribeEvent(
  eventId: string,
  payload?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await api.post<Record<string, unknown>>(
    `/events/${eventId}/subscribe`,
    payload ?? {},
  );

  if (!response.data) {
    throw new Error("Resposta vazia do servidor");
  }

  if (response.data.error) {
    const errorMessage =
      typeof response.data.message === "string"
        ? response.data.message
        : typeof response.data.error === "string"
          ? response.data.error
          : "Falha ao inscrever";
    throw new Error(errorMessage);
  }

  return response.data;
}

export async function unsubscribeEvent(
  eventId: string,
): Promise<Record<string, unknown>> {
  const response = await api.delete<Record<string, unknown>>(
    `/events/${eventId}/unsubscribe`,
  );
  return response.data;
}

export async function updateParticipantStatus(
  eventId: string,
  participantUserId: string,
  status: string,
): Promise<Record<string, unknown>> {
  const response = await api.patch<Record<string, unknown>>(
    `/events/${eventId}/participants/${participantUserId}/status`,
    { status },
  );
  return response.data;
}

export async function getMyEventRegistration(
  eventId: string,
): Promise<EventParticipant | null> {
  try {
    const response = await api.get<EventParticipant>(
      `/events/${eventId}/participants/me`,
    );
    return response.data;
  } catch (err) {
    // Endpoint may not exist, return null gracefully
    return null;
  }
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
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).user_id === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

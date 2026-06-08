import type { Appointment } from "./appointments";
import type { AuthUser } from "./auth";
import type {
  EventCreate,
  EventListResponse,
  EventResponse,
  EventUpdate,
} from "@/app/services/api/events.api";

export type UserCreatedEvent = Appointment & {
  id: string;
  creatorId: string;
  creatorName: string;
  createdAt?: string;
  updatedAt?: string;
  participantCount?: number;
  actionId?: string;
  maxParticipants?: number;
  points?: number;
  raw?: EventResponse | EventListResponse;
};

export type UserEventInput = {
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  category: string;
  shortDescription: string;
  summary: string;
  image: string;
  tags: string;
  maxParticipants: string;
  points: string;
};

export function isTeacherUser(user: AuthUser | null | undefined) {
  const candidates = [
    user?.role,
    readRawString(user?.raw, ["role", "tipo", "type", "perfil", "userType"]),
  ];

  return candidates.some((value) =>
    ["teacher", "professor", "docente"].includes(normalizeRole(value)),
  );
}

export function isTeacherRole(role: string | null | undefined) {
  return ["teacher", "professor", "docente"].includes(normalizeRole(role));
}

export function eventToAppointment(event: EventListResponse | EventResponse) {
  const startDate = parseApiDate(event.start_date);
  const endDate = parseApiDate(
    "end_date" in event ? event.end_date : event.start_date,
  );
  const category = event.action_name ?? "Evento";
  const appointment: Appointment = {
    slug: event.id,
    status: event.status || "Disponivel",
    date: formatDate(startDate),
    compactDate: `${formatShortDate(startDate)} - ${formatTime(startDate)}`,
    title: event.title,
    location: event.location_name,
    address: "address" in event ? event.address : event.location_name,
    time: `${formatDate(startDate)} as ${formatTime(startDate)}${
      endDate ? ` ate ${formatTime(endDate)}` : ""
    }`,
    organizer: event.promoter_name ?? "Docente Ruralize",
    organizerRole: category,
    tags: [category, `${event.points} pontos`],
    category,
    shortDescription: event.description,
    summary: event.description,
    image:
      event.photo_url ||
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=85",
  };

  return appointment;
}

export function eventToUserCreatedEvent(event: EventResponse | EventListResponse) {
  const appointment = eventToAppointment(event);

  return {
    ...appointment,
    id: event.id,
    creatorId: "promoter_id" in event ? event.promoter_id : "",
    creatorName: event.promoter_name ?? "Docente Ruralize",
    createdAt: "created_at" in event ? event.created_at : undefined,
    updatedAt: "updated_at" in event ? event.updated_at : undefined,
    participantCount: event.participant_count ?? 0,
    actionId: "action_id" in event ? event.action_id : undefined,
    maxParticipants: event.max_participants,
    points: event.points,
    raw: event,
  } satisfies UserCreatedEvent;
}

const CREATED_EVENTS_STORAGE_KEY = "ruralize.createdEvents";

export function readCreatedEvent(slug: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const createdEvents = readJsonRecord<UserCreatedEvent>(
    CREATED_EVENTS_STORAGE_KEY,
  );

  const createdEvent = createdEvents[slug];
  return createdEvent ? userCreatedEventToAppointment(createdEvent) : null;
}

export function readUserCreatedEvents() {
  if (typeof window === "undefined") {
    return [] as Appointment[];
  }

  const createdEvents = readJsonRecord<UserCreatedEvent>(
    CREATED_EVENTS_STORAGE_KEY,
  );

  return Object.values(createdEvents).map(userCreatedEventToAppointment);
}

export function readEventsByCreator(creatorId: string | null | undefined) {
  if (typeof window === "undefined") {
    return [] as UserCreatedEvent[];
  }

  if (!creatorId) {
    return [];
  }

  const createdEvents = readJsonRecord<UserCreatedEvent>(
    CREATED_EVENTS_STORAGE_KEY,
  );

  return Object.values(createdEvents).filter(
    (event) => event.creatorId === creatorId,
  );
}

export function saveUserCreatedEvent(
  input: UserEventInput,
  user: AuthUser,
  slug?: string,
) {
  if (typeof window === "undefined") {
    return null;
  }

  const createdEvents = readJsonRecord<UserCreatedEvent>(
    CREATED_EVENTS_STORAGE_KEY,
  );

  const eventSlug = slug ?? createEventSlug(input.title, createdEvents);
  const existingEvent = createdEvents[eventSlug];
  const startDate = parseInputDateTime(input.date, input.time);
  const tags = input.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const nextEvent: UserCreatedEvent = {
    slug: eventSlug,
    status: existingEvent?.status ?? "Disponivel",
    date: formatDate(startDate),
    compactDate: `${formatShortDate(startDate)} - ${formatTime(startDate)}`,
    title: input.title.trim(),
    location: input.location.trim(),
    address: input.address.trim(),
    time: `${formatDate(startDate)} as ${formatTime(startDate)}`,
    organizer: user.name ?? "Docente Ruralize",
    organizerRole: input.category.trim() || "Evento",
    tags: tags.length > 0 ? tags : [input.category.trim() || "Evento"],
    category: input.category.trim() || "Evento",
    shortDescription: input.shortDescription.trim(),
    summary: input.summary.trim(),
    image:
      input.image.trim() ||
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=85",
    id: eventSlug,
    creatorId: user.id,
    creatorName: user.name ?? "Docente Ruralize",
    createdAt: existingEvent?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participantCount: existingEvent?.participantCount ?? 0,
    actionId: input.category.trim() || existingEvent?.actionId,
    maxParticipants: parseInteger(input.maxParticipants, 30),
    points: parseInteger(input.points, 10),
    raw: existingEvent?.raw,
  };

  createdEvents[eventSlug] = nextEvent;
  window.localStorage.setItem(
    CREATED_EVENTS_STORAGE_KEY,
    JSON.stringify(createdEvents),
  );

  return nextEvent;
}

function createEventSlug(
  title: string,
  createdEvents: Record<string, UserCreatedEvent>,
) {
  const baseSlug =
    title
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "evento";
  let candidate = baseSlug;
  let suffix = 2;

  while (createdEvents[candidate]) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function userCreatedEventToAppointment(event: UserCreatedEvent): Appointment {
  return {
    slug: event.id,
    status: event.status,
    date: event.date,
    compactDate: event.compactDate,
    title: event.title,
    location: event.location,
    address: event.address,
    time: event.time,
    organizer: event.organizer,
    organizerRole: event.organizerRole,
    tags: event.tags,
    category: event.category,
    shortDescription: event.shortDescription,
    summary: event.summary,
    image: event.image,
  };
}

function readJsonRecord<T>(storageKey: string) {
  const currentValue = window.localStorage.getItem(storageKey);

  if (!currentValue) {
    return {} as Record<string, T>;
  }

  try {
    const parsedValue = JSON.parse(currentValue);
    return isRecord(parsedValue) ? (parsedValue as Record<string, T>) : {};
  } catch {
    return {} as Record<string, T>;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createEventPayload(input: UserEventInput): EventCreate {
  const startDate = parseInputDateTime(input.date, input.time);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  return {
    title: input.title.trim(),
    description: buildDescription(input),
    action_id: input.category.trim() || "general",
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    location_name: input.location.trim(),
    address: input.address.trim(),
    max_participants: parseInteger(input.maxParticipants, 30),
    points: parseInteger(input.points, 10),
    photo_url: input.image.trim() || null,
    status: "published",
  };
}

export function updateEventPayload(input: UserEventInput): EventUpdate {
  return createEventPayload(input);
}

export function eventToInput(event: UserCreatedEvent): UserEventInput {
  const startDate = event.raw?.start_date
    ? parseApiDate(event.raw.start_date)
    : new Date();

  return {
    title: event.title,
    date: toDateInputValue(startDate),
    time: toTimeInputValue(startDate),
    location: event.location,
    address: event.address,
    category: event.actionId ?? event.category,
    shortDescription: event.shortDescription,
    summary: event.summary,
    image: event.image,
    tags: event.tags.join(", "),
    maxParticipants: String(event.maxParticipants ?? 30),
    points: String(event.points ?? 10),
  };
}

function buildDescription(input: UserEventInput) {
  const summary = input.summary.trim();
  const shortDescription = input.shortDescription.trim();

  if (!summary) {
    return shortDescription;
  }

  if (!shortDescription || summary.includes(shortDescription)) {
    return summary;
  }

  return `${shortDescription}\n\n${summary}`;
}

function parseInputDateTime(date: string, time: string) {
  const normalizedDate = date.trim();
  const normalizedTime = time.trim();
  const parsed = new Date(
    normalizedDate && normalizedTime
      ? `${normalizedDate}T${normalizedTime}`
      : normalizedDate || Date.now(),
  );

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseApiDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toTimeInputValue(date: Date) {
  return date.toTimeString().slice(0, 5);
}

function normalizeRole(role: string | null | undefined) {
  return (role ?? "").trim().toLowerCase();
}

function readRawString(
  raw: Record<string, unknown> | undefined,
  keys: string[],
) {
  if (!raw) {
    return undefined;
  }

  for (const key of keys) {
    const value = raw[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}
